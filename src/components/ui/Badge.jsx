const TONES = {
  info: 'bg-secondary/15 text-secondary border-secondary/30',
  error: 'bg-error/15 text-error border-error/30',
  neutral: 'bg-white/5 text-text-main/70 border-white/10',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
