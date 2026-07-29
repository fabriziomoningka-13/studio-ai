// tests/schema.test.mjs
// Test otomatis untuk src/lib/schema.js — cover skenario Bagian 12.1.
// Jalankan: node tests/schema.test.mjs
// Tidak pakai test framework (Jest, dll) supaya tetap Rp0 & tanpa dependency tambahan.

import { parseAndNormalize, SchemaError } from '../src/lib/schema.js';

let pass = 0;
let fail = 0;

function ok(name, fn) {
  try {
    fn();
    pass++;
    console.log(`✓ ${name}`);
  } catch (err) {
    fail++;
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
  }
}

function expectThrow(fn, ErrorType = SchemaError) {
  try {
    fn();
  } catch (err) {
    if (err instanceof ErrorType) return;
    throw new Error(`Melempar error tipe salah: ${err.constructor.name}`);
  }
  throw new Error('Seharusnya melempar error, tapi tidak');
}

const validPayload = {
  copy_variants: [
    { headline: 'Judul Satu', subheadline: 'Subjudul penjelas produk', cta: 'Beli Sekarang' },
    { headline: 'Judul Dua', subheadline: 'Subjudul kedua yang berbeda', cta: 'Coba Gratis' },
  ],
  theme: {
    colors: ['#12172A', '#1FAE93', '#7FE7C4', '#8B9467', '#F7F7F7'],
    font_heading: 'Fraunces',
    font_body: 'Inter',
    reasoning: 'Teal & indigo dipilih untuk kesan modern-profesional.',
  },
};

// --- Kasus normal ---
ok('response valid ter-parse dengan benar', () => {
  const result = parseAndNormalize(JSON.stringify(validPayload));
  if (result.copy_variants.length !== 2) throw new Error('jumlah variants salah');
  if (result.theme.colors.length !== 5) throw new Error('jumlah warna salah');
});

// --- Bagian 12.1: AI mengembalikan JSON tidak valid ---
ok('JSON dengan trailing comma tertangani (fallback substring)', () => {
  const broken = `{"copy_variants":[{"headline":"A","subheadline":"B","cta":"C"},{"headline":"D","subheadline":"E","cta":"F"}],"theme":{"colors":["#111111","#222222","#333333","#444444"],"font_heading":"Inter","font_body":"Inter","reasoning":"cukup panjang untuk lolos validasi minimum"},}`;
  // Trailing comma bikin JSON.parse native gagal duluan tapi fallback substring juga
  // masih akan gagal parse (trailing comma tetap invalid) — pastikan error yang benar dilempar.
  expectThrow(() => parseAndNormalize(broken));
});

ok('teks tambahan di luar JSON (mis. "Here is the JSON:") tertangani', () => {
  const withPreamble = `Here is the JSON:\n${JSON.stringify(validPayload)}\nSemoga membantu!`;
  const result = parseAndNormalize(withPreamble);
  if (!result.theme) throw new Error('gagal extract JSON di antara teks lain');
});

ok('response bukan JSON sama sekali -> SchemaError', () => {
  expectThrow(() => parseAndNormalize('Maaf, saya tidak bisa membantu dengan itu.'));
});

// --- Bagian 12.1: field kosong/hilang ---
ok('theme.colors kosong -> SchemaError', () => {
  const bad = { ...validPayload, theme: { ...validPayload.theme, colors: [] } };
  expectThrow(() => parseAndNormalize(JSON.stringify(bad)));
});

ok('theme hilang total -> SchemaError', () => {
  const { theme, ...bad } = validPayload;
  expectThrow(() => parseAndNormalize(JSON.stringify(bad)));
});

ok('copy_variants cuma 1 item (kurang dari minimum 2) -> SchemaError', () => {
  const bad = { ...validPayload, copy_variants: [validPayload.copy_variants[0]] };
  expectThrow(() => parseAndNormalize(JSON.stringify(bad)));
});

ok('theme.reasoning hilang -> SchemaError', () => {
  const { reasoning, ...themeWithoutReasoning } = validPayload.theme;
  const bad = { ...validPayload, theme: themeWithoutReasoning };
  expectThrow(() => parseAndNormalize(JSON.stringify(bad)));
});

// --- Bagian 12.1: response terlalu panjang / terlalu pendek ---
ok('headline > 200 karakter -> SchemaError', () => {
  const bad = {
    ...validPayload,
    copy_variants: [
      { ...validPayload.copy_variants[0], headline: 'A'.repeat(201) },
      validPayload.copy_variants[1],
    ],
  };
  expectThrow(() => parseAndNormalize(JSON.stringify(bad)));
});

ok('headline kosong/1-2 karakter (terlalu pendek) -> SchemaError', () => {
  const bad = {
    ...validPayload,
    copy_variants: [
      { ...validPayload.copy_variants[0], headline: 'Hi' },
      validPayload.copy_variants[1],
    ],
  };
  expectThrow(() => parseAndNormalize(JSON.stringify(bad)));
});

// --- Warna hex tidak valid ---
ok('kode warna bukan hex valid -> SchemaError', () => {
  const bad = { ...validPayload, theme: { ...validPayload.theme, colors: ['bukan-hex', '#111', '#222', '#333'] } };
  expectThrow(() => parseAndNormalize(JSON.stringify(bad)));
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
