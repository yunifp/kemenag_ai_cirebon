import type { Request, Response, RequestHandler } from 'express';
import { prisma } from '../lib/prisma';

export const getPublicDocuments: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    
    const docs = await prisma.knowledgeDocument.findMany({
      where: { 
        isPublic: true,
        ...(search ? {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' } },
            { category: { contains: search as string, mode: 'insensitive' } }
          ]
        } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({ data: docs });
  } catch (err) {
    console.error('Failed to get public documents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardStats: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalChats = await prisma.chatMessage.count({
      where: { senderType: 'USER' }
    });

    const totalTickets = await prisma.ticket.count();
    const totalDocs = await prisma.knowledgeDocument.count();

    res.status(200).json({
      data: {
        totalChats: totalChats || 0,
        aiResolved: Math.max(0, totalChats - totalTickets) || 0,
        handoffs: totalTickets || 0,
        totalDocs: totalDocs || 0
      }
    });
  } catch (err) {
    console.error('Failed to get stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
