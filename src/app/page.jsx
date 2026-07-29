'use client';

import { useState } from 'react';
import { useGenerate } from '@/hooks/useGenerate';
import BriefForm from '@/components/BriefForm';
import CopyVariants from '@/components/CopyVariants';
import ThemeSwatches from '@/components/ThemeSwatches';
import PreviewPanel from '@/components/PreviewPanel';
import HistoryMenu from '@/components/HistoryMenu';

export default function DashboardPage() {
  const {
    status,
    error,
    result,
    selectedVariant,
    setSelectedVariant,
    cooldown,
    generate,
    isLoading,
    history,
    restoreFromHistory,
    clearHistory,
  } = useGenerate();

  // Simpan brief terakhir supaya tombol "Regenerate" bisa panggil ulang tanpa isi form lagi.
  // CATATAN: API saat ini selalu generate copy + tema bersamaan (Bagian 4.2), belum ada
  // endpoint terpisah untuk regenerate parsial — jadi kedua tombol regenerate sementara
  // memicu generate ulang penuh. Bisa dipecah jadi endpoint terpisah kalau scope diperluas.
  const [lastBrief, setLastBrief] = useState(null);

  function handleGenerate(brief) {
    setLastBrief(brief);
    generate(brief);
  }

  function handleRegenerate() {
    if (lastBrief) generate(lastBrief);
  }

  function handleRestore(entry) {
    restoreFromHistory(entry);
    setLastBrief(entry.brief);
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* 1.1 Header */}
      <header className="flex items-center justify-between flex-wrap gap-2 px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Studio AI</h1>
            <p className="text-sm text-text-main/60">Generator copy & tema landing page instan</p>
          </div>
        </div>
        <HistoryMenu history={history} onRestore={handleRestore} onClear={clearHistory} />
      </header>

      {/* Layout utama: 1 kolom (mobile) -> 2 kolom (md) -> 3 kolom (lg), Bagian 6.3 */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {/* 1.2 Panel Kiri — Form Input Brief */}
        <section aria-label="Form input brief" className="lg:col-span-1">
          <BriefForm onGenerate={handleGenerate} isLoading={isLoading} cooldown={cooldown} />
        </section>

        {/* 1.3 Panel Kanan — Hasil AI */}
        <section aria-label="Hasil AI" className="lg:col-span-1 flex flex-col gap-4">
          <CopyVariants
            variants={result?.copy_variants}
            selectedIndex={selectedVariant}
            onSelect={setSelectedVariant}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
            error={status === 'error' ? error : null}
            providerUsed={result?.provider_used}
          />
          <ThemeSwatches
            theme={result?.theme}
            onRegenerate={handleRegenerate}
            isLoading={isLoading}
            error={status === 'error' ? error : null}
          />
        </section>

        {/* 1.4 Live Preview Panel */}
        <section aria-label="Live preview" className="lg:col-span-1">
          <PreviewPanel
            variant={result?.copy_variants?.[selectedVariant]}
            theme={result?.theme}
            isLoading={isLoading}
            error={status === 'error' ? error : null}
            selectedIndex={selectedVariant}
            namaProduk={lastBrief?.nama_produk}
          />
        </section>
      </div>

      {/* 1.5 Footer */}
      <footer className="px-6 py-4 border-t border-white/10 text-xs text-text-main/50 flex justify-between">
        <a href="https://github.com/" className="hover:text-secondary transition-all duration-200">
          Source Code
        </a>
        <span>Powered by Claude API</span>
      </footer>
    </main>
  );
}
