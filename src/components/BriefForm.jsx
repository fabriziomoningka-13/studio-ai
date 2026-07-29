'use client';

import { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

const INDUSTRI_OPTIONS = [
  { value: 'fintech', label: 'Fintech' },
  { value: 'fnb', label: 'F&B' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'edukasi', label: 'Edukasi' },
  { value: 'lainnya', label: 'Lainnya' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'playful', label: 'Playful' },
  { value: 'minimalis', label: 'Minimalis' },
];

const fieldClass =
  'w-full bg-background border border-white/15 rounded-lg px-3 py-2 text-sm text-text-main ' +
  'placeholder:text-text-main/40 focus:border-secondary/60 transition-all duration-200';

export default function BriefForm({ onGenerate, isLoading, cooldown }) {
  const [namaProduk, setNamaProduk] = useState('');
  const [industri, setIndustri] = useState('');
  const [tone, setTone] = useState('');
  const [touched, setTouched] = useState(false);

  const namaProdukInvalid = touched && namaProduk.trim().length === 0;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);

    if (!namaProduk.trim() || !industri || !tone) return;

    onGenerate({ nama_produk: namaProduk.trim(), industri, tone });
  }

  return (
    <Card as="form" onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <div>
        <h2 className="font-heading text-lg mb-1">Brief Produk</h2>
        <p className="text-xs text-text-main/50">
          Isi brief singkat, AI akan buatkan draf copy & tema landing page.
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-text-main/70">Nama produk / bisnis</span>
        <input
          type="text"
          value={namaProduk}
          onChange={(e) => setNamaProduk(e.target.value)}
          placeholder="mis. Kopi Kelana"
          maxLength={100}
          className={`${fieldClass} ${namaProdukInvalid ? 'border-error/60' : ''}`}
          aria-invalid={namaProdukInvalid}
        />
        {namaProdukInvalid && (
          // Microcopy error — Bagian 14
          <span role="alert" className="text-xs text-error">Yuk lengkapi nama produk dulu sebelum generate.</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-text-main/70">Industri</span>
        <select
          value={industri}
          onChange={(e) => setIndustri(e.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>Pilih industri</option>
          {INDUSTRI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-text-main/70 mb-1">Tone</legend>
        <div className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setTone(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200
                ${tone === opt.value
                  ? 'bg-secondary/15 border-secondary/60 text-secondary'
                  : 'border-white/15 text-text-main/70 hover:border-white/30'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={isLoading || cooldown} className="mt-auto">
        {isLoading ? 'Generating…' : 'Generate'}
      </Button>
    </Card>
  );
}
