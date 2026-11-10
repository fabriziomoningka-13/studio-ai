# Studio AI

**Generator copy & tema landing page instan.** Isi brief singkat, lalu AI membuatkan draf headline, subheadline, CTA, palet warna, dan pasangan font, lengkap dengan live preview yang "membangun diri" secara animasi.

Studio AI adalah project portofolio yang menggabungkan web development, UI/UX design, dan integrasi AI API dengan pendekatan product-thinking: bukan sekadar wrapper API, tetapi tool fungsional dengan fallback provider, validasi output, dan kontrol keamanan dasar.

> Project ini dibuat untuk kebutuhan portofolio dan dirancang agar bisa dijalankan dengan biaya Rp0 memakai free tier/credit provider yang tersedia.

---

## ✨ Fitur Utama

- **Brief Produk**: input nama produk/bisnis, industri (dropdown), dan tone (Professional / Playful / Minimalis).
- **Varian Copy**: 2-3 varian headline, subheadline, dan CTA. Klik salah satu untuk mengganti pilihan, atau salin ke clipboard dengan satu klik.
- **Tema Visual**: palet 4-5 warna (lengkap dengan kode hex) dan rekomendasi pasangan font heading + body.
- **Regenerate Terpisah**: buat ulang *copy* saja atau *tema* saja tanpa mengulang semuanya.
- **Live Preview**: mini landing page yang tampil dan berubah otomatis saat varian copy dipilih, tanpa reload.
- **Export HTML**: unduh hasil (copy + tema) sebagai file HTML sederhana.
- **Riwayat**: hasil generate tersimpan sementara di `sessionStorage` (tanpa login dan tanpa database).
- **Multi-Provider dengan Fallback Otomatis**: Anthropic Claude → Gemini → Groq. Badge di panel Varian Copy menunjukkan provider yang benar-benar dipakai.
- **Rotasi Hingga 5 API Key Groq**: kalau satu key kena limit atau tidak valid, sistem pindah ke key berikutnya secara otomatis.
- **Validasi & Retry Output AI**: respons dipaksa berformat JSON, divalidasi terhadap schema, dan di-retry sekali dengan instruksi lebih ketat jika tidak valid.
- **Keamanan Ringan**: rate limiting dan sanitasi input untuk mencegah prompt injection.
- **Aksesibilitas & Responsif**: tampilan 1 kolom di mobile, 2 kolom di tablet, 3 kolom di desktop.

---

## 🏗️ Arsitektur & Alur Kerja

```
User isi brief (nama produk, industri, tone)
        │  klik "Generate"
        ▼
POST /api/generate
        │
        ├─ 1. Cek rate limit
        ├─ 2. Sanitasi input & susun prompt terstruktur
        ├─ 3. Panggil provider AI lewat aiProvider.js
        │       Anthropic ──gagal──▶ Gemini ──gagal──▶ Groq (rotasi 5 key)
        ├─ 4. Parse & validasi JSON (schema.js)
        │       tidak valid → retry 1x dengan instruksi lebih ketat
        ▼
JSON bersih → frontend
        ▼
Render: varian copy + swatch warna + Live Preview (animasi Framer Motion)
```

Semua API key hanya dibaca di server (API Route). Tidak ada key yang dikirim ke browser.

### Variasi Hasil

Arah gaya latar (gelap, terang, pastel, hangat, dan seterusnya) dipilih **acak di sisi server** lalu dikirim ke prompt sebagai petunjuk eksplorasi. Dengan begitu hasil antar percobaan lebih bervariasi dan tidak selalu konvergen ke tema putih/netral, terutama pada provider fallback yang cenderung kurang eksploratif.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Animasi | Framer Motion, Tailwind `transition-*` |
| Backend | Next.js API Routes (`/api/generate`) |
| AI (utama) | Anthropic Claude (Haiku) |
| AI (fallback 1) | Google Gemini (Flash) |
| AI (fallback 2) | Groq, model `openai/gpt-oss-120b` (default, bisa diganti lewat env) |
| Rate limiter | In-memory, atau Upstash Redis (opsional) |
| Font | `next/font` (Fraunces, Inter, IBM Plex Mono) |
| Hosting | Vercel (Hobby/free tier) |
| Test | Node test runner (`tests/*.test.mjs`) |

---

## 📁 Struktur Folder

```
studio-ai/
├── public/
│   └── og-image.png            # gambar Open Graph
├── src/
│   ├── app/
│   │   ├── page.jsx            # dashboard utama (single page)
│   │   ├── layout.jsx          # metadata SEO & Open Graph
│   │   ├── globals.css
│   │   └── api/generate/
│   │       └── route.js        # endpoint: rate limit + panggil provider
│   ├── components/             # BriefForm, CopyVariants, ThemeSwatches, PreviewPanel, ui/
│   ├── hooks/
│   │   └── useGenerate.js      # state proses generate
│   └── lib/
│       ├── aiProvider.js       # urutan provider & fallback
│       ├── anthropic.js        # provider utama + prompt template
│       ├── gemini.js           # fallback 1
│       ├── groq.js             # fallback 2 + rotasi 5 API key
│       ├── schema.js           # validasi & normalisasi JSON dari AI
│       ├── sanitize.js         # sanitasi input & guard prompt injection
│       ├── rateLimit.js        # rate limiter
│       └── exportHtml.js       # export hasil ke file HTML
├── tests/
│   ├── rateLimit.test.mjs
│   ├── sanitize.test.mjs
│   └── schema.test.mjs
├── .env.example
├── TESTING.md
└── README.md
```

