'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e) {
    e.stopPropagation(); // jangan trigger onSelect di parent (kartu varian)
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API bisa gagal di browser lama/permission ditolak — diamkan saja,
      // ini fitur pelengkap, bukan alur utama (Bagian 7: fitur opsional).
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Tersalin ke clipboard' : `${label}`}
      title={copied ? 'Tersalin!' : label}
      className={`inline-flex items-center gap-1 rounded-md p-1.5 text-text-main/50
        hover:text-secondary hover:bg-white/5 transition-all duration-200 ${className}`}
    >
      {copied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
    </button>
  );
}
