import React from 'react';

interface GlowBackgroundProps {
  color?: string; // Tailwind bg color class e.g. 'bg-blue-600'
  pulse?: boolean;
}

export function GlowBackground({ color = 'bg-blue-600', pulse = false }: GlowBackgroundProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.03] transition-colors duration-1000 ${color} ${pulse ? 'animate-neon-pulse' : ''}`} 
      />
    </div>
  );
}
