'use client';
import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CyberCardProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  glow?: 'blue' | 'purple' | 'green' | 'red' | 'amber' | 'none';
  hover?: boolean;
  children: ReactNode;
  className?: string;
}

export function CyberCard({ 
  glow = 'none', 
  hover = false, 
  children, 
  className = '',
  ...props
}: CyberCardProps) {
  const glowClasses = {
    blue: 'hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]',
    purple: 'hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]',
    green: 'hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]',
    red: 'hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]',
    amber: 'hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]',
    none: ''
  };

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : {}}
      className={`glass border border-white/5 rounded-[2.5rem] p-6 transition-all duration-300 ${glowClasses[glow]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
