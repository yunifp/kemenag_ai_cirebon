import { makeWASocket, useMultiFileAuthState, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import path from 'path';
import { prisma } from '../lib/prisma';
import { aiService } from './aiService';

class WhatsAppService {
  private sock: WASocket | null = null;
  private qrCodeBase64: string = '';
  private connectionStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';

  async initialize() {
    console.log('Initializing WhatsApp Service...');
    const sessionDir = path.join(__dirname, '../../sessions');
    
    // Auth State
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: true, // We also print to terminal for debugging
      logger: pino({ level: 'silent' }) as any,
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.connectionStatus = 'CONNECTING';
        try {
          this.qrCodeBase64 = await QRCode.toDataURL(qr);
        } catch (err) {
          console.error('Failed to generate QR Code Data URL', err);
        }
      }

      if (connection === 'close') {
        this.connectionStatus = 'DISCONNECTED';
        this.qrCodeBase64 = '';
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('WhatsApp connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
        if (shouldReconnect) {
          this.initialize(); // Auto reconnect
        }
      } else if (connection === 'open') {
        console.log('WhatsApp connection opened successfully!');
        this.connectionStatus = 'CONNECTED';
        this.qrCodeBase64 = ''; // Clear QR since connected
      }
    });

    // Listen to incoming messages
    this.sock.ev.on('messages.upsert', async (m) => {
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message && msg.key.remoteJid) {
            const sender = msg.key.remoteJid;
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            
            if (!text) continue;

            console.log(`[WA] Pesan dari ${sender}: ${text}`);

            try {
              // 1. Dapatkan atau Buat ChatSession
              let session = await prisma.chatSession.findFirst({
                where: { phoneNumber: sender }
              });

              if (!session) {
                session = await prisma.chatSession.create({
                  data: { phoneNumber: sender, status: 'BOT' }
                });
              }

              const isAskingForHelp = text.toLowerCase().includes('bantuan') || text.toLowerCase().includes('cs');
              let triggerHandoff = isAskingForHelp;

              if (session.status === 'BOT' && !triggerHandoff) {
                console.log(`[WA] Mengirim ke AI Engine untuk ${sender}...`);
                const answer = await aiService.askQuestion(text);
                const isFail = answer.toLowerCase().includes('maaf') || answer.toLowerCase().includes('tidak tahu') || answer.toLowerCase().includes('belum memiliki informasi');
                
                let currentFailCount = session.botFailCount || 0;
                if (isFail) {
                  currentFailCount += 1;
                } else {
                  currentFailCount = 0; // reset
                }

                if (currentFailCount >= 3) {
                  triggerHandoff = true;
                }

                // Update fail count
                session = await prisma.chatSession.update({
                  where: { id: session.id },
                  data: { botFailCount: currentFailCount }
                });

                if (!triggerHandoff) {
                  await this.sock?.sendMessage(sender, { text: answer });
                  await prisma.chatMessage.create({
                    data: { sessionId: session.id, senderType: 'BOT', content: answer }
                  });
                }
              }

              if (triggerHandoff && session.status !== 'PENDING_HANDOFF') {
                session = await prisma.chatSession.update({
                  where: { id: session.id },
                  data: { status: 'PENDING_HANDOFF' }
                });
                await this.sock?.sendMessage(sender, { text: 'Mohon tunggu sebentar, Anda sedang dialihkan ke petugas Customer Service Kemenag karena bot belum dapat menjawab pertanyaan Anda.' });
                
                try {
                  const { getIo } = require('../lib/socket');
                  const notif = await prisma.notification.create({
                    data: {
                      title: 'Tiket Bantuan Baru',
                      message: `Permintaan bantuan CS dari nomor ${sender}`,
                      link: '/dashboard/tickets'
                    }
                  });
                  getIo().emit('new_notification', notif);
                } catch (e) {
                  console.error('Socket notif error:', e);
                }
              }

              await prisma.chatMessage.create({
                data: {
                  sessionId: session.id,
                  senderType: 'USER',
                  content: text
                }
              });

            } catch (err) {
              console.error('Error saving message to DB:', err);
            }
          }
        }
      }
    });
  }

  // Fungsi untuk membalas dari Dashboard
  public async sendMessage(waNumber: string, text: string) {
    if (!this.sock) throw new Error('WhatsApp is not connected');
    await this.sock.sendMessage(waNumber, { text });
  }

  public getStatus() {
    return this.connectionStatus;
  }

  public getQrCode() {
    return this.qrCodeBase64;
  }
}

export const waService = new WhatsAppService();
