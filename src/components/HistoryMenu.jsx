'use client';

import { useEffect, useRef, useState } from 'react';
import { History, Trash2 } from 'lucide-react';

function timeAgo(timestamp) {
  const diffMin = Math.round((Date.now() - timestamp) / 60000);
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.round(diffMin / 60);
  return `${diffHour} jam lalu`;
}

export default function HistoryMenu({ history, onRestore, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Riwayat generate"
        title="Riwayat generate (sesi ini)"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15
          text-sm text-text-main/70 hover:border-secondary/60 transition-all duration-200"
      >
        <History size={14} />
        Riwayat
        {history.length > 0 && (
          <span className="text-[10px] font-mono bg-white/10 rounded-full px-1.5">{history.length}</span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-white/10
            bg-background shadow-xl z-20 p-2"
        >
          {history.length === 0 ? (
            <p className="text-xs text-text-main/50 p-3 text-center">
              Belum ada riwayat generate di sesi ini.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] uppercase tracking-wide text-text-main/40 font-mono">
                  Sesi ini
                </span>
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[10px] text-error/80 hover:text-error inline-flex items-center gap-1"
                >
                  <Trash2 size={11} /> Hapus semua
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onRestore(entry);
                      setOpen(false);
                    }}
                    className="text-left rounded-lg p-2 hover:bg-white/5 transition-all duration-200"
                  >
                    <p className="text-sm font-medium truncate">{entry.brief.nama_produk}</p>
                    <p className="text-[11px] text-text-main/50">
                      {entry.brief.industri} · {entry.brief.tone} · {timeAgo(entry.id)}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
