import { callAnthropic } from './anthropic';
import { callGemini } from './gemini';
import { callGroq } from './groq';
import { parseAndNormalize, SchemaError } from './schema';

const PROVIDERS = [
  { name: 'anthropic', call: callAnthropic },
  { name: 'gemini', call: callGemini },
  { name: 'groq', call: callGroq },
];

// Arah eksplorasi background — dipilih ACAK di server (bukan diserahkan ke model),
// supaya hasil generate benar-benar bervariasi antar percobaan alih-alih model
// selalu konvergen ke jawaban "teraman" (putih/netral). Ini terutama penting
// untuk provider fallback (Llama di Groq) yang cenderung kurang eksploratif.
const BACKGROUND_HINTS = [
  'gunakan latar GELAP (dark mode) dengan aksen warna cerah',
  'gunakan latar TERANG/putih bersih dengan aksen warna berani',
  'gunakan latar PASTEL lembut (bukan putih polos, tapi warna pastel bernuansa)',
  'gunakan latar warna HANGAT (krem/beige/terracotta), bukan putih',
  'gunakan latar warna GELAP JENUH (navy/charcoal/forest green) dengan aksen metalik/terang',
  'gunakan warna BERANI sebagai dominan (bukan netral sama sekali), dengan teks kontras tinggi',
];

function pickExplorationHint() {
  return BACKGROUND_HINTS[Math.floor(Math.random() * BACKGROUND_HINTS.length)];
}

/**
 * Panggil satu provider, coba parse. Kalau JSON tidak valid -> retry 1x
 * dengan instruksi lebih ketat (Bagian 5). Kalau tetap gagal, lempar error
 * supaya aiProvider pindah ke provider berikutnya.
 */
async function callProviderWithRetry(providerFn, data) {
  const rawFirst = await providerFn(data, false);
  try {
    return parseAndNormalize(rawFirst);
  } catch (err) {
    if (!(err instanceof SchemaError)) throw err;
    console.warn('Parse gagal, retry dengan instruksi lebih ketat:', err.message);
    const rawRetry = await providerFn(data, true);
    return parseAndNormalize(rawRetry); // kalau masih gagal, error dilempar ke caller
  }
}

/**
 * Coba provider utama (Anthropic) dulu, lalu fallback berurutan ke Gemini,
 * lalu Groq, sesuai pseudocode Bagian 10.2. Mengembalikan hasil ternormalisasi
 * (Bagian 4.2) + provider_used.
 */
export async function generateWithFallback(data) {
  const errors = [];
  const explorationHint = pickExplorationHint();
  const payload = { ...data, explorationHint };

  for (const provider of PROVIDERS) {
    try {
      const result = await callProviderWithRetry(provider.call, payload);
      return { ...result, provider_used: provider.name };
    } catch (err) {
      console.warn(`Provider "${provider.name}" gagal:`, err.message);
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  // Semua provider (utama + fallback) gagal -> lempar error gabungan,
  // ditangani route.js jadi microcopy "Retry gagal" (Bagian 14).
  throw new Error(`Semua provider AI gagal. Detail: ${errors.join(' | ')}`);
}
