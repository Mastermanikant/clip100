'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertCircle, Loader2 } from 'lucide-react';
import RoomHeader from '@/components/RoomHeader';

export default function NotesRoomPage({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Load initial content
  useEffect(() => {
    const fetchNotebook = async () => {
      try {
        const res = await fetch(`/api/notebook?roomId=${roomId}`);
        const data = await res.json();
        if (data.success) {
          setContent(data.notebook || '');
        }
      } catch {
        setError('Failed to load notebook');
      } finally {
        setLoading(false);
      }
    };
    fetchNotebook();
  }, [roomId]);

  // Auto-save logic
  useEffect(() => {
    if (loading) return;
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch('/api/notebook', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, notebookText: content }),
        });
        setLastSaved(new Date());
      } catch {
        setError('Failed to save');
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [content, roomId, loading]);

  return (
    <main className="min-h-screen bg-[#050505] text-white flex justify-center items-center p-0 md:p-8 font-sans">
      <motion.div 
        layout
        className="w-full h-[100dvh] md:max-w-4xl md:h-[85vh] bg-white/[0.02] md:border border-white/5 md:rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
      >
        <RoomHeader 
            title="FrankNotes" 
            roomId={roomId} 
            isConnected={true} 
            peerCount={0} 
            accentColor="purple"
        />

        <div className="flex-1 flex flex-col relative">
          <div className="px-6 py-2 border-b border-white/5 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              {isSaving ? (
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-widest">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </div>
              ) : error ? (
                <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold uppercase tracking-widest">
                  <AlertCircle className="w-3 h-3" /> Error
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-widest">
                  <Save className="w-3 h-3" /> Saved {lastSaved.toLocaleTimeString()}
                </div>
              ) : null}
            </div>
            <div className="text-xs text-gray-600 font-mono">
              {content.length} / 100,000 chars
            </div>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            placeholder={loading ? "Loading..." : "Start typing..."}
            className="flex-1 w-full bg-transparent resize-none outline-none p-6 text-sm leading-relaxed text-gray-300 placeholder:text-gray-700 font-mono"
            spellCheck="false"
          />
        </div>
      </motion.div>
    </main>
  );
}
