# Testing & QA — Fase 5 (Bagian 12)

## Otomatis (`npm test` — 24/24 lolos)

### 12.1 Skenario Response AI (`tests/schema.test.mjs`)
- [x] JSON tidak valid (trailing comma) → ditolak dengan benar
- [x] Teks tambahan di luar JSON (preamble dari model) → tetap ter-extract
- [x] Response bukan JSON sama sekali → SchemaError
- [x] `theme.colors` kosong → SchemaError
- [x] `theme` hilang total → SchemaError
- [x] `copy_variants` kurang dari minimum (1 item) → SchemaError
- [x] `theme.reasoning` hilang → SchemaError
- [x] Headline > 200 karakter (kepanjangan) → SchemaError
- [x] Headline < 3 karakter (kependekan) → SchemaError
- [x] Kode warna bukan hex valid → SchemaError

### 12.2 Skenario Input & Sanitasi (`tests/sanitize.test.mjs`)
- [x] Nama produk > 100 karakter → terpotong otomatis
- [x] Karakter kontrol (null byte, tab, dst) → dihapus
- [x] Percobaan prompt injection lewat tag `</brief>` → dinetralisasi
- [x] Karakter `<` `>` → diganti karakter aman (bukan dihapus, tetap kebaca user)
- [x] Field wajib kosong → validasi gagal dengan pesan jelas
- [x] Industri/tone di luar enum Bagian 4.1 → ditolak

### 11.1 Rate Limiting (`tests/rateLimit.test.mjs`)
- [x] 5 request pertama per IP diizinkan
- [x] Request ke-6 dalam window 10 menit → ditolak (429)
- [x] IP berbeda tidak saling memengaruhi limit
- [x] IP kosong/undefined tidak bikin crash

## Manual (butuh browser sungguhan — sudah dicoba selama development)
- [x] Provider utama down/kredit habis → fallback ke Gemini → Groq (terverifikasi lewat testing nyata, lihat riwayat chat)
- [x] Kontras warna dinamis (background terang/gelap hasil AI) → sudah di-fix
- [x] Variasi palet warna antar generate → sudah di-fix (explorationHint + temperature)
- [ ] Double-submit klik cepat di UI (cooldown tombol) — cek visual di browser
- [ ] Uji 3 breakpoint (mobile/tablet/desktop) — resize browser manual
- [ ] Lighthouse Accessibility audit + axe DevTools (Bagian 17)
- [ ] Screen reader (VoiceOver/NVDA) alur: isi form → generate → lihat hasil (Bagian 17)

## Cara menjalankan test otomatis
```bash
npm test
```
Menjalankan `tests/schema.test.mjs`, `tests/sanitize.test.mjs`, `tests/rateLimit.test.mjs` berurutan. Tidak butuh Jest/Vitest atau API key apa pun — murni logic lokal, jadi aman dijalankan kapan saja tanpa biaya provider AI.
