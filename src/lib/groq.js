import { buildPrompt } from './anthropic';

// Fallback 2 — Groq, Llama 3 (Bagian 10.1 & 10.2)
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function callGroq({ nama_produk, industri, tone, explorationHint }, strict = false) {
  const { system, user } = buildPrompt({ nama_produk, industri, tone, explorationHint }, strict);

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: { type: 'json_object' },
      temperature: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Groq: response kosong');
  }

  return text;
}
