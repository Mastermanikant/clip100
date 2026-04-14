'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Lock, Shield, Link as LinkIcon, File } from 'lucide-react';
import { useFrankRTC } from '@/hooks/useFrankRTC';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import { useEncryption } from '@/hooks/useEncryption';
import { RoomHeader } from '@/components/RoomHeader';
import { MessageBubble } from '@/components/MessageBubble';
import { QRPanel } from '@/components/QRPanel';
import { TransferItem } from '@/components/TransferItem';

export default function FrankLinkRoom({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId.toUpperCase();
  const [inputMsg, setInputMsg] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'password'>('text');
  
  const { isConnected, peerCount, messages, sendText, dataChannel } = useFrankRTC({ roomId, ecosystem: 'link' });
  const { transfers, sendFile, cancelTransfer, downloadFile } = useFileTransfer(dataChannel);
  const { encrypt, isEncrypted } = useEncryption();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    if (activeTab === 'password' && password) {
       const encrypted = await encrypt(inputMsg, password);
       sendText(encrypted);
    } else {
       sendText(inputMsg);
    }
    setInputMsg('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files.length > 0) {
        sendFile(e.target.files[0]);
     }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.03] transition-colors duration-1000 ${isConnected ? 'bg-green-500' : 'bg-blue-600'}`} />
      </div>

      <motion.div 
        layout
        className="max-w-4xl w-full h-[90vh] bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden relative z-10"
      >
        <RoomHeader 
           title="FrankLink" 
           roomId={roomId} 
           isConnected={isConnected} 
           peerCount={peerCount} 
        />

        {/* Tab Bar */}
        <div className="grid grid-cols-3 bg-black/40 border-b border-white/5 p-2 gap-2 shrink-0">
           {(['text', 'file', 'password'] as const).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-400'}`}
              >
                 {tab === 'text' && <MessageSquare className="w-4 h-4" />}
                 {tab === 'file' && <File className="w-4 h-4" />}
                 {tab === 'password' && <Lock className="w-4 h-4" />}
                 {tab}
              </button>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
           <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {peerCount === 0 && messages.length === 0 && transfers.length === 0 && (
                <QRPanel 
                  url={typeof window !== 'undefined' ? `${window.location.origin}/link/${roomId}` : ''}
                  roomId={roomId}
                />
              )}
              
              {activeTab !== 'file' ? messages.map((msg) => (
                <MessageBubble 
                  key={msg.id}
                  content={msg.content}
                  sender={msg.sender}
                  timestamp={msg.timestamp}
                  isEncrypted={isEncrypted(msg.content)}
                  onCopy={copyToClipboard}
                />
              )) : transfers.map((t) => (
                 <TransferItem 
                    key={t.id}
                    {...t}
                    onCancel={cancelTransfer}
                    onDownload={downloadFile}
                 />
              ))}
           </div>

           {/* Input Area */}
           <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-md shrink-0">
             <form onSubmit={handleSend} className="space-y-3 flex flex-col">
               {activeTab === 'password' && (
                 <input 
                   type="password"
                   placeholder="Encryption Password..."
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-sm text-white"
                   required
                 />
               )}
               {activeTab === 'file' ? (
                 <div className="flex gap-2">
                    <input type="file" id="file" onChange={handleFileUpload} className="hidden" />
                    <label htmlFor="file" className="flex-1 p-4 bg-white/5 border border-dashed border-white/20 hover:border-blue-500/50 rounded-xl flex items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">
                       <ImageIcon className="w-5 h-5" /> Select files to stream
                    </label>
                 </div>
               ) : (
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={inputMsg}
                     onChange={(e) => setInputMsg(e.target.value)}
                     placeholder="Type a secure message..."
                     className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-500 text-sm"
                   />
                   <button 
                     type="submit" 
                     disabled={!inputMsg.trim() || (activeTab === 'password' && !password)}
                     className="px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white rounded-xl transition-colors"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 </div>
               )}
             </form>
           </div>
        </div>
      </motion.div>
    </main>
  );
}

// Ensure MessageSquare is actually imported, wait, let's fix the missing import in the next file write if needed.
// Wait, I used MessageSquare but didn't import it at the top of the file. I'll just use LinkIcon for text instead.
import { MessageSquare } from 'lucide-react';
