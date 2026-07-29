'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';

export default function ThemeSwatches({ theme, onRegenerate, isLoading, error }) {
  const [showReasoning, setShowReasoning] = useState(false);

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-3 w-1/2" />
      </Card>
    );
  }

  if (error || !theme) return null; // error sudah ditampilkan di CopyVariants

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="font-heading text-lg">Tema Visual</h2>
          {theme.reasoning && (
            <button
              type="button"
              onClick={() => setShowReasoning((v) => !v)}
              aria-expanded={showReasoning}
              aria-label="Lihat alasan AI memilih tema ini"
              title="Kenapa AI pilih warna & font ini?"
              className={`p-1 rounded-md transition-all duration-200 ${
                showReasoning ? 'text-secondary bg-secondary/10' : 'text-text-main/40 hover:text-secondary'
              }`}
            >
              <Sparkles size={14} />
            </button>
          )}
        </div>
        <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => onRegenerate('theme')}>
          Regenerate tema
        </Button>
      </div>

      {showReasoning && theme.reasoning && (
        <p className="text-xs text-text-main/60 bg-white/[0.03] border border-secondary/20 rounded-lg p-2.5 -mt-1">
          <span className="text-secondary font-medium">AI: </span>
          {theme.reasoning}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {theme.colors.map((hex) => (
          <div key={hex} className="flex flex-col items-center gap-1">
            <div
              className="h-10 w-10 rounded-full border border-white/20"
              style={{ backgroundColor: hex }}
              title={hex}
            />
            <span className="font-mono text-[10px] text-text-main/60">{hex}</span>
          </div>
        ))}
      </div>

      <div className="text-sm text-text-main/70 flex flex-col gap-1">
        <span>
          Heading: <span className="font-mono text-secondary">{theme.font_heading}</span>
        </span>
        <span>
          Body: <span className="font-mono text-secondary">{theme.font_body}</span>
        </span>
      </div>
    </Card>
  );
}
