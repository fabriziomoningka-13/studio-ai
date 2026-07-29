'use client';

const VARIANTS = {
  primary:
    'bg-primary text-background hover:bg-primary-dark hover:shadow-[0_0_20px_-4px_rgba(31,174,147,0.6)] ' +
    'disabled:opacity-40 disabled:hover:bg-primary disabled:hover:shadow-none',
  ghost: 'bg-transparent border border-white/15 text-text-main hover:border-secondary/60 disabled:opacity-40',
};

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
