'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Lock } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  sender: 'me' | 'them';
  timestamp: Date;
  isEncrypted?: boolean;
  onCopy?: () => void;
}

export default function MessageBubble({
  content,
  sender,
  timestamp,
  isEncrypted = false,
  onCopy,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${sender === 'me' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl p-4 flex flex-col gap-2 relative group ${
          sender === 'me'
            ? 'bg-blue-600/90 text-white rounded-tr-sm'
            : 'bg-white/10 text-white rounded-tl-sm'
        }`}
      >
        {isEncrypted && (
          <div className="flex items-center gap-1.5 text-[10px] opacity-60">
            <Lock className="w-3 h-3" />
            <span>Encrypted</span>
          </div>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        <div
          className={`flex items-center justify-end gap-3 mt-1 ${
            sender === 'me' ? 'text-blue-200' : 'text-gray-500'
          }`}
        >
          <span className="text-[9px] font-mono">
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/20 hover:bg-black/40 rounded-md"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
