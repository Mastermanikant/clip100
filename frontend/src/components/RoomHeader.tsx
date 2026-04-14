import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';

interface RoomHeaderProps {
  title: string;
  roomId: string;
  isConnected: boolean;
  peerCount: number;
  accentColor?: string; // e.g. text-blue-500
  onLeave?: () => void;
  isLocked?: boolean;
}

export function RoomHeader({ 
  title, 
  roomId, 
  isConnected, 
  peerCount, 
  accentColor = 'text-blue-500',
  isLocked = false 
}: RoomHeaderProps) {
  return (
    <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
      <div className="flex items-center gap-3">
        <motion.div
          animate={isConnected ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Shield className={`w-6 h-6 ${isConnected ? 'text-green-500' : accentColor}`} />
        </motion.div>
        <h1 className="text-xl font-black italic tracking-widest uppercase">
          {title.split(/(?=[A-Z])/).map((word, i) => (
            i === 0 ? <span key={i}>{word}</span> : <span key={i} className={isConnected ? "text-green-500" : accentColor}>{word}</span>
          ))}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {roomId && (
          <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
            {isLocked && <Lock className="w-3 h-3 text-gray-400" />}
            <span className="text-xs font-mono tracking-widest uppercase">{roomId}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
             {peerCount} {peerCount === 1 ? 'Peer' : 'Peers'}
           </span>
           <StatusBadge status={isConnected ? 'online' : 'connecting'} />
        </div>
      </div>
    </header>
  );
}
