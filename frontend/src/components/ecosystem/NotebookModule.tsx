'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { FileText, Cloud, Check, Loader2, ArrowLeft, Zap, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotebookModule() {
  const { roomId, resetRoom } = useRoomStore();
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SAVED' | 'ERROR'>('IDLE');
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    // Fetch initial content
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/room/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, ecosystem: 'nb' })
        });
        const data = await res.json();
        if (data.success) {
          setContent(data.room.notebook || '');
        }
      } catch (err) {
        console.error('Fetch failed');
      }
    };
    if (roomId) fetchContent();
  }, [roomId]);

  const handleUpdate = (val: string) => {
    setContent(val);
    setStatus('SAVING');
    
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/room/notebook', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, notebookText: val, ecosystem: 'nb' })
        });
        if (res.ok) setStatus('SAVED');
        else setStatus('ERROR');
      } catch (err) {
        setStatus('ERROR');
      } finally {
        setTimeout(() => setStatus('IDLE'), 2000);
      }
    }, 1000);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6 max-w-5xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8 px-8 py-5 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl">
        <div className="flex items-center gap-4">
          <button onClick={resetRoom} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
             <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
               Notebook <span className="text-gray-500 font-normal">/ {roomId}</span>
             </h1>
             <div className="flex items-center gap-2 mt-1">
               {status === 'SAVING' ? (
                 <span className="text-[10px] text-blue-500 flex items-center gap-1 uppercase font-bold tracking-widest"><Loader2 className="w-3 h-3 animate-spin" /> Syncing...</span>
               ) : status === 'SAVED' ? (
                 <span className="text-[10px] text-green-500 flex items-center gap-1 uppercase font-bold tracking-widest"><Check className="w-3 h-3" /> Cloud Synced</span>
               ) : (
                 <span className="text-[10px] text-gray-500 flex items-center gap-1 uppercase font-bold tracking-widest"><Cloud className="w-3 h-3" /> Ready</span>
               )}
             </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
           <Zap className="w-4 h-4 text-amber-500" />
           <span className="text-xs font-bold text-gray-400">Autosave Active</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white/[0.02] border border-white/10 rounded-[3rem] p-1 shadow-2xl overflow-hidden group focus-within:border-blue-500/30 transition-all duration-700"
        >
          <textarea 
            className="w-full h-full bg-transparent p-10 outline-none resize-none font-medium leading-relaxed text-lg placeholder:text-white/10"
            placeholder="Start typing your thoughts here... everything is automatically saved to the dynamic cloud link."
            value={content}
            onChange={(e) => handleUpdate(e.target.value)}
          />
        </motion.div>
        
        <footer className="flex justify-between items-center text-[10px] text-gray-600 font-mono uppercase tracking-[0.2em] px-4">
           <div>{content.length} characters</div>
           <div>Frank Drop Ecosystem • Notebook v2.0</div>
        </footer>
      </main>
    </div>
  );
}
