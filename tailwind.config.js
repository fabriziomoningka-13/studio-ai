/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tema "Studio" — Bagian 6.1, direvisi: primary jadi Teal (green-teal) atas
        // permintaan, background diperdalam untuk kesan lebih premium/profesional.
        background: '#12172A',        // Indigo-slate gelap — latar utama dashboard
        primary: '#1FAE93',           // Teal — tombol utama, highlight, CTA (revisi dari Amber)
        'primary-dark': '#15876C',    // Teal gelap — hover/pressed state
        secondary: '#7FE7C4',         // Mint — badge info, elemen sekunder (senada dgn teal)
        'text-main': '#F5F7FA',       // Teks utama di atas background gelap
        error: '#F87171',             // Error / warning
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      transitionDuration: {
        200: '200ms',
      },
    },
    // Breakpoint default Tailwind (sm:640px, md:768px, lg:1024px) sudah cocok
    // dengan Bagian 6.3, jadi tidak perlu override screens.
  },
  plugins: [],
};
