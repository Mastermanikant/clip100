'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/ui/StatusBadge';

interface RoomHeaderProps {
  title: string;
  roomId: string;
  isConnected: boolean;
  peerCount: number;
  accentColor: string;
  onLeave?: () => void;
}

export default function RoomHeader({
  title,
  roomId,
  isConnected,
  peerCount,
  accentColor,
  onLeave,
}: RoomHeaderProps) {
  const router = useRouter();

  const handleLeave = () => {
    if (onLeave) onLeave();
    router.push('/');
  };

  return (
    <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
      <div className="flex items-center gap-4">
        <button
          onClick={handleLeave}
          className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-black italic tracking-widest uppercase">
            {title.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] font-mono text-gray-500 tracking-widest">
              {roomId}
            </span>
            {peerCount > 0 && (
              <span className="text-[10px] text-gray-600">
                · {peerCount} peer{peerCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      <StatusBadge
        status={isConnected ? 'online' : 'offline'}
        label={isConnected ? 'P2P Active' : 'Disconnected'}
      />
    </header>
  );
}
