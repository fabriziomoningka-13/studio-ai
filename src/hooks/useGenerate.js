'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// Cegah double-submit — tombol disable beberapa detik setelah diklik (Bagian 11.1)
const SUBMIT_COOLDOWN_MS = 3000;

// Riwayat generate — tersimpan sementara di sessionStorage, bukan database
// (Bagian 7: fitur opsional, karena tanpa akun/login).
const HISTORY_KEY = 'studio-ai:history';
const HISTORY_MAX = 10;

function loadHistory() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(list) {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // sessionStorage bisa penuh/diblokir — riwayat cuma pelengkap, diamkan saja
  }
}

export function useGenerate() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { copy_variants, theme, provider_used }
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [cooldown, setCooldown] = useState(false);
  const [history, setHistory] = useState([]);
  const cooldownTimer = useRef(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const generate = useCallback(async (brief) => {
    if (cooldown) return;

    setStatus('loading');
    setError(null);
    setCooldown(true);
    cooldownTimer.current = setTimeout(() => setCooldown(false), SUBMIT_COOLDOWN_MS);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brief),
      });

      const data = await res.json();

      if (!res.ok) {
        // Microcopy error dari route.js (Bagian 14) sudah siap tampil ke user
        setStatus('error');
        setError(data?.error || 'Terjadi kesalahan, coba lagi.');
        return;
      }

      setResult(data);
      setSelectedVariant(0);
      setStatus('success');

      const entry = { id: Date.now(), brief, result: data };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, HISTORY_MAX);
        saveHistory(next);
        return next;
      });
    } catch (err) {
      setStatus('error');
      setError('Tidak bisa menghubungi server. Cek koneksi internet kamu.');
    }
  }, [cooldown]);

  const restoreFromHistory = useCallback((entry) => {
    setResult(entry.result);
    setSelectedVariant(0);
    setStatus('success');
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return {
    status,
    error,
    result,
    selectedVariant,
    setSelectedVariant,
    cooldown,
    generate,
    isLoading: status === 'loading',
    history,
    restoreFromHistory,
    clearHistory,
  };
}
