import type { Request, Response, RequestHandler } from 'express';
import { prisma } from '../lib/prisma';
import { aiService } from '../services/aiService';

export const getDocuments: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const docs = await prisma.knowledgeDocument.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ data: docs });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Tidak ada file yang diunggah' });
      return;
    }

    const { category, isPublic, title } = req.body;
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const docTitle = title || originalName;

    // 1. Save metadata to DB with 'Memproses' status
    const doc = await prisma.knowledgeDocument.create({
      data: {
        title: docTitle,
        category: category || 'Umum',
        fileUrl: 'vector-db', 
        fileType: originalName.split('.').pop() || 'pdf',
        status: 'Memproses',
        isPublic: isPublic === 'true',
      }
    });

    // 2. Process and store in Vector DB asynchronously or wait for it
    try {
      const aiResult = await aiService.processAndStorePDF(fileBuffer, originalName, doc.id);
      
      // If success, update to Ready
      await prisma.knowledgeDocument.update({
        where: { id: doc.id },
        data: {
          status: 'Ready',
          metadata: { chunks: aiResult.chunks, message: 'Stored in n8n/Vector DB' }
        }
      });
      
      res.status(201).json({ message: 'Dokumen berhasil diproses dan diserap AI', data: doc });
    } catch (aiError) {
      // If AI fails, update to Error
      await prisma.knowledgeDocument.update({
        where: { id: doc.id },
        data: {
          status: 'Error (Ollama / Vektor gagal)',
          metadata: { error: String(aiError) }
        }
      });
      // We still return 201 because the document is saved in our DB
      res.status(201).json({ message: 'Dokumen tersimpan namun gagal diproses AI', data: doc });
    }

  } catch (err) {
    console.error('Failed to upload document:', err);
    res.status(500).json({ error: 'Gagal menyimpan dokumen ke database' });
  }
};

export const uploadManualText: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, isPublic, content } = req.body;
    
    if (!title || !content) {
      res.status(400).json({ error: 'Judul dan Konten wajib diisi' });
      return;
    }

    // 1. Save metadata to DB
    const doc = await prisma.knowledgeDocument.create({
      data: {
        title,
        category: category || 'Umum',
        fileType: 'text',
        status: 'Memproses',
        isPublic: isPublic === true || isPublic === 'true',
        description: content.substring(0, 100) + '...',
      }
    });

    // 2. Process and store in Vector DB
    try {
      const aiResult = await aiService.processAndStoreText(content, title, doc.id);
      
      await prisma.knowledgeDocument.update({
        where: { id: doc.id },
        data: {
          status: 'Ready',
          metadata: { chunks: aiResult.chunks, message: 'Stored in n8n/Vector DB' }
        }
      });
      
      res.status(201).json({ message: 'Input manual berhasil diproses dan diserap AI', data: doc });
    } catch (aiError) {
      await prisma.knowledgeDocument.update({
        where: { id: doc.id },
        data: {
          status: 'Error (Ollama / Vektor gagal)',
          metadata: { error: String(aiError) }
        }
      });
      res.status(201).json({ message: 'Tersimpan namun gagal diproses AI', data: doc });
    }

  } catch (err) {
    console.error('Failed to save manual input:', err);
    res.status(500).json({ error: 'Gagal menyimpan input manual' });
  }
};

export const deleteDocument: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if it exists first to avoid Prisma error throwing 500
    const existing = await prisma.knowledgeDocument.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Dokumen tidak ditemukan' });
      return;
    }

    await prisma.knowledgeDocument.delete({
      where: { id }
    });
    // CATATAN: Untuk menghapus dari Pinecone, n8n perlu menyediakan Webhook DELETE.
    // Saat ini hanya terhapus di database PostgreSQL.
    res.status(200).json({ message: 'Dokumen berhasil dihapus dari database' });
  } catch (err) {
    console.error('Failed to delete document:', err);
    res.status(500).json({ error: 'Gagal menghapus dokumen' });
  }
};
