'use client';

interface GlowBackgroundProps {
  color?: string;
  size?: string;
  className?: string;
}

export default function GlowBackground({
  color = 'bg-blue-600',
  size = 'w-[60vw] h-[60vw]',
  className = '',
}: GlowBackgroundProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className={`
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          rounded-full blur-[150px] opacity-[0.03] transition-colors duration-1000
          ${color} ${size} ${className}
        `}
      />
    </div>
  );
}
