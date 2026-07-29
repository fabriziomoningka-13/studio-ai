// Rate limiter in-memory sederhana — cukup untuk skala portofolio (Bagian 11.1).
// CATATAN: reset saat server restart/serverless cold start. Untuk versi lebih
// tahan lintas-instance, ganti dengan @upstash/ratelimit (Upstash Redis, free tier).

const WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_REQUESTS = 5; // maksimal 5x generate per window

const hits = new Map(); // ip -> array of timestamps

export function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip || 'unknown';
  const timestamps = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfterMs = WINDOW_MS - (now - timestamps[0]);
    return { allowed: false, retryAfterMs };
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return { allowed: true };
}
