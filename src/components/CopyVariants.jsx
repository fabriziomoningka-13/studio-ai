'use client';

import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Skeleton from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import CopyButton from './ui/CopyButton';

export default function CopyVariants({
  variants,
  selectedIndex,
  onSelect,
  onRegenerate,
  isLoading,
  error,
  providerUsed,
}) {
  if (isLoading) {
    return (
      <Card className="flex flex-col gap-3">
        <Skeleton className="h-4 w-1/3" />
        {[0, 1].map((i) => (
          <Card key={i} className="flex flex-col gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </Card>
        ))}
      </Card>
    );
  }

  if (error) {
    return (
      <Card role="alert">
        <p className="text-sm text-error">{error}</p>
      </Card>
    );
  }

  if (!variants || variants.length === 0) {
    // Empty state ramah sebelum generate pertama — Bagian 6.4
    return (
      <Card className="h-full">
        <EmptyState
          title="Belum ada draf copy"
          description="Isi brief di panel kiri, lalu klik Generate untuk lihat hasilnya di sini."
        />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-heading text-lg">Varian Copy</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {providerUsed && (
            <Badge tone="info" title="Provider AI yang dipakai — Bagian 4.2">
              {providerUsed}
            </Badge>
          )}
          <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => onRegenerate('copy')}>
            Regenerate copy
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {variants.map((variant, i) => {
          const fullText = `${variant.headline}\n${variant.subheadline}\n${variant.cta}`;
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-pressed={i === selectedIndex}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(i);
                }
              }}
              className={`text-left rounded-lg border p-3 transition-all duration-200 cursor-pointer
                ${i === selectedIndex
                  ? 'border-primary/60 bg-primary/10'
                  : 'border-white/10 hover:border-white/25'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-base">{variant.headline}</p>
                <CopyButton text={fullText} label="Salin varian ini" className="shrink-0 -mt-1 -mr-1" />
              </div>
              <p className="text-sm text-text-main/70 mt-1">{variant.subheadline}</p>
              <Badge tone="neutral" className="mt-2">{variant.cta}</Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
