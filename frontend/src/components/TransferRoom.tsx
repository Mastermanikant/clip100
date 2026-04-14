'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { WebRTCManager } from '@/lib/webrtc';
import { getAblyClient, getRoomChannel } from '@/lib/ably';
import { QRCodeSVG } from 'qrcode.react';
import { Send, File, X, Check, Copy, Share2, ArrowLeft, Shield, Zap, Crown, MessageSquare, FileText as MemoIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransferItem from './TransferItem';

interface TransferMessage {
  type: 'text' | 'file';
  content?: string;
  fileName?: string;
  fileSize?: string;
  progress?: number;
  status?: 'Sending' | 'Receiving' | 'Completed';
  timestamp?: number;
  received?: boolean;
}

interface TransferRoomProps {
  initialTab?: 'chat' | 'notebook' | 'clipboard';
}

export default function TransferRoom({ initialTab = 'chat' }: TransferRoomProps) {
  const { roomId, resetRoom } = useRoomStore();
  const [rtcManager, setRtcManager] = useState<WebRTCManager | null>(null);
  const [messages, setMessages] = useState<TransferMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [notebookText, setNotebookText] = useState('');
  const [activeTab, setActiveTab ] = useState<'chat' | 'notebook' | 'clipboard'>(initialTab);
  const [nickname, setNickname ] = useState<string>('');
  const [isChoosingName, setIsChoosingName] = useState(true);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [myId, setMyId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(true);
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      if (!roomId) return;
      
      try {
        // Secure Join Validation
        const joinRes = await fetch('/api/room/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, passwordHash: '' }) // Pass real code if needed
        });
        
        if (!joinRes.ok) throw new Error('Could not join room');
        
        // Init Ably
        const client = await getAblyClient();
        const channel = getRoomChannel(client, roomId);
        
        // Init WebRTC
        const manager = new WebRTCManager(roomId, client, channel, async (data: any) => {
          if (data.type === 'progress') {
            setMessages((prev) => prev.map(m => 
              (m.type === 'file' && m.fileName && data.fileId.includes(m.fileName)) 
                ? { ...m, progress: data.progress, status: 'Receiving' } 
                : m
            ));
          } else if (data.type === 'file_complete') {
            const { db } = await import('@/lib/storage');
            const res = await db.assembleFile(data.fileId);
            if (res) {
              const a = document.createElement('a');
              a.href = res.url;
              a.download = res.fileName;
              a.click();
              await db.cleanup(data.fileId);
              setMessages((prev) => prev.map(m => 
                (m.type === 'file' && m.fileName && data.fileId.includes(m.fileName)) 
                  ? { ...m, progress: 100, status: 'Completed' } 
                  : m
              ));
            }
          } else {
            setMessages((prev) => [...prev, { ...data, timestamp: Date.now(), received: true }]);
          }
        }, false);
        
        setRtcManager(manager);
        setQrUrl(`${window.location.origin}/d/${roomId}`);

        // Fetch Room Data
        const res = await fetch(`/api/room/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId, passwordHash: '' })
        });
        const data = await res.json();
        
        if (data.success) {
          setNotebookText(data.room.notebook || '');
          setAdminId(data.room.adminId || null);
          setMyId(client.auth.clientId);
          
          if (data.room.initialMode) {
            setActiveTab(data.room.initialMode);
          }
        }

        setIsJoining(false);

        return () => {
          manager.cleanup();
          channel.unsubscribe();
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setIsJoining(false);
      }
    };

    init();
  }, [roomId]);

  const handleUpdateNotebook = (text: string) => {
    setNotebookText(text);
    
    // Notebook Debounce JUGAD: Wait 1s after last keystroke before saving to KV
    if (notebookTimerRef.current) clearTimeout(notebookTimerRef.current);
    notebookTimerRef.current = setTimeout(async () => {
      await fetch('/api/room/notebook', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, notebookText: text })
      });
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !rtcManager) return;
    const msg = { type: 'text', content: inputText };
    rtcManager.sendData(msg);
    setMessages((prev) => [...prev, { ...msg, timestamp: Date.now(), received: false }]);
    setInputText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && rtcManager) {
      setMessages(prev => [...prev, { 
        type: 'file', 
        fileName: file.name, 
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB', 
        progress: 0, 
        status: 'Preparing',
        received: false,
        timestamp: Date.now()
      }]);
      
      await rtcManager.sendFile(file, (progress) => {
        setMessages(prev => prev.map(m => 
          (m.type === 'file' && m.fileName === file.name) ? { ...m, progress, status: progress === 100 ? 'Completed' : 'Sending' } : m
        ));
      });

      // Notify completion
      const fileId = `${file.name}-${file.size}-${file.lastModified}`;
      rtcManager.sendData({ type: 'file_complete', fileId });
    }
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/d/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isJoining) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-blue-500 animate-pulse" />
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Bridging secure room...</p>
        </div>
      </div>
    );
  }

  if (isChoosingName) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl text-center space-y-6"
        >
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold">Who goes there?</h2>
          <p className="text-gray-500 text-sm italic">"Indian Jugaad" identity: Any name works.</p>
          <input 
            type="text" 
            placeholder="Your Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && nickname.trim() && setIsChoosingName(false)}
            className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button 
            onClick={() => nickname.trim() && setIsChoosingName(false)}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl"
          >
            Enter Room
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6 max-w-6xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8 px-4 py-3 bg-white/5 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={resetRoom} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
              Room ID {myId === adminId && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
            </div>
            <div className="text-xl font-mono font-bold flex items-center gap-2">
              {roomId}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleCopyUrl} className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all">
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            Share Link
          </button>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500">SPEED:</span>
            <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
              FREE (Limited)
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-8 flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-col bg-[#0f0f0f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
          <div className="flex items-center gap-1 p-2 bg-black/40 border-b border-white/5">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <MessageSquare className="w-4 h-4" /> Chat & Files
            </button>
            <button 
              onClick={() => setActiveTab('notebook')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'notebook' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <MemoIcon className="w-4 h-4" /> Notebook
            </button>
            <button 
              onClick={() => setActiveTab('clipboard')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'clipboard' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Copy className="w-4 h-4" /> Clipboard
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'chat' && (
                <motion.div key="chat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center text-gray-700 space-y-4">
                      <Zap className="w-16 h-16 opacity-10 animate-pulse" />
                      <p className="text-sm font-medium">Ready for real-time transfer</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.received ? 'justify-start' : 'justify-end'}`}>
                        {msg.type === 'text' ? (
                          <div className={`group relative max-w-[80%] p-4 rounded-[1.5rem] ${msg.received ? 'bg-white/5 border border-white/5' : 'bg-blue-600 shadow-lg shadow-blue-600/20'}`}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <button 
                              onClick={() => { navigator.clipboard.writeText(msg.content || ''); alert('Copied!'); }}
                              className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                            >
                              <Copy className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-full max-w-[320px]">
                            <TransferItem name={msg.fileName} size={msg.fileSize} progress={msg.progress} status={msg.status} isIncoming={msg.received} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'notebook' && (
                <motion.div key="notebook" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Global Memo</h3>
                    <button onClick={() => handleUpdateNotebook(notebookText)} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2">
                      <Check className="w-3 h-3" /> Save to Cloud
                    </button>
                  </div>
                  <textarea 
                    placeholder="Type anything here... it stays in the room for 30 days."
                    value={notebookText}
                    onChange={(e) => setNotebookText(e.target.value)}
                    className="w-full h-full min-h-[50vh] bg-transparent text-gray-300 p-6 border border-white/5 rounded-[2rem] focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none font-light leading-relaxed scrollbar-hide bg-white/[0.02]"
                  />
                </motion.div>
              )}

              {activeTab === 'clipboard' && (
                <motion.div key="clipboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Universal Clipboard</h3>
                    <button onClick={() => { navigator.clipboard.writeText(notebookText); alert('Clipboard Sync Active!'); }} className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                      <Copy className="w-3 h-3" /> Copy All
                    </button>
                  </div>
                  <textarea 
                    placeholder="Instant Sync across devices..."
                    value={notebookText}
                    onChange={(e) => { setNotebookText(e.target.value); handleUpdateNotebook(e.target.value); }}
                    className="w-full h-full min-h-[50vh] bg-transparent text-gray-300 p-6 border border-white/5 rounded-[2rem] focus:outline-none focus:ring-1 focus:ring-green-500/50 resize-none font-mono text-sm leading-relaxed scrollbar-hide bg-white/[0.02]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-black/60 border-t border-white/5 flex gap-3 backdrop-blur-md">
            <input 
              type="text" 
              placeholder="Message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm font-light"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400"
            >
              <File className="w-5 h-5" />
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            </button>
            <button 
              onClick={handleSendMessage}
              className="p-4 bg-blue-600 rounded-2xl hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-blue-600/30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[2rem] p-8 text-center space-y-6">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">Secure Pair</div>
            <div className="bg-white p-6 rounded-[2rem] inline-block shadow-2xl">
              {qrUrl && <QRCodeSVG value={qrUrl} size={180} />}
            </div>
            <p className="text-[10px] text-gray-500 leading-relaxed italic">
              "Indian Jugad" tech: Scan to instantly bridge devices via direct P2P connection.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-amber-500" />
              <div className="text-xs font-black uppercase text-amber-500">Frank Drop Pro</div>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Unlock **1GBPS+** speed and priority signaling. No ads, no limits.
            </p>
            <button className="w-full bg-amber-500 text-black text-xs font-black py-3 rounded-xl hover:bg-amber-400 transition-all">
              UPGRADE NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
