'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, ChevronRight } from 'lucide-react';
import CyberButton from '@/components/ui/CyberButton';
import CyberInput from '@/components/ui/CyberInput';
import CyberCard from '@/components/ui/CyberCard';
import GlowBackground from '@/components/ui/GlowBackground';
import { isValidRoomId } from '@/lib/utils';
import Link from 'next/link';

export default function NotesCreatePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinOrCreate = async () => {
    if (!roomId.trim() || !isValidRoomId(roomId)) {
      setError('Invalid notebook name');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/room/check?roomId=${encodeURIComponent(roomId)}&ecosystem=notes`);
      const data = await res.json();
      
      if (data.available) {
        await fetch('/api/room/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vanityName: roomId, ecosystem: 'notes', isPublic: true }),
        });
      }
      
      router.push(`/notes/${roomId}`);
    } catch {
      setError('Connection failed. Try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cyber-bg text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <GlowBackground color="bg-purple-600" />
      
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <button className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-gray-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
      </div>

      <div className="max-w-md w-full z-10 space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.1)]">
            <MessageSquare className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-3xl font-black italic tracking-widest uppercase mb-2">
            Frank<span className="text-purple-500">Notes</span>
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
            Create or access a smart notebook
          </p>
        </div>

        <CyberCard className="p-8 space-y-6" glow="purple">
          <div className="space-y-4">
            <CyberInput
              placeholder="Notebook Name"
              value={roomId}
              onChange={(val) => setRoomId(val.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              maxLength={20}
              monospace
              autoFocus
            />
            {error && <p className="text-red-400 text-xs font-bold text-center">{error}</p>}
            <CyberButton
              variant="primary"
              size="lg"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white"
              onClick={handleJoinOrCreate}
              isLoading={isLoading}
              disabled={!roomId.trim() || roomId.length < 3}
            >
              Open Notebook
            </CyberButton>
          </div>
        </CyberCard>
      </div>
    </main>
  );
}
