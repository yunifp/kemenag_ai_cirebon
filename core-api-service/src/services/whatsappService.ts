import { makeWASocket, useMultiFileAuthState, DisconnectReason, WASocket, generateWAMessageFromContent, getAggregateVotesInPollMessage, WAMessage } from '@whiskeysockets/baileys';
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
  private pollCache = new Map<string, WAMessage>();

  async initialize() {
    console.log('Initializing WhatsApp Service...');
    const sessionDir = path.join(__dirname, '../../sessions');
    
    // Auth State
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    this.sock = makeWASocket({
      auth: state,
      printQRInTerminal: true, // We also print to terminal for debugging
      logger: pino({ level: 'silent' }) as any,
      getMessage: async (key) => {
        return this.pollCache.get(key.id!)?.message || undefined;
      },
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
    
    this.sock.ev.on('messages.update', async (m) => {
      for (const update of m) {
        if (update.update.pollUpdates && update.key.id) {
          console.log('[WA] Received poll update for msg ID:', update.key.id);
          const pollCreation = this.pollCache.get(update.key.id);
          if (pollCreation) {
            console.log('[WA] Poll creation found in cache.');
            const pollMessage = getAggregateVotesInPollMessage({
              message: pollCreation.message!,
              pollUpdates: update.update.pollUpdates
            });
            console.log('[WA] Aggregated votes:', JSON.stringify(pollMessage, null, 2));
            const selectedOption = pollMessage.find(v => v.voters.length > 0)?.name;
            if (selectedOption && update.key.remoteJid) {
               console.log('[WA] User selected:', selectedOption);
               await this.processMessageText(update.key.remoteJid, selectedOption);
            } else {
               console.log('[WA] No option selected or remoteJid missing');
            }
          } else {
            console.log('[WA] Poll creation NOT found in cache.');
          }
        }
      }
    });

    this.sock.ev.on('messages.upsert', async (m) => {
      // console.log('[WA] messages.upsert triggered', JSON.stringify(m.messages[0]?.message, null, 2));
      if (m.type === 'notify') {
        for (const msg of m.messages) {
          
          // --- SIMPAN POLL CREATION YANG KITA KIRIM SENDIRI ---
          // Supaya kita dapat messageSecret untuk dekripsi nanti
          if (msg.key.fromMe && msg.message?.pollCreationMessage) {
            console.log('[WA] Caching outgoing poll with secret:', msg.key.id);
            this.pollCache.set(msg.key.id!, msg);
          }

          if (!msg.key.fromMe && msg.message && msg.key.remoteJid) {
            const sender = msg.key.remoteJid;
            let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            
            // Tangkap hasil dari ListMessage (Menu Interaktif Lama)
            if (msg.message?.listResponseMessage) {
              text = msg.message.listResponseMessage.title || msg.message.listResponseMessage.singleSelectReply?.selectedRowId || '';
            }

            // Tangkap hasil dari InteractiveMessage (Menu Interaktif Native Flow)
            if (msg.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
              const paramsJson = msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson;
              if (paramsJson) {
                try {
                  const params = JSON.parse(paramsJson);
                  if (params.id) {
                    text = params.id;
                  }
                } catch (e) {
                  console.error('[WA] Error parsing interactive response params:', e);
                }
              }
            }
            
            // Tangkap hasil vote dari Polling (pollUpdateMessage)
            if (msg.message?.pollUpdateMessage) {
              const pollKey = msg.message.pollUpdateMessage.pollCreationMessageKey;
              const pollCreation = pollKey?.id ? this.pollCache.get(pollKey.id) : null;
              if (pollCreation) {
                try {
                  const { getAggregateVotesInPollMessage } = require('@whiskeysockets/baileys');
                  const pollMessage = getAggregateVotesInPollMessage({
                    message: pollCreation.message!,
                    pollUpdates: [msg.message.pollUpdateMessage]
                  });
                  const selectedOption = pollMessage.find((v: any) => v.voters.length > 0)?.name;
                  if (selectedOption) {
                    text = selectedOption;
                  }
                } catch (e) {
                  console.error('[WA] Error decrypting poll vote:', e);
                }
              }
            }
            
            console.log('[WA] Extracted text:', text);
            if (!text) continue;
            await this.processMessageText(sender, text);
          }
        }
      }
    });
  }

  private async processMessageText(sender: string, text: string) {


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

              const isAskingForHelp = text.toLowerCase().includes('bantuan') || text.toLowerCase().includes('cs') || text.toLowerCase().includes('admin') || text.trim() === '0';
              let triggerHandoff = isAskingForHelp;

                if (session.status === 'BOT' && !triggerHandoff) {
                  // Cek apakah ada di BotMenu (Menu Statis/Dinamis buatan Admin)
                  const lowerText = text.toLowerCase().trim();
                  
                  // Interactive Menu Handling
                  const cleanText = lowerText.replace(/[^a-z0-9\s]/g, '').trim();
                  
                  // Daftar sapaan yang sangat komprehensif (termasuk salah ketik umum)
                  const greetingWords = [
                    'halo', 'hallo', 'helo', 'hello', 'hai', 'hi', 'hey', 'hei', 'huy',
                    'p', 'ping', 'test', 'tes', 'bot', 'admin', 'min',
                    'menu', 'help', 'bantuan', 'menu utama', '0',
                    'assalamualaikum', 'assalamu alaikum', 'assalamualikum', 'asalamualaikum', 'samlekom', 'aslam',
                    'pagi', 'siang', 'sore', 'malam', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam',
                    'punten', 'permisi', 'halo min', 'hai min', 'halo admin', 'pagi min'
                  ];
                  
                  const isGreeting = ['hai', 'halo', 'info', 'menu', 'ping', 'p', 'help', 'bantuan', 'assalamualaikum', 'assalamu\'alaikum'].includes(lowerText);

                  if (isGreeting) {
                    console.log(`[WA] Mengirim main menu untuk ${sender}...`);
                    
                    // Reset context saat kembali ke menu utama
                    session = await prisma.chatSession.update({
                      where: { id: session.id },
                      data: { formState: null }
                    });

                    try {
                      await this.sendInteractiveMainMenu(sender);
                      await prisma.chatMessage.create({
                        data: { sessionId: session.id, senderType: 'BOT', content: '[Text Main Menu Sent]' }
                      });
                      console.log('[WA] Berhasil kirim main menu');
                    } catch (e) {
                      console.error('[WA] Gagal kirim main menu:', e);
                    }
                  } else {
                    // Cek jika user membalas dengan angka dari Main Menu
                    let currentLowerText = lowerText;
                    if (!session.formState) {
                       const num = parseInt(currentLowerText);
                       if (!isNaN(num)) {
                         const menus = await prisma.botMenu.findMany({ where: { isActive: true, keyword: { not: 'info' } }, orderBy: { keyword: 'asc' } });
                         if (num >= 1 && num <= menus.length) {
                           currentLowerText = menus[num - 1].keyword;
                           text = currentLowerText; // Override text input as if they typed the keyword
                         }
                       }
                    }

                    const menuMatch = await prisma.botMenu.findFirst({
                      where: {
                        keyword: { equals: currentLowerText }
                      }
                    });

                    if (menuMatch) {
                      console.log(`[WA] Mengirim balasan menu statis untuk ${sender}...`);
                      
                      // Kunci konteks ke menu ini
                      session = await prisma.chatSession.update({
                        where: { id: session.id },
                        data: { formState: `TOPIC:${menuMatch.keyword}` }
                      });

                      await this.sock?.sendMessage(sender, { text: menuMatch.response });
                      await prisma.chatMessage.create({
                        data: { sessionId: session.id, senderType: 'BOT', content: menuMatch.response }
                      });
                    } else {
                    // Fallback ke AI RAG Engine
                    console.log(`[WA] Mengirim ke AI Engine untuk ${sender}...`);
                    
                    // Cek apakah ada konteks topik yang sedang aktif
                    let aiQuestion = text;
                    let followUpMenu = '';
                    
                    if (session.formState && session.formState.startsWith('TOPIC:')) {
                      const topic = session.formState.replace('TOPIC:', '');
                      const menuNumber = parseInt(text.trim());
                      
                      if (!isNaN(menuNumber) && menuNumber >= 1 && menuNumber <= 5) {
                        const menuContext = await prisma.botMenu.findUnique({ where: { keyword: topic } });
                        if (menuContext) {
                          // Gunakan regex untuk mencari `*[ 1 ]* Pertanyaan`
                          const regex = new RegExp(`\\[\\s*${menuNumber}\\s*\\]\\*\\s*(.*)`);
                          const match = menuContext.response.match(regex);
                          if (match && match[1]) {
                            aiQuestion = `Terkait topik ${topic}: ${match[1].trim()}`;
                          } else {
                            aiQuestion = `Terkait topik ${topic}: ${text}`;
                          }
                          
                          // Simpan menu saran untuk di-append di akhir jawaban (mode teks)
                          const suggestIdx = menuContext.response.indexOf('Saran pertanyaan');
                          if (suggestIdx !== -1) {
                            followUpMenu = menuContext.response.substring(suggestIdx);
                          }
                        }
                      } else {
                        aiQuestion = `Terkait topik ${topic}: ${text}`;
                      }
                    }

                    // Kirim indikator loading karena VPS lama membalas
                    await this.sock?.sendMessage(sender, { text: "⏳ _Sebentar ya Sahabat, Zawa lagi cari infonya dulu..._" });
                    
                    const answer = await aiService.askQuestion(aiQuestion);
                  const isFail = answer.toLowerCase().includes('maaf') || answer.toLowerCase().includes('tidak tahu') || answer.toLowerCase().includes('belum memiliki informasi') || answer.toLowerCase().includes('live chat');
                  
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
                      const isPollMode = process.env.RESPONSE_MODE?.trim() === 'poll';
                      
                      let finalAnswer = answer;
                      if (!isFail && followUpMenu !== '' && !isPollMode) {
                        finalAnswer += '\n\n---\n*' + followUpMenu;
                      }
                      
                      // Tambahan pesan tawaran CS di setiap akhir respons AI
                      finalAnswer += '\n\n💡 _Ketik *"CS"* kapan saja jika Anda butuh bantuan langsung dari petugas kami._';
                      
                      await this.sock?.sendMessage(sender, { text: finalAnswer });
                      await prisma.chatMessage.create({
                        data: { sessionId: session.id, senderType: 'BOT', content: finalAnswer }
                      });
                      
                      // Jika mode poll, kirim saran pertanyaan sebagai pesan polling terpisah
                      if (!isFail && followUpMenu !== '' && isPollMode) {
                         // Parse pertanyaan dari followUpMenu
                         // Teksnya seperti: Saran pertanyaan (balas dengan angka):\n*[ 1 ]* Apa itu zakat?\n*[ 2 ]* Berapa biayanya?
                         const lines = followUpMenu.split('\n');
                         const pollOptions: string[] = [];
                         for (const line of lines) {
                           const match = line.match(/\[\s*\d+\s*\]\*\s*(.*)/);
                           if (match && match[1] && match[1] !== 'Kembali ke Menu Utama') {
                             pollOptions.push(match[1].trim());
                           }
                         }
                         if (pollOptions.length > 0) {
                           pollOptions.push('Kembali ke Menu Utama');
                           const pollMsg = await this.sock?.sendMessage(sender, {
                             poll: {
                               name: "Pilih pertanyaan selanjutnya:",
                               values: pollOptions,
                               selectableCount: 1
                             }
                           });
                           if (pollMsg?.key?.id) {
                             this.pollCache.set(pollMsg.key.id, pollMsg);
                           }
                         }
                      }
                    }
                } // End of AI Engine block
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


  private async sendInteractiveMainMenu(sender: string) {
    if (!this.sock) return;
    
    // Ambil menu dinamis dari database (keyword 'info' bertindak sebagai Main Menu)
    const mainMenu = await prisma.botMenu.findUnique({ where: { keyword: 'info' } });
    
    let menuText = "Halo Sahabat Kemenag Cirebon! Silakan ketik pertanyaan Anda atau balas dengan kata kunci menu.";
    if (mainMenu && mainMenu.isActive) {
      menuText = mainMenu.response;
    }
    
    const isPollMode = process.env.RESPONSE_MODE?.trim() === 'poll';
    console.log('[DEBUG] RESPONSE_MODE:', process.env.RESPONSE_MODE, '| isPollMode:', isPollMode);

    if (isPollMode) {
      // Ambil semua menu kecuali 'info' untuk dijadikan opsi Poll
      const menus = await prisma.botMenu.findMany({ where: { isActive: true, keyword: { not: 'info' } } });
      const options = menus.map(m => m.keyword);
      
      if (options.length > 0) {
        // WhatsApp Poll WAJIB minimal 2 opsi
        if (options.length === 1) {
          options.push('Layanan Lainnya');
        }

        // Karena poll values max 12 (biasanya), kita batasi atau kirim text pembuka dulu
        await this.sock.sendMessage(sender, { text: "Halo Sahabat! Kenalkan, aku Zawa (Asisten Virtual Kemenag Kabupaten Cirebon). Zawa siap membantu memberikan informasi seputar layanan di Kemenag Cirebon." });
        
        const pollMsg = await this.sock.sendMessage(sender, {
          poll: {
            name: "Silakan pilih layanan di bawah ini:",
            values: options,
            selectableCount: 1
          }
        });
        
        if (pollMsg?.key?.id) {
          this.pollCache.set(pollMsg.key.id, pollMsg);
        }
        return;
      }
    }
    
    // Fallback atau mode chatbiasa
    // Render teks dinamis dari list menu (Menu Angka)
    const menus = await prisma.botMenu.findMany({ where: { isActive: true, keyword: { not: 'info' } }, orderBy: { keyword: 'asc' } });
    if (mainMenu && mainMenu.isActive) {
      menuText = mainMenu.response + '\n\n';
      if (menus.length > 0) {
        menus.forEach((m, i) => {
          menuText += `*[ ${i + 1} ]* ${m.title}\n`;
        });
      } else {
        menuText += "*(Belum ada layanan yang tersedia saat ini)*\n";
      }
      menuText += `*[ 0 ]* Hubungi Customer Service (Live Chat)\n`;
      menuText += '\nAtau jika informasi yang dicari tidak ada di atas, silakan langsung ketikkan pertanyaan Anda secara bebas!';
    }
    
    await this.sock.sendMessage(sender, { text: menuText });
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
