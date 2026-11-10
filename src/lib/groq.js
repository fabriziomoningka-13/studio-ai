import { buildPrompt } from './anthropic';

// Fallback 2 — Groq, Llama 3 (Bagian 10.1 & 10.2)
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const COOLDOWN_RATE_LIMIT_MS = 60_000; // 429: tunggu 1 menit
const COOLDOWN_INVALID_MS = 3_600_000; // 401/403: skip 1 jam

// State level modul (bertahan selama instance serverless masih hangat)
let cursor = 0;
const cooldownUntil = new Map(); // key -> timestamp

function loadKeys() {
  const keys = [];
  for (let i = 1; i <= 5; i++) {
    const k = process.env[`GROQ_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  // kompatibel dengan format lama (satu key)
  if (!keys.length && process.env.GROQ_API_KEY?.trim()) {
    keys.push(process.env.GROQ_API_KEY.trim());
  }
  return keys;
}

async function requestGroq(apiKey, body) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Ambil isi error dari Groq supaya penyebab 404/400 terlihat di log
    let detail = '';
    try {
      detail = (await res.text()).slice(0, 300);
    } catch {
      // abaikan kalau body tidak bisa dibaca
    }
    const err = new Error(`Groq error: ${res.status} ${detail}`.trim());
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq: response kosong');
  return text;
}

export async function callGroq({ nama_produk, industri, tone, explorationHint }, strict = false) {
  const { system, user } = buildPrompt({ nama_produk, industri, tone, explorationHint }, strict);

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
    temperature: 1,
  };

  const keys = loadKeys();
  if (!keys.length) throw new Error('Groq: tidak ada GROQ_API_KEY yang dikonfigurasi');

  let lastErr;
  for (let n = 0; n < keys.length; n++) {
    const idx = (cursor + n) % keys.length;
    const key = keys[idx];
    if ((cooldownUntil.get(key) ?? 0) > Date.now()) continue;

    try {
      const text = await requestGroq(key, body);
      cursor = idx; // tetap pakai key yang berhasil
      return text;
    } catch (err) {
      const rotatable = [401, 403, 429].includes(err.status);
      if (!rotatable) throw err; // 400/404/500/dll: jangan rotate, masalahnya bukan di key

      const cooldown = err.status === 429 ? COOLDOWN_RATE_LIMIT_MS : COOLDOWN_INVALID_MS;
      cooldownUntil.set(key, Date.now() + cooldown);
      console.warn(`Groq key #${idx + 1} gagal (${err.status}), pindah ke key berikutnya`);
      lastErr = err;
      cursor = (idx + 1) % keys.length;
    }
  }

  throw lastErr ?? new Error('Groq: semua key sedang cooldown');
}