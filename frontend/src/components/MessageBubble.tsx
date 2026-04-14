import React from 'react';
import { motion } from 'framer-motion';
import { Copy, Lock } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  sender: 'me' | 'them';
  timestamp: Date | number;
  isEncrypted?: boolean;
  onCopy?: (text: string) => void;
}

export function MessageBubble({ content, sender, timestamp, isEncrypted = false, onCopy }: MessageBubbleProps) {
  const isMe = sender === 'me';
  const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[75%] rounded-2xl p-4 flex flex-col gap-2 relative group ${
        isMe 
          ? 'bg-blue-600/90 text-white rounded-tr-sm shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
          : 'bg-white/10 border border-white/5 text-white rounded-tl-sm backdrop-blur-md'
      }`}>
        <div className="flex gap-2">
           {isEncrypted && <Lock className={`w-4 h-4 shrink-0 mt-0.5 ${isMe ? 'text-blue-200' : 'text-gray-400'}`} />}
           <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">{content}</p>
        </div>
        
        <div className={`flex items-center justify-end gap-3 mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
          <span className="text-[9px] font-mono uppercase tracking-widest">{timeStr}</span>
          {onCopy && (
            <button 
              onClick={() => onCopy(content)} 
              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg ${
                 isMe ? 'bg-black/20 hover:bg-black/40' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
