const HEX_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const MAX_TEXT_LEN = 200; // guard headline/subheadline/cta kepanjangan — Bagian 12.1
const MIN_TEXT_LEN = 3;   // guard "response terlalu pendek/kosong" — Bagian 12.1

class SchemaError extends Error {}

/**
 * Ambil JSON dari teks response AI, jaga-jaga kalau provider menambahkan
 * code fence (```json ... ```) atau teks pembuka/penutup di luar JSON.
 */
function extractJson(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    // Fallback: ambil substring dari { pertama sampai } terakhir
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start === -1 || end === -1) {
      throw new SchemaError('Tidak ditemukan JSON pada response AI');
    }
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      throw new SchemaError('JSON tidak valid (parse gagal)');
    }
  }
}

function isNonEmptyString(v, maxLen = MAX_TEXT_LEN, minLen = MIN_TEXT_LEN) {
  return typeof v === 'string' && v.trim().length >= minLen && v.length <= maxLen;
}

/**
 * Validasi struktur sesuai kontrak Bagian 4.2. Melempar SchemaError kalau
 * field kosong/hilang/format salah — supaya route.js bisa trigger retry/fallback.
 */
function validateStructure(obj) {
  if (!obj || typeof obj !== 'object') {
    throw new SchemaError('Response bukan object');
  }

  const variants = obj.copy_variants;
  if (!Array.isArray(variants) || variants.length < 2 || variants.length > 3) {
    throw new SchemaError('copy_variants harus 2-3 item');
  }
  for (const v of variants) {
    if (!isNonEmptyString(v?.headline) || !isNonEmptyString(v?.subheadline) || !isNonEmptyString(v?.cta, 40)) {
      throw new SchemaError('Field copy_variants tidak lengkap/terlalu panjang');
    }
  }

  const theme = obj.theme;
  if (!theme || typeof theme !== 'object') {
    throw new SchemaError('theme hilang');
  }
  if (!Array.isArray(theme.colors) || theme.colors.length < 4 || theme.colors.length > 5) {
    throw new SchemaError('theme.colors harus 4-5 item');
  }
  if (!theme.colors.every((c) => typeof c === 'string' && HEX_REGEX.test(c))) {
    throw new SchemaError('theme.colors berisi kode hex tidak valid');
  }
  if (!isNonEmptyString(theme.font_heading, 60) || !isNonEmptyString(theme.font_body, 60)) {
    throw new SchemaError('theme.font_heading/font_body tidak valid');
  }
  if (!isNonEmptyString(theme.reasoning, 300)) {
    throw new SchemaError('theme.reasoning tidak valid');
  }

  return {
    copy_variants: variants.map((v) => ({
      headline: v.headline.trim(),
      subheadline: v.subheadline.trim(),
      cta: v.cta.trim(),
    })),
    theme: {
      colors: theme.colors,
      font_heading: theme.font_heading.trim(),
      font_body: theme.font_body.trim(),
      reasoning: theme.reasoning.trim(),
    },
  };
}

/**
 * Parse teks mentah dari provider AI manapun -> bentuk normal sesuai Bagian 4.2.
 * `provider_used` ditambahkan terpisah oleh caller (aiProvider.js).
 */
export function parseAndNormalize(rawText) {
  const json = extractJson(rawText);
  return validateStructure(json);
}

export { SchemaError };
