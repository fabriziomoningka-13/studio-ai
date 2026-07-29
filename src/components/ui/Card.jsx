export default function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`border border-white/10 rounded-xl p-4 bg-white/[0.03] backdrop-blur-sm
        shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
