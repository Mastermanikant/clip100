'use client';

import { motion } from 'framer-motion';

interface CyberCardProps {
  glow?: 'blue' | 'purple' | 'green' | 'none';
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const glowStyles = {
  blue: 'hover:shadow-[0_0_50px_rgba(59,130,246,0.1)] hover:border-blue-500/20',
  purple: 'hover:shadow-[0_0_50px_rgba(139,92,246,0.1)] hover:border-purple-500/20',
  green: 'hover:shadow-[0_0_50px_rgba(34,197,94,0.1)] hover:border-green-500/20',
  none: '',
};

export default function CyberCard({
  glow = 'none',
  hover = true,
  children,
  className = '',
  onClick,
}: CyberCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01 } : undefined}
      onClick={onClick}
      className={`
        bg-white/[0.02] border border-white/[0.05] rounded-card
        backdrop-blur-2xl transition-all duration-300
        ${hover ? 'cursor-pointer' : ''}
        ${glowStyles[glow]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
