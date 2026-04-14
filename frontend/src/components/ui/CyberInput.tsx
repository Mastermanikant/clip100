import React, { ReactNode } from 'react';

interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  monospace?: boolean;
}

export function CyberInput({ 
  icon, 
  monospace = false, 
  className = '', 
  ...props 
}: CyberInputProps) {
  return (
    <div className="relative group w-full">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500" />
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-4 text-gray-500 group-focus-within:text-blue-400 transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-black/80 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-gray-600
            ${icon ? 'pl-11' : ''} 
            ${monospace ? 'font-mono tracking-widest uppercase text-center' : ''} 
            ${className}`}
          {...props}
        />
      </div>
    </div>
  );
}
