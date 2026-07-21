# Product Requirements Document (PRD)
**Produk:** Sistem Layanan Chatbot WhatsApp Hibrida & Portal Admin 
**Klien:** Kementerian Agama Kabupaten Cirebon

---

## 1. Pendahuluan
### 1.1 Visi Produk
Menciptakan ekosistem pelayanan publik Kemenag Cirebon yang responsif 24/7 melalui WhatsApp, memadukan kecepatan kecerdasan buatan (AI) berbasis dokumen resmi dengan sentuhan empati dari agen manusia, serta dikendalikan penuh secara mandiri lewat satu portal web tersentralisasi.

### 1.2 Tujuan Bisnis (Objectives)
*   Mengurangi waktu tunggu antrean (*bottleneck*) pertanyaan warga ke *Customer Service* hingga 70%.
*   Memberikan jawaban otomatis 24/7 secara akurat berlandaskan dokumen kedinasan (tanpa halusinasi AI).
*   Menghilangkan biaya operasional bulanan (*Zero Opex*) untuk tagihan pihak ketiga API WhatsApp (Meta) dan API AI (OpenAI/Google).

---

## 2. User Personas (Target Pengguna)

| Persona | Deskripsi & Tujuan | Kendala / Pain Point |
| :--- | :--- | :--- |
| **Masyarakat (User)** | Warga Cirebon yang ingin bertanya seputar prosedur nikah, haji, wakaf, dll. Berinteraksi hanya via WA. | Malas instal aplikasi baru, kesulitan mencari info saat di luar jam kantor, tidak tahu format *chat* ke *bot*. |
| **CS / Operator Kemenag** | Staf yang bertugas merespons pertanyaan kompleks/sensitif dari masyarakat secara manual. | Kewalahan membalas *chat* berulang setiap hari, kesulitan melacak antrean *chat* di satu HP yang sama. |
| **Admin / Superadmin** | Pihak berwenang Kemenag yang mengatur sistem informasi, referensi AI, dan mengubah menu pelayanan. | Tidak mengerti *coding/programming*, ingin semuanya bisa diedit instan lewat Web UI (*drag and drop*). |

---

## 3. Epics & User Stories (Fitur Produk)

### EPIC 1: WhatsApp Gateway & Smart Routing
Kumpulan fitur yang mengendalikan penerimaan dan rute pesan di WhatsApp tanpa ketergantungan API Resmi (Centang Hijau).

*   **Story 1.1 - Koneksi QR Code**: Sebagai Admin, saya ingin menghubungkan nomor WA Instansi ke sistem hanya dengan memindai *QR Code* di Portal, agar tidak perlu mendaftar birokrasi API Meta.
    *   *Acceptance Criteria (AC)*: Terdapat menu *Scan QR* di Portal Admin. Status koneksi (*Connected/Disconnected*) terlihat *real-time*.
*   **Story 1.2 - Deteksi Konteks Otomatis**: Sebagai Sistem, saya harus bisa membedakan mana pesan pengguna yang berupa klik Menu (Button/List) dan mana yang berupa ketikan bebas, agar bisa diarahkan ke rute yang tepat.
    *   *AC*: Klik menu -> Kirim balasan statis cepat. Ketikan teks -> Teruskan ke *Engine AI*.
*   **Story 1.3 - Pelacak Sesi (State Management)**: Sebagai User, saya ingin bot mengingat saya sedang berada di menu mana, agar percakapan terasa natural dan tidak disuruh mengulang dari awal.
    *   *AC*: Bot mengenali bahwa nomor *0812xxx* sedang berada di *form* Zakat, sehingga input selanjutnya diperlakukan sebagai data Zakat.

### EPIC 2: AI Knowledge Base & RAG Pipeline (Qwen 2)
Kumpulan fitur "otak buatan" (LLM) yang berjalan lokal untuk menjawab pertanyaan teknis warga tanpa risiko pencurian data.

*   **Story 2.1 - Unggah Dokumen AI (Document Ingestion)**: Sebagai Admin, saya ingin mengunggah file PDF Juknis Kemenag, agar AI bisa membacanya dan menjadikannya sumber jawaban.
    *   *AC*: Form *Upload* menerima `.pdf`. Sistem di *backend* otomatis mengekstrak teks, memecah paragraf (*chunking*), dan menyimpannya ke *Database* Vektor (pgvector).
*   **Story 2.2 - Q&A Generatif (Semantic Search)**: Sebagai User, saya ingin bertanya dengan bahasa santai, dan bot menjawab dengan akurat sesuai prosedur resmi Kemenag.
    *   *AC*: Sistem menerjemahkan pertanyaan, mencocokkan kemiripan makna (*Semantic Search*) di *Database* Vektor, lalu Qwen 2 merangkumnya menjadi bahasa yang sopan.
*   **Story 2.3 - Anti-Halusinasi & Fallback**: Sebagai Admin, saya tidak ingin AI mengarang bebas jika warga menanyakan hal di luar konteks (misal: resep masakan).
    *   *AC*: Jika referensi PDF tidak ditemukan, AI wajib menolak menjawab dengan sopan: *"Maaf, informasi tidak ditemukan. Apakah Anda ingin berbicara dengan Petugas?"* disertai tombol *Live Chat*.

### EPIC 3: Dynamic Menu Builder (Portal Admin)
Kumpulan fitur pengelolaan hierarki menu interaktif WA (tanpa *coding*).

*   **Story 3.1 - Pembuat Menu Dinamis**: Sebagai Admin, saya ingin membuat tombol *Menu Utama* dan *Sub-Menu* secara visual (*Tree/Node*), agar saya bisa mengganti layanan kapan saja.
    *   *AC*: UI menyediakan fitur tambah/edit/hapus Menu. Admin bisa menentukan aksi menu: *Kirim Teks*, *Kirim Gambar*, *Kirim PDF*, atau *Alihkan ke CS*.
*   **Story 3.2 - Auto-Reply Jam Kerja**: Sebagai Admin, saya ingin bot otomatis mengirim pesan "Kantor Tutup" apabila pengguna menekan menu *Live Chat* di atas jam 16:00.
    *   *AC*: Terdapat pengaturan parameter jam buka-tutup kantor di menu *Settings*.

### EPIC 4: Live Chat Inbox & Handoff
Kumpulan fitur peralihan kendali obrolan dari Bot ke Manusia.

*   **Story 4.1 - Centralized Inbox**: Sebagai CS, saya ingin melihat semua pesan WhatsApp warga yang masuk di sebuah antarmuka rapi seperti WhatsApp Web, agar saya bisa merespons mereka dari komputer.
    *   *AC*: *Dashboard Live Chat* menampilkan daftar obrolan (*Sidebar*) dan jendela percakapan. Sinkronisasi *real-time*.
*   **Story 4.2 - Intervensi (Takeover & Resolve)**: Sebagai CS, saya ingin menghentikan respons AI secara paksa ketika saya sedang mengetik balasan untuk warga tertentu, agar bot tidak ikut campur membalas (*bentrok*).
    *   *AC*: Tombol `Takeover` (Bot berhenti merespons nomor tersebut). Tombol `Resolve` (Obrolan selesai, bot aktif kembali untuk nomor tersebut).

---

## 4. Keamanan & Performa (NFR)
1.  **Privasi Data**: Dilarang keras menggunakan API eksternal (OpenAI/ChatGPT/Gemini) untuk modul AI. Semuanya menggunakan *Engine Local* Ollama (Qwen 2) untuk jaminan keamanan rahasia negara.
2.  **Concurrency**: Server Node.js (berbasis **Express JS & TypeScript**) harus mampu memproses antrean minimal 500 pesan masuk secara simultan tanpa *crash*.
3.  **Waktu Respons AI**: Pemrosesan *Retrieval-Augmented Generation* (RAG) ditargetkan memiliki durasi tunggu maksimal 5-8 detik per pertanyaan kompleks (bergantung pada kapabilitas *Hardware* VPS 16GB RAM).

---

## 5. Timeline Rilis (2 Minggu / 14 Hari)
*   **Sprint 1 (Hari 1-5)**: Setup VPS, Instalasi Qwen 2, Arsitektur PostgreSQL, & Koneksi Gateway Baileys pada backend **Express JS (TypeScript)**.
*   **Sprint 2 (Hari 6-10)**: Pembangunan Pipeline Vektor AI (RAG) & *Frontend* Portal Admin menggunakan **React JS + TailwindCSS (TypeScript)**.
*   **Sprint 3 (Hari 11-14)**: Modul *Live Chat*, *System Testing*, Anti-Spam *tuning*, *Go-Live*.
