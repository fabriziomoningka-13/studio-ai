// tests/rateLimit.test.mjs
// Test otomatis untuk src/lib/rateLimit.js — cover skenario Bagian 11.1 & 12.2
// (klik Generate berkali-kali cepat harus kena limit).
// Jalankan: node tests/rateLimit.test.mjs

import { checkRateLimit } from '../src/lib/rateLimit.js';

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

ok('5 request pertama dari IP yang sama diizinkan', () => {
  const ip = '10.0.0.1';
  for (let i = 0; i < 5; i++) {
    const { allowed } = checkRateLimit(ip);
    if (!allowed) throw new Error(`request ke-${i + 1} seharusnya diizinkan`);
  }
});

ok('request ke-6 dalam window sama -> ditolak (429)', () => {
  const ip = '10.0.0.2';
  for (let i = 0; i < 5; i++) checkRateLimit(ip);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (allowed) throw new Error('request ke-6 seharusnya ditolak');
  if (typeof retryAfterMs !== 'number' || retryAfterMs <= 0) {
    throw new Error('retryAfterMs harus angka positif supaya microcopy bisa kasih estimasi tunggu');
  }
});

ok('IP berbeda tidak saling mempengaruhi limit satu sama lain', () => {
  const ipA = '10.0.0.3';
  const ipB = '10.0.0.4';
  for (let i = 0; i < 5; i++) checkRateLimit(ipA);
  const resultB = checkRateLimit(ipB);
  if (!resultB.allowed) throw new Error('IP B seharusnya tidak terkena limit IP A');
});

ok('IP kosong/undefined tidak bikin crash (fallback ke "unknown")', () => {
  const { allowed } = checkRateLimit(undefined);
  if (typeof allowed !== 'boolean') throw new Error('harus tetap mengembalikan hasil valid');
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
