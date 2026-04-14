'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Book, Lock } from 'lucide-react';
import { useFrankRTC } from '@/hooks/useFrankRTC';
import { RoomHeader } from '@/components/RoomHeader';
import { MessageBubble } from '@/components/MessageBubble';

export default function FrankNotesRoom({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId.toUpperCase();
  const [inputMsg, setInputMsg] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const { isConnected, peerCount, messages, sendText } = useFrankRTC({ roomId, ecosystem: 'notes' });

  // Load existing notes from backend on mount
  useEffect(() => {
    fetch(`/api/room/notebook?roomId=${roomId}&ecosystem=notes`)
      .then(res => res.json())
      .then(data => {
        if (data.notebook) {
           try {
              setNotes(JSON.parse(data.notebook));
           } catch(e) {}
        }
      });
  }, [roomId]);

  // Aggregate RT messages and initial notes
  const allNotes = [...notes, ...messages];

  // Auto save to DB when new messages are added locally
  useEffect(() => {
     if (allNotes.length > 0) {
        fetch('/api/room/notebook', {
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ roomId, ecosystem: 'notes', notebookText: JSON.stringify(allNotes) })
        });
     }
  }, [messages.length, roomId]); // only sync when new message comes in

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendText(inputMsg);
    setInputMsg('');
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-black">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.03] transition-colors duration-1000 bg-purple-600`} />
      </div>

      <motion.div 
        layout
        className="max-w-4xl w-full h-[90vh] bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
      >
        <RoomHeader 
           title="FrankNotes" 
           roomId={roomId} 
           isConnected={isConnected} 
           peerCount={peerCount}
           accentColor="text-purple-500" 
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide flex flex-col">
          {allNotes.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
              <Book className="w-16 h-16 text-purple-500/30" />
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">Empty Notebook</p>
            </div>
          )}
          {allNotes.map((msg, i) => (
            <MessageBubble 
              key={msg.id || i}
              content={msg.content}
              sender={msg.sender}
              timestamp={msg.timestamp}
            />
          ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Jot down a permanent note..."
              className="flex-1 bg-white/5 border border-purple-500/20 rounded-xl px-4 py-4 focus:outline-none focus:border-purple-500 text-sm"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!inputMsg.trim()}
              className="px-6 bg-purple-600 hover:bg-purple-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
