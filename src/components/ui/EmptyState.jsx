export default function EmptyState({ title, description }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-6">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        role="img"
        aria-label="Ilustrasi kertas draf kosong dengan bintang, menandakan belum ada hasil AI"
      >
        <rect x="14" y="10" width="36" height="48" rx="4" fill="#F8FAFC" fillOpacity="0.06" stroke="#F8FAFC" strokeOpacity="0.2" />
        <line x1="20" y1="22" x2="44" y2="22" stroke="#F8FAFC" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="30" x2="44" y2="30" stroke="#F8FAFC" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="38" x2="34" y2="38" stroke="#F8FAFC" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M54 14 L56.5 19.5 L62 22 L56.5 24.5 L54 30 L51.5 24.5 L46 22 L51.5 19.5 Z"
          fill="#F2B84B"
        />
        <circle cx="16" cy="52" r="3" fill="#7FE7C4" />
      </svg>
      <div>
        <p className="text-sm font-medium text-text-main/80">{title}</p>
        {description && <p className="text-xs text-text-main/50 mt-1">{description}</p>}
      </div>
    </div>
  );
}
