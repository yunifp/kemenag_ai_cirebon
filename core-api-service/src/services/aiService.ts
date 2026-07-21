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
      timeout: 180000, // 180 seconds timeout for slow VPS
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
    
    // Gunakan Promise.race untuk mencegah pdf-parse nge-hang selamanya pada file tertentu
    const pdfPromise = pdf(buffer);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout membaca PDF (struktur file terlalu rumit atau sulit dibaca)')), 15000)
    );
    
    const data: any = await Promise.race([pdfPromise, timeoutPromise]);
    
    console.log(`[AI Service] Selesai mengekstrak teks PDF. Memotong menjadi paragraf...`);
    
    // Pecah jadi paragraf (chunking sederhana)
    const paragrafList = data.text.split('\n\n').filter((p: string) => p.trim().length > 50);
    console.log(`[AI Service] Terdapat ${paragrafList.length} paragraf yang akan diproses Ollama.`);

    for (let i = 0; i < paragrafList.length; i++) {
      const teks = paragrafList[i].trim();
      console.log(`[AI Service] Mengirim chunk ${i + 1}/${paragrafList.length} ke Ollama...`);
      
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
    return { success: true, chunks: paragrafList.length, fullText: data.text };
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
    
    return { success: true, chunks: paragrafList.length, fullText: textContent };
  }

  /**
   * Generate 3 FAQs from uploaded document text
   */
  async generateFAQs(textContent: string): Promise<string[]> {
    try {
      console.log(`[AI Service] Merumuskan FAQ dari teks dokumen...`);
      
      const systemPrompt = `Anda adalah analis dokumen Kemenag. Baca dokumen yang diberikan dan buatlah tepat 5 pertanyaan (FAQ) yang paling mungkin ditanyakan orang berdasarkan dokumen ini.
PENTING:
- DILARANG menggunakan bahasa asing atau Mandarin. WAJIB gunakan Bahasa Indonesia.
- DILARANG menggunakan asumsi. Pertanyaan HARUS murni bersumber dari teks dokumen.
- HANYA outputkan 5 pertanyaan.
- Pisahkan dengan enter (baris baru).
- Jangan beri penomoran atau bullet.
- Setiap pertanyaan harus singkat (maksimal 7 kata).`;

      // Kita batasi teks yang dikirim agar tidak terlalu panjang membebani prompt
      const contextText = textContent.substring(0, 3000); 

      const qwenRes = await this.aiClient.post('/api/chat', {
        model: 'qwen2:1.5b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Dokumen:\n${contextText}` }
        ],
        stream: false,
        options: { 
          temperature: 0.2,
          num_predict: 100
        }
      });

      const resultText = qwenRes.data.message.content;
      const questions = resultText.split('\n')
        .map((q: string) => q.replace(/^[0-9\.\-\*]+\s*/, '').trim()) // bersihkan numbering/bullet jika AI nakal
        .filter((q: string) => q.length > 5)
        .slice(0, 5);
      
      if (questions.length === 0) {
        return ["Apa pengertiannya?", "Apa syarat utamanya?", "Bagaimana prosedurnya?", "Berapa biayanya?", "Di mana lokasinya?"];
      }
      return questions;

    } catch (error: any) {
      console.error('[AI Service] Error generating FAQs:', error.response?.statusText || error.message);
      // Fallback generic questions
      return ["Apa pengertiannya?", "Apa syarat utamanya?", "Bagaimana prosedurnya?", "Berapa biayanya?", "Di mana lokasinya?"];
    }
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

      // 3. Rekayasa Prompt (Dioptimalkan untuk kecepatan dan ringkas)
      const systemPrompt = `
Anda adalah Zawa, Asisten Virtual resmi dari Kemenag Kab. Cirebon.
Tugas Anda HANYA menjawab pertanyaan seputar layanan Kemenag (seperti Zakat, Haji, dll) berdasarkan REFERENSI di bawah ini.

ATURAN MUTLAK:
1. Anda HANYA boleh menjawab jika informasinya tercantum SECARA EKSPLISIT di dalam teks [REFERENSI].
2. JIKA pertanyaan user TIDAK ADA hubungannya sama sekali dengan teks [REFERENSI] atau informasinya tidak lengkap di referensi, Anda WAJIB membalas HANYA dengan token: [TIDAK_TERJAWAB]
3. JIKA pesan user hanya berupa sapaan pendek, tes, atau huruf acak (misal: 'tes', 'halo', 'ok', 'p'), WAJIB gunakan token: [TIDAK_TERJAWAB]
4. DILARANG KERAS berasumsi, menebak, atau mengait-ngaitkan hal yang tidak logis. Jika ragu, gunakan token: [TIDAK_TERJAWAB]
5. DILARANG menggunakan bahasa asing (wajib Bahasa Indonesia).

[REFERENSI]
${contekan}
[/REFERENSI]`;

      // 4. Panggil Ollama Qwen 2 dengan optimasi parameter
      const qwenRes = await this.aiClient.post('/api/chat', {
        model: 'qwen2:1.5b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: false,
        options: { 
          temperature: 0.3, // Dinaikkan sedikit agar tidak kaku dan terjebak loop
          repeat_penalty: 1.2, // Memaksa AI untuk tidak mengulang-ulang kalimat
          num_predict: 400, // Ditingkatkan agar jawaban panjang tidak terpotong di tengah jalan
          num_ctx: 2048     // Konteks memori sedikit dilebarkan
        }
      });

      let finalAnswer = qwenRes.data?.message?.content || 'Maaf, saya tidak mengerti.';
      
      if (finalAnswer.includes('[TIDAK_TERJAWAB]')) {
        finalAnswer = 'Maaf, pertanyaan Anda di luar konteks layanan kami atau tidak terdapat dalam panduan Kemenag. Silakan hubungi Customer Service untuk info lebih lanjut.';
      }
      
      return finalAnswer;

    } catch (error: any) {
      console.error('[AI Service] Error asking question:', error.response?.statusText || error.message);
      return "Mohon maaf, layanan AI saat ini sedang tidak dapat dijangkau. Silakan hubungi admin kami untuk pertanyaan lebih lanjut.";
    }
  }
}

export const aiService = new AIService();
