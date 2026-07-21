# Panduan Penuh Integrasi Express JS (TypeScript), PostgreSQL, dan Ollama Berkeamanan Tinggi

Karena gerbang Nginx VPS Anda sudah berhasil dikunci dengan *password*, ini adalah **panduan final dan terlengkap** (*End-to-End*) untuk mengintegrasikan AI VPS Kemenag dengan aplikasi Express JS Anda di laptop lokal.

---

## Langkah 1: Persiapan Database (PostgreSQL + pgvector)
Pastikan *database* PostgreSQL lokal Anda terinstal ekstensi `pgvector`. Jalankan *query* SQL berikut menggunakan *tools database* (DBeaver/PgAdmin):

```sql
-- Mengaktifkan ekstensi vektor
CREATE EXTENSION IF NOT EXISTS vector;

-- Membuat tabel dokumen
CREATE TABLE dokumen_kemenag (
    id SERIAL PRIMARY KEY,
    judul_dokumen VARCHAR(255),
    isi_teks TEXT,
    vektor_makna vector(768)
);
```

---

## Langkah 2: Inisialisasi Project Express JS Lokal
Di laptop Anda, buat folder baru dan inisialisasi lingkungan TypeScript:

```bash
mkdir backend-chatbot-kemenag
cd backend-chatbot-kemenag
npm init -y

# Install dependensi utama
npm install express axios pg pdf-parse dotenv cors

# Install dependensi TypeScript
npm install -D typescript @types/node @types/express @types/pg @types/pdf-parse @types/cors ts-node nodemon

# Membuat konfigurasi tsconfig.json
npx tsc --init
```

Buat file `.env` di *root folder* laptop Anda:
```env
# Koneksi Database Lokal
DB_USER=postgres
DB_PASSWORD=password_database_anda
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=kemenag_db
PORT=3000

# Kredensial AI VPS (Ubah IP dan Password sesuai milik Anda)
OLLAMA_URL=http://IP_VPS_ANDA:11435
OLLAMA_USER=kemenagcirebon
OLLAMA_PASS=password_rahasia_anda
```

---

## Langkah 3: Modul Klien AI Ter-Otentikasi (`src/aiClient.ts`)
Buat folder `src` dan file `src/aiClient.ts`. File ini bertugas menyelipkan *password* secara otomatis (Base64) setiap kali kita memanggil AI di VPS.

```typescript
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Mengubah Username & Password menjadi format Base64 (Syarat Nginx)
const credentials = Buffer.from(`${process.env.OLLAMA_USER}:${process.env.OLLAMA_PASS}`).toString('base64');

// Klien Axios ini WAJIB dipakai untuk semua request ke Ollama
export const aiClient = axios.create({
    baseURL: process.env.OLLAMA_URL,
    headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
    }
});
```

---

## Langkah 4: Skrip Pemakan Dokumen PDF (`src/import_pdf.ts`)
Skrip ini digunakan oleh Admin untuk membaca aturan Kemenag, memecahnya, memvektorisasinya (memakai *nomic-embed-text* di VPS secara aman), dan menyimpannya ke PostgreSQL.

