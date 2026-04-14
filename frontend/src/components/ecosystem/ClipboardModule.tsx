'use client';

import React, { useState, useEffect } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { Clipboard as ClipboardIcon, ArrowLeft, Copy, Check, Zap, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClipboardModule() {
  const { roomId, resetRoom } = useRoomStore();
  const [content, setContent] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const fetchClipboard = async () => {
      try {
        const res = await fetch(`/api/room/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, ecosystem: 'cb' })
        });
        const data = await res.json();
        if (data.success) {
          setContent(data.room.notebook || '');
        }
      } catch (err) {}
    };
    if (roomId) fetchClipboard();
  }, [roomId]);

  const handlePush = async () => {
    if (!content.trim()) return;
    try {
      await fetch('/api/room/notebook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, notebookText: content, ecosystem: 'cb' })
      });
      setHistory(prev => [content, ...prev.slice(0, 4)]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6 max-w-4xl mx-auto w-full">
      <header className="flex items-center justify-between mb-12 px-6 py-4 bg-white/5 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={resetRoom} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft /></button>
          <h1 className="text-xl font-bold flex items-center gap-2"><ClipboardIcon className="w-5 h-5 text-blue-500" /> Clipboard / {roomId}</h1>
        </div>
        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Global Sync Active</div>
      </header>

      <main className="space-y-8">
        <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
           <textarea 
             className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 h-40 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
             placeholder="Paste anything here to sync across devices..."
             value={content}
             onChange={(e) => setContent(e.target.value)}
           />
           <div className="flex gap-4">
              <button 
                onClick={handlePush}
                className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Zap className="w-4 h-4" /> Push to Cloud
              </button>
              <button 
                onClick={handleCopy}
                className="px-8 bg-white/10 hover:bg-white/20 font-bold rounded-2xl flex items-center justify-center transition-all"
              >
                {copied ? <Check className="text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
           </div>
        </div>

        {history.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 ml-4"><History className="w-3 h-3" /> Recent History</h3>
            {history.map((h, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                <p className="text-xs text-gray-400 truncate max-w-[80%]">{h}</p>
                <button onClick={() => setContent(h)} className="text-[10px] font-bold text-blue-500 hover:underline">RESTORE</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
