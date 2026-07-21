import axios from 'axios';
const pdf = require('pdf-parse');
import { prisma } from '../lib/prisma';

export class AIService {
  private aiClient;

  constructor() {
    const user = process.env.OLLAMA_USER || 'kemenagcirebon';
    const pass = process.env.OLLAMA_PASS || 'kemenag2324';
    const url = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    const credentials = Buffer.from(`${user}:${pass}`).toString('base64');

    this.aiClient = axios.create({
      baseURL: url,
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Process a PDF buffer, chunk it, and store in Vector DB via Postgres pgvector
   */
  async processAndStorePDF(buffer: Buffer, sourceName: string, documentId: string) {
    console.log(`[AI Service] Membaca dan memproses PDF: ${sourceName}...`);
    const data = await pdf(buffer);
    
    // Pecah jadi paragraf (chunking sederhana)
    const paragrafList = data.text.split('\n\n').filter((p: string) => p.trim().length > 50);

    for (let i = 0; i < paragrafList.length; i++) {
      const teks = paragrafList[i].trim();
      
      try {
        const response = await this.aiClient.post('/api/embeddings', {
          model: 'nomic-embed-text',
          prompt: teks
        });

        const vektorArray: number[] = response.data.embedding;
        const vektorString = `[${vektorArray.join(',')}]`;

        // Simpan chunk ke database menggunakan Prisma raw query
        await prisma.$executeRaw`
          INSERT INTO "KnowledgeDocumentChunk" ("id", "knowledgeDocumentId", "content", "embedding") 
          VALUES (gen_random_uuid(), ${documentId}, ${teks}, ${vektorString}::vector)
        `;
        
      } catch (error: any) {
        console.error(`[AI Service] Error embedding chunk ${i+1}:`, error.message);
        throw error;
      }
    }
    
    console.log(`[AI Service] Selesai memproses PDF ${sourceName}. Disimpan ke ${paragrafList.length} chunks.`);
    return { success: true, chunks: paragrafList.length };
  }

  /**
   * Process manual text, chunk it, and store in Vector DB
   */
  async processAndStoreText(textContent: string, sourceName: string, documentId: string) {
    console.log(`[AI Service] Memproses teks manual: ${sourceName}...`);
    
    const paragrafList = textContent.split('\n\n').filter((p: string) => p.trim().length > 50);
    if (paragrafList.length === 0 && textContent.trim().length > 0) {
      paragrafList.push(textContent.trim());
    }

    for (let i = 0; i < paragrafList.length; i++) {
      const teks = paragrafList[i].trim();
      
      try {
        const response = await this.aiClient.post('/api/embeddings', {
          model: 'nomic-embed-text',
          prompt: teks
        });

        const vektorArray: number[] = response.data.embedding;
        const vektorString = `[${vektorArray.join(',')}]`;

        await prisma.$executeRaw`
          INSERT INTO "KnowledgeDocumentChunk" ("id", "knowledgeDocumentId", "content", "embedding") 
          VALUES (gen_random_uuid(), ${documentId}, ${teks}, ${vektorString}::vector)
        `;
        
      } catch (error: any) {
        console.error(`[AI Service] Error embedding text chunk ${i+1}:`, error.message);
        throw error;
      }
    }
    
    return { success: true, chunks: paragrafList.length };
  }

  /**
   * Ask a question using RAG via Ollama and Postgres
   */
  async askQuestion(question: string): Promise<string> {
    try {
      console.log(`[AI Service] Menanyakan: "${question}"`);

      // 1. Embedding Pertanyaan
      const embedRes = await this.aiClient.post('/api/embeddings', {
        model: 'nomic-embed-text',
        prompt: question
      });
      const vektorString = `[${embedRes.data.embedding.join(',')}]`;

      // 2. Semantic Search di PostgreSQL
      const hasilPencarian: any[] = await prisma.$queryRaw`
        SELECT content 
        FROM "KnowledgeDocumentChunk" 
        ORDER BY embedding <=> ${vektorString}::vector 
        LIMIT 3
      `;
      
      const contekan = hasilPencarian.map((row: any) => row.content).join('\n\n');

      // 3. Rekayasa Prompt
      const systemPrompt = `
Anda Asisten Virtual Kemenag Kab. Cirebon. Jawab HANYA berdasarkan referensi ini:
[REFERENSI]
${contekan}
[/REFERENSI]
Jika jawaban tidak ada di referensi, balas HANYA dengan: "Maaf, informasi tidak ada. Silakan gunakan Live Chat."`;

      // 4. Panggil Ollama Qwen 2
      const qwenRes = await this.aiClient.post('/api/chat', {
        model: 'qwen2:1.5b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: false,
        options: { temperature: 0.1 }
      });

      return qwenRes.data.message.content;

    } catch (error: any) {
      console.error('[AI Service] Error asking question:', error.response?.statusText || error.message);
      return "Mohon maaf, layanan AI saat ini sedang tidak dapat dijangkau. Ketik 'Bantuan' untuk memanggil CS.";
    }
  }
}

export const aiService = new AIService();
