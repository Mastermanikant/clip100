'use client';
import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CyberButtonProps extends Omit<HTMLMotionProps<'button'>, 'className'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CyberButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: CyberButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all focus:outline-none';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-lg gap-1.5',
    md: 'px-6 py-3 text-sm rounded-xl gap-2',
    lg: 'px-8 py-4 text-base rounded-2xl gap-3 w-full'
  };

  const variantClasses = {
    primary: 'bg-white text-black hover:bg-gray-100 disabled:bg-white/20 disabled:text-gray-500',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 backdrop-blur-md',
    danger: 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}
