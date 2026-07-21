import type { Request, Response, RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { waService } from '../services/whatsappService';

export const getTickets: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const tickets = await prisma.chatSession.findMany({
      where: { status: 'PENDING_HANDOFF' },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.status(200).json({ data: tickets });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTicketMessages: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Missing id parameter' });
      return;
    }
    const session = await prisma.chatSession.findUnique({
      where: { id: String(id) },
      include: {
        messages: { orderBy: { timestamp: 'asc' } }
      }
    });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    
    res.status(200).json({ data: session });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const replyTicket: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, message } = req.body;
    
    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Send WA Message
    await waService.sendMessage(session.phoneNumber, message);

    // Save to DB
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        senderType: 'HUMAN',
        content: message
      }
    });

    res.status(200).json({ message: 'Balasan terkirim' });
  } catch (err) {
    console.error('Failed to reply', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const closeTicket: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: 'Missing id parameter' });
      return;
    }

    const session = await prisma.chatSession.update({
      where: { id: String(id) },
      data: { 
        status: 'BOT',
        botFailCount: 0 
      }
    });

    // Beri tahu user bahwa sesi CS telah berakhir
    await waService.sendMessage(session.phoneNumber, "Sesi dengan Customer Service telah berakhir. Anda sekarang terhubung kembali dengan Asisten AI Kemenag.");

    res.status(200).json({ message: 'Tiket berhasil ditutup' });
  } catch (err) {
    console.error('Failed to close ticket', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
