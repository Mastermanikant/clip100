'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import { WebRTCManager } from '@/lib/webrtc';
import { getAblyClient, getRoomChannel } from '@/lib/ably';
import { QRCodeSVG } from 'qrcode.react';
import { Send, File, X, Check, Copy, Share2, ArrowLeft, Zap, Crown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TransferItem from '../TransferItem';

export default function RoomModule() {
  const { roomId, resetRoom } = useRoomStore();
  const [rtcManager, setRtcManager] = useState<WebRTCManager | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [nickname, setNickname] = useState('');
  const [isChoosingName, setIsChoosingName] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    setIsMounted(true);
    setQrUrl(`${window.location.origin}/room/${roomId}`);
  }, [roomId]);

  useEffect(() => {
    if (!isMounted || !roomId) return;
    
    const init = async () => {
      const client = await getAblyClient();
      const channel = getRoomChannel(client, roomId);
      
      const manager = new WebRTCManager(roomId, client, channel, async (data: any) => {
        if (data.type === 'progress') {
          setMessages((prev) => prev.map(m => 
            (m.type === 'file' && m.fileName && data.fileId.includes(m.fileName)) ? { ...m, progress: data.progress } : m
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
          }
        } else {
          setMessages((prev) => [...prev, { ...data, timestamp: Date.now(), received: true }]);
        }
      }, true); // Parallel Channels ON for Room
      
      setRtcManager(manager);
    };

    init();
  }, [isMounted, roomId]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !rtcManager) return;
    const msg = { type: 'text', content: inputText, sender: nickname };
    rtcManager.sendData(msg);
    setMessages(prev => [...prev, { ...msg, timestamp: Date.now(), received: false }]);
    setInputText('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && rtcManager) {
      setMessages(prev => [...prev, { type: 'file', fileName: file.name, progress: 0, received: false }]);
      await rtcManager.sendFile(file, (p) => {
        setMessages(prev => prev.map(m => (m.type === 'file' && m.fileName === file.name) ? { ...m, progress: p } : m));
      });
      rtcManager.sendData({ type: 'file_complete', fileId: `${file.name}-${file.size}-${file.lastModified}` });
    }
  };

  if (!isMounted) return null;

  if (isChoosingName) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white/[0.03] border border-white/10 p-10 rounded-[2.5rem] text-center space-y-6">
           <Zap className="w-12 h-12 text-blue-500 mx-auto" />
           <h2 className="text-2xl font-bold italic">Transfer Identity</h2>
           <input 
             type="text" 
             placeholder="Your Nickname" 
             className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-center text-white outline-none focus:ring-2 focus:ring-blue-500"
             value={nickname}
             onChange={(e) => setNickname(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && setIsChoosingName(false)}
           />
           <button onClick={() => setIsChoosingName(false)} className="w-full bg-blue-600 font-bold py-4 rounded-2xl text-white">Join Room</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6 max-w-6xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8 px-6 py-4 bg-white/5 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={resetRoom} className="p-2 hover:bg-white/10 rounded-full"><ArrowLeft /></button>
          <div>
            <h1 className="text-xl font-bold tracking-tighter">Room: {roomId}</h1>
            <p className="text-[10px] text-blue-500 font-mono">ENCRYPTED P2P CHANNEL</p>
          </div>
        </div>
        <div className="flex gap-2">
           <QRCodeSVG value={qrUrl} size={32} className="bg-white p-1 rounded" />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden max-h-[75vh]">
        <div className="lg:col-span-2 bg-white/[0.02] rounded-[2.5rem] border border-white/10 flex flex-col p-6 relative">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
            {messages.map((msg, i) => (
              <TransferItem key={i} msg={msg} />
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none"
              placeholder="Type message..." 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} className="bg-blue-600 p-4 rounded-2xl"><Send className="w-5 h-5" /></button>
            <label className="bg-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-all">
              <File className="w-5 h-5" />
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20"><Zap className="w-12 h-12" /></div>
            <h3 className="text-xl font-bold mb-2">Turbo Transfer</h3>
            <p className="text-sm text-gray-400">Parallel DataChannels enabled. Speeding up your P2P connection globally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
