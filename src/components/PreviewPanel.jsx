'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import { downloadLandingHtml } from '@/lib/exportHtml';

// Durasi & stagger sesuai spesifikasi Bagian 16: 300-400ms per elemen,
// delay berjenjang 100-150ms antar elemen, supaya terasa "membangun diri".
const textVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.12, ease: 'easeOut' },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const ctaVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, delay: 0.24, ease: 'easeOut' },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

// Swatch & font muncul bersamaan, terpisah dari animasi teks — hanya jalan
// sekali saat generate pertama kali, TIDAK ikut re-animasi saat ganti varian copy.
const themeVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.3, ease: 'easeOut' } },
};

// Hitung warna teks kontras terhadap background hasil generate AI —
// background preview ini dinamis (beda-beda tiap generate), bukan warna
// branding tetap Studio AI, jadi teks tidak boleh di-hardcode terang saja.
function getContrastText(hex) {
  if (!hex) return '#F8FAFC';
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#F8FAFC';

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  // Relative luminance (WCAG-approx)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? '#1B1F3B' : '#F8FAFC'; // gelap di atas terang, terang di atas gelap
}

export default function PreviewPanel({ variant, theme, isLoading, error, selectedIndex, namaProduk }) {
  if (isLoading) {
    return (
      <Card className="h-full flex flex-col gap-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </Card>
    );
  }

  if (error) return null; // error sudah tampil di panel Hasil AI

  if (!variant || !theme) {
    return (
      <Card className="h-full">
        <EmptyState
          title="Belum ada preview"
          description="Preview landing page akan muncul di sini setelah generate."
        />
      </Card>
    );
  }

  const [bg, accent, ...restColors] = theme.colors;
  const textColor = getContrastText(bg);
  const mutedTextColor = textColor === '#1B1F3B' ? 'rgba(27,31,59,0.6)' : 'rgba(248,250,252,0.6)';
  const borderColor = textColor === '#1B1F3B' ? 'rgba(27,31,59,0.15)' : 'rgba(248,250,252,0.15)';

  return (
    <Card className="h-full flex flex-col gap-4 overflow-hidden" style={{ backgroundColor: bg || undefined }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide font-mono" style={{ color: mutedTextColor }}>
          Live Preview
        </span>
        <button
          type="button"
          onClick={() => downloadLandingHtml({ variant, theme, namaProduk })}
          title="Unduh sebagai file HTML"
          aria-label="Unduh landing page sebagai file HTML"
          className="inline-flex items-center gap-1 rounded-md p-1.5 transition-all duration-200 hover:opacity-70"
          style={{ color: mutedTextColor }}
        >
          <Download size={14} />
        </button>
      </div>

      {/* Hanya bagian teks yang di-animasi ulang saat ganti varian (Bagian 16) */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedIndex} className="flex flex-col gap-3">
          <motion.h3
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-2xl font-semibold leading-snug"
            style={{ fontFamily: theme.font_heading, color: textColor }}
          >
            {variant.headline}
          </motion.h3>

          <motion.p
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-sm"
            style={{ fontFamily: theme.font_body, color: mutedTextColor }}
          >
            {variant.subheadline}
          </motion.p>

          <motion.button
            variants={ctaVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="self-start px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: accent, color: getContrastText(accent) }}
          >
            {variant.cta}
          </motion.button>
        </motion.div>
      </AnimatePresence>

      {/* Swatch warna & font — muncul sekali, tidak ikut re-animasi saat ganti varian */}
      <motion.div
        variants={themeVariants}
        initial="hidden"
        animate="visible"
        className="mt-auto flex items-center gap-1.5 pt-3 border-t"
        style={{ borderColor }}
      >
        {theme.colors.map((hex) => (
          <span
            key={hex}
            className="h-4 w-4 rounded-full border border-white/20"
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
        <span className="text-[10px] font-mono ml-auto" style={{ color: mutedTextColor }}>
          {theme.font_heading} / {theme.font_body}
        </span>
      </motion.div>
    </Card>
  );
}
