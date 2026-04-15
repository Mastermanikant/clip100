'use client';

import { forwardRef } from 'react';

interface CyberInputProps {
  type?: 'text' | 'password';
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  monospace?: boolean;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
  id?: string;
}

const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  (
    {
      type = 'text',
      placeholder,
      value,
      onChange,
      icon,
      monospace = false,
      maxLength,
      className = '',
      autoFocus = false,
      id,
    },
    ref
  ) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          autoFocus={autoFocus}
          className={`
            w-full bg-black/60 border border-white/5 rounded-button
            px-6 py-4 outline-none transition-all duration-200
            focus:ring-2 focus:ring-neon-blue/40 focus:border-neon-blue/30
            placeholder:text-gray-700
            ${icon ? 'pl-12' : ''}
            ${monospace ? 'font-mono tracking-[0.3em] text-center text-lg' : 'text-sm'}
            ${className}
          `}
        />
      </div>
    );
  }
);

CyberInput.displayName = 'CyberInput';
export default CyberInput;