---

## 🚀 Menjalankan Secara Lokal

**Prasyarat**
- Node.js 18 atau lebih baru
- Minimal satu API key dari salah satu provider (Anthropic, Gemini, atau Groq)

**Instalasi**

```bash
# clone repository ini, lalu masuk ke foldernya
cd studio-ai
npm install
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

> Setiap kali mengubah `.env.local`, hentikan server (`Ctrl+C`) lalu jalankan lagi `npm run dev`. Next.js hanya membaca file env saat start.

---

## 🔐 Environment Variables

Isi di `.env.local` (lokal) atau di Vercel → Project Settings → Environment Variables (produksi).

| Key | Wajib | Keterangan |
|---|---|---|
| `ANTHROPIC_API_KEY` | Tidak* | API key Claude, provider utama |
| `GEMINI_API_KEY` | Tidak* | API key Gemini, fallback 1 |
| `GROQ_API_KEY_1` … `GROQ_API_KEY_5` | Tidak* | API key Groq untuk rotasi. Isi sebanyak yang tersedia (minimal 1) |
| `GROQ_MODEL` | Tidak | Model Groq. Default: `openai/gpt-oss-120b` |
| `UPSTASH_REDIS_REST_URL` | Tidak | Opsional, rate limiter berbasis Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Tidak | Opsional, pasangan dari URL di atas |

\* Isi minimal satu provider. Provider tanpa key atau tanpa kredit akan dilewati dan sistem lanjut ke provider berikutnya.

Contoh `.env.local`:

```env
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

GROQ_API_KEY_1=
GROQ_API_KEY_2=
GROQ_API_KEY_3=
GROQ_API_KEY_4=
GROQ_API_KEY_5=
GROQ_MODEL=openai/gpt-oss-120b

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

**Catatan keamanan**
- Jangan pernah commit `.env.local` (pastikan ada di `.gitignore`).
- Jangan membagikan screenshot yang menampilkan isi `.env.local`. Jika key terlanjur terlihat, revoke dan buat ulang di dashboard provider.
- Env baru di Vercel baru berlaku setelah **redeploy**.

---

## 🔁 Provider AI & Strategi Fallback

Urutan pemanggilan (`src/lib/aiProvider.js`):

1. **Anthropic (Claude)**: provider utama.
2. **Gemini**: dipanggil jika Anthropic gagal (kredit habis, rate limit, timeout, error).
3. **Groq**: dipanggil jika Gemini juga gagal.

Untuk setiap provider, jika JSON tidak valid maka dilakukan **1x retry** dengan instruksi lebih ketat sebelum pindah ke provider berikutnya. Jika semua provider gagal, pengguna melihat pesan: *"AI sedang mengalami gangguan. Silakan coba beberapa saat lagi."*

Setiap respons membawa `provider_used` (`anthropic` / `gemini` / `groq`) yang ditampilkan sebagai badge di UI untuk transparansi dan debugging.

### Rotasi API Key Groq (`src/lib/groq.js`)

| Kondisi | Perilaku |
|---|---|
| Request berhasil | Key yang sama tetap dipakai pada request berikutnya |
| `429` (rate limit) | Key di-skip selama 1 menit, pindah ke key berikutnya |
| `401` / `403` (key invalid/expired) | Key di-skip selama 1 jam, pindah ke key berikutnya |
| Error lain (`400`, `404`, `500`, dan seterusnya) | Tidak memicu rotasi, karena masalahnya bukan di key |
| Semua key gagal atau cooldown | Error dilempar sehingga `aiProvider` menangani sesuai urutan fallback |

Hal yang perlu diketahui:
- Kuota Groq dihitung **per akun/organisasi**. Gunakan key dari akun berbeda agar kuota benar-benar bertambah.
- Status cooldown disimpan di memori per instance serverless dan bisa reset saat cold start. Untuk skala portofolio ini aman.
- Jika Groq mengembalikan `404 model_not_found`, ganti nilai `GROQ_MODEL` dengan model yang tersedia di akun Anda (daftar ada di `https://api.groq.com/openai/v1/models`). Model harus mendukung `response_format: json_object`.

---

## 📡 Kontrak API

### `POST /api/generate`

**Request**

| Field | Tipe | Keterangan |
|---|---|---|
| `nama_produk` | string | Wajib. Disanitasi sebelum masuk prompt |
| `industri` | string (enum) | `fintech`, `fnb`, `fashion`, `edukasi`, `lainnya` |
| `tone` | string (enum) | `professional`, `playful`, `minimalis` |

**Response `200 OK`**

