const MAX_LEN = 100; // Bagian 12.2 — uji nama produk > 100 karakter

const INDUSTRI_ENUM = ['fintech', 'fnb', 'fashion', 'edukasi', 'lainnya'];
const TONE_ENUM = ['professional', 'playful', 'minimalis'];

/**
 * Bersihkan teks bebas (nama_produk) sebelum masuk prompt:
 * - potong ke MAX_LEN karakter
 * - hapus karakter kontrol
 * - escape delimiter tag <brief>/</brief> supaya tidak bisa "menutup" tag lebih awal
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';

  return input
    .slice(0, MAX_LEN)
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/</g, '‹')
    .replace(/>/g, '›')
    .trim();
}

/**
 * Validasi & sanitasi seluruh body request /api/generate.
 * Return { valid, errors, data } — data sudah bersih & siap dipakai di prompt.
 */
export function validateAndSanitize(body) {
  const errors = [];

  const nama_produk = sanitizeText(body?.nama_produk);
  if (!nama_produk) errors.push('nama_produk wajib diisi');

  const industri = String(body?.industri || '').toLowerCase();
  if (!INDUSTRI_ENUM.includes(industri)) errors.push('industri tidak valid');

  const tone = String(body?.tone || '').toLowerCase();
  if (!TONE_ENUM.includes(tone)) errors.push('tone tidak valid');

  return {
    valid: errors.length === 0,
    errors,
    data: { nama_produk, industri, tone },
  };
}