Buat file `src/import_pdf.ts`:
```typescript
import dotenv from 'dotenv';
import fs from 'fs';
import pdf from 'pdf-parse';
import { Pool } from 'pg';
import { aiClient } from './aiClient'; // Panggil klien aman kita

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function prosesPDF(namaFile: string) {
    console.log(`Membaca dokumen: ${namaFile}...`);
    const dataBuffer = fs.readFileSync(namaFile);
    const data = await pdf(dataBuffer);
    
    // Pecah jadi paragraf
    const paragrafList = data.text.split('\n\n').filter(p => p.length > 50);

    for (let i = 0; i < paragrafList.length; i++) {
        const teks = paragrafList[i].trim();
        console.log(`\nMembuat vektor untuk paragraf ${i+1}/${paragrafList.length}...`);

        try {
            // Memanggil AI di VPS dengan aman (ter-otentikasi)
            const response = await aiClient.post('/api/embeddings', {
                model: 'nomic-embed-text',
                prompt: teks
            });

            const vektorArray: number[] = response.data.embedding;
            const vektorString = `[${vektorArray.join(',')}]`;

            // Simpan ke DB
            await pool.query(
                'INSERT INTO dokumen_kemenag (judul_dokumen, isi_teks, vektor_makna) VALUES ($1, $2, $3)',
                [namaFile, teks, vektorString]
            );
            console.log(`Sukses menyimpan paragraf ${i+1}`);
            
        } catch (error: any) {
            console.error("Gagal memproses vektor. Cek Password di .env!", error.message);
        }
    }
    console.log("SELESAI! AI sudah hafal isi dokumen ini.");
    process.exit(0);
}

// Eksekusi (Pastikan ada file pedoman_kemenag.pdf di folder yang sama)
prosesPDF('pedoman_kemenag.pdf');
```
*Jalankan dengan: `npx ts-node src/import_pdf.ts`*

---

## Langkah 5: Skrip Server Utama Chatbot RAG (`src/server.ts`)
Ini adalah API Express JS yang siap dihubungkan ke WhatsApp Baileys nantinya.

Buat file `src/server.ts`:
```typescript
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { aiClient } from './aiClient'; // Panggil klien aman kita

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

app.post('/api/chat', async (req: Request, res: Response) => {
    const { pertanyaan } = req.body;
    if (!pertanyaan) return res.status(400).json({ error: "Pertanyaan tidak boleh kosong" });

    try {
        console.log(`Mengirim ke AI Tersertifikasi: "${pertanyaan}"`);

        // 1. Embedding Pertanyaan
        const embedRes = await aiClient.post('/api/embeddings', {
            model: 'nomic-embed-text',
            prompt: pertanyaan
        });
        const vektorString = `[${embedRes.data.embedding.join(',')}]`;

        // 2. Semantic Search di PostgreSQL
        const hasilPencarian = await pool.query(`
            SELECT isi_teks FROM dokumen_kemenag ORDER BY vektor_makna <=> $1 LIMIT 3
        `, [vektorString]);
        const contekan = hasilPencarian.rows.map(row => row.isi_teks).join('\n\n');

        // 3. Rekayasa Prompt
        const systemPrompt = `
Anda Asisten Virtual Kemenag Kab. Cirebon. Jawab HANYA berdasarkan referensi ini:
[REFERENSI]
${contekan}
[/REFERENSI]
Jika jawaban tidak ada di referensi, balas HANYA dengan: "Maaf, informasi tidak ada. Silakan gunakan Live Chat."`;

        // 4. Hit Qwen 2 di VPS dengan aman
        const qwenRes = await aiClient.post('/api/chat', {
            model: 'qwen2',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: pertanyaan }
            ],
            stream: false,
            options: { temperature: 0.1 }
        });

        return res.json({ response: qwenRes.data.message.content });

    } catch (error: any) {
        console.error("Gagal Otentikasi / Error AI:", error.response?.statusText || error.message);
        return res.status(500).json({ error: "Koneksi ke AI VPS terputus/ditolak. Cek kredensial Anda!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Lokal Express berjalan, tersambung ke AI tersertifikasi di port ${PORT}`);
});
```
*Jalankan dengan: `npx nodemon src/server.ts`*

---
## Kesimpulan Akhir
Kodingan ini adalah *Final Blueprint* Anda. Mulai dari **Keamanan VPS (Nginx Auth)**, **Ekstraksi PDF (Chunking)**, hingga **API Restful (RAG Generation)**—semuanya dirangkum dalam ekosistem *TypeScript* yang tangguh. Sistem ini sudah siap dirajut dengan kode Baileys dan Frontend React Anda!