| Field | Tipe | Keterangan |
|---|---|---|
| `copy_variants` | array of object | 2-3 objek `{ headline, subheadline, cta }` |
| `theme.colors` | array of string | 4-5 kode warna hex |
| `theme.font_heading` | string | Font untuk judul |
| `theme.font_body` | string | Font untuk isi |
| `provider_used` | string | Provider yang benar-benar dipakai |

Output semua provider dinormalisasi oleh `schema.js` ke satu bentuk JSON yang sama sebelum dikirim ke frontend.

---

## 🔒 Keamanan & Kontrol Biaya

Karena tidak ada login, siapa pun yang membuka link bisa menekan "Generate". Langkah yang diterapkan:

- **Rate limiting**: pembatasan jumlah generate per periode waktu. Memakai limiter in-memory, atau Upstash Redis jika `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` diisi.
- **Anti double-submit**: tombol Generate dinonaktifkan sementara setelah diklik.
- **Sanitasi input** (`sanitize.js`): batas panjang karakter, penghapusan karakter kontrol, dan escape delimiter khusus.
- **Pemisahan instruksi dan input**: prompt template memisahkan instruksi sistem dari input pengguna dengan delimiter yang jelas.
- **Validasi output**: respons AI yang tidak sesuai schema ditolak dan tidak diteruskan mentah ke frontend.
- **API key hanya di server**: tidak pernah di-hardcode atau dikirim ke browser.

---

## 🧪 Testing

Unit test untuk logika inti ada di folder `tests/`:

- `rateLimit.test.mjs`: perilaku rate limiter
- `sanitize.test.mjs`: sanitasi input dan guard prompt injection
- `schema.test.mjs`: parsing dan normalisasi respons AI

Panduan lengkap, termasuk skenario manual (JSON tidak valid, field kosong, provider down, input sangat panjang atau berisi karakter spesial, double-submit, uji di 3 breakpoint, dan accessibility), ada di [`TESTING.md`](./TESTING.md).

---

## 🎨 Desain & Interaksi

- **Dark-first**: tema gelap sebagai identitas utama, dengan aksen warna cerah dan kontras teks yang mengikuti WCAG AA.
- **Tipografi**: Fraunces untuk heading/display, Inter untuk body, IBM Plex Mono untuk kode warna dan label teknis.
- **Signature interaction**: Live Preview "membangun diri" secara berurutan: headline (fade-in + slide-up), subheadline, CTA (scale-in), lalu swatch dan font. Tiap elemen berdurasi sekitar 300-400ms dengan stagger sekitar 100-150ms. Saat varian copy diganti, hanya teks yang berubah yang dianimasikan ulang.
- **Loading & empty state**: skeleton loading (bukan spinner polos) dan empty state yang ramah sebelum generate pertama.
- **Aksesibilitas**: focus ring jelas, navigasi keyboard penuh, dukungan `prefers-reduced-motion`, dan label form yang accessible.

---

## ☁️ Deployment (Vercel)

1. Push source code ke GitHub.
2. Import repository di [Vercel](https://vercel.com) (Hobby/free tier).
3. Tambahkan semua Environment Variables dari tabel di atas.
4. Deploy. Setiap push ke branch utama akan otomatis ter-deploy.
5. Setelah mengubah env, lakukan **Redeploy** agar perubahan terbaca.

Sebelum demo penting, pastikan free credit/free tier semua provider masih aktif.

---

## 💡 Keputusan Desain

- **Single-page dashboard**: tool ini satu alur kerja (brief → hasil → preview), jadi tidak butuh routing multi-halaman. Semua panel terlihat sekaligus.
- **Claude sebagai provider utama**: menunjukkan integrasi Claude API sebagai nilai jual portofolio, dengan model yang murah dan cepat untuk task generate copy.
- **Fallback bertingkat**: demo tidak bergantung pada satu provider. Kalau kredit habis atau kena limit, pengguna tetap mendapat hasil.
- **Rotasi key Groq**: menambah ketahanan terhadap rate limit tanpa biaya.
- **Tanpa database & login**: scope kecil dan fokus ke kualitas produk. Riwayat cukup di `sessionStorage`.
- **Validasi schema ketat**: output AI tidak pernah dipercaya mentah-mentah.
- **Pilihan arah desain acak di server**: mencegah hasil yang monoton antar percobaan.

---

## 🗺️ Roadmap

- [ ] Analytics sederhana (jumlah generate dan distribusi provider yang dipakai)
- [ ] Provider fallback tambahan (misalnya OpenRouter model gratis)
- [ ] Opsi export tema sebagai CSS variables / konfigurasi Tailwind
- [ ] Custom domain

---

## 👤 Pembuat

Dikembangkan oleh **Fabrizio Kevin Moningka**: perancangan sistem, integrasi AI, UI/UX, hingga deployment.

📧 kevinkmoningka@gmail.com
💼 [LinkedIn](https://linkedin.com/in/fabrizio-kevin-moningka-710598419)
💻 [GitHub](https://github.com/fabriziomoningka-13)