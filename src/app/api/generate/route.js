import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { validateAndSanitize } from '@/lib/sanitize';
import { generateWithFallback } from '@/lib/aiProvider';

// Microcopy error states — Bagian 14
const MSG = {
  RATE_LIMIT:
    'Kamu sudah generate cukup sering dalam beberapa menit terakhir. Tunggu sebentar sebelum coba lagi.',
  INPUT_INVALID: 'Yuk lengkapi nama produk dulu sebelum generate.',
  ALL_PROVIDERS_FAILED: 'AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.',
  TIMEOUT: 'Server AI sedang lambat merespons. Coba klik Generate sekali lagi ya.',
};

function getClientIp(req) {
  // Vercel meneruskan IP asli lewat header ini di belakang proxy
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

export async function POST(req) {
  // 1. Rate limit — Bagian 11.1
  const ip = getClientIp(req);
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: MSG.RATE_LIMIT, retryAfterMs: rl.retryAfterMs },
      { status: 429 }
    );
  }

  // 2. Parse & sanitasi input — Bagian 4.1 & 11.2
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: MSG.INPUT_INVALID }, { status: 400 });
  }

  const { valid, errors, data } = validateAndSanitize(body);
  if (!valid) {
    return NextResponse.json({ error: MSG.INPUT_INVALID, details: errors }, { status: 400 });
  }

  // 3. Panggil AI (utama + fallback), parse & normalisasi — Bagian 5 & 10
  try {
    const result = await generateWithFallback(data);
    // result sudah berbentuk { copy_variants, theme, provider_used } — Bagian 4.2
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('generateWithFallback gagal total:', err.message);

    const isTimeout = /timeout|ETIMEDOUT|AbortError/i.test(err.message);
    const message = isTimeout ? MSG.TIMEOUT : MSG.ALL_PROVIDERS_FAILED;

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
