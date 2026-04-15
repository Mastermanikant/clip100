'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface CyberButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const variantStyles = {
  primary:
    'bg-white text-black hover:bg-gray-200 active:bg-gray-300',
  secondary:
    'glass text-white hover:bg-white/[0.08]',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
  ghost:
    'bg-transparent text-gray-400 hover:text-white hover:bg-white/[0.05]',
};

const sizeStyles = {
  sm: 'px-4 py-2 text-xs gap-1.5',
  md: 'px-6 py-3 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-3',
};

export default function CyberButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: CyberButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        inline-flex items-center justify-center font-bold rounded-button
        uppercase tracking-widest transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon
      )}
      {children}
    </motion.button>
  );
}
