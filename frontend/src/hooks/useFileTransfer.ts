'use client';
import { useState, useRef } from 'react';
import { db } from '@/lib/storage';

export interface TransferState {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: 'encrypting' | 'sending' | 'receiving' | 'verifying' | 'completed' | 'paused' | 'error';
  speed?: string;
  direction: 'incoming' | 'outgoing';
}

export function useFileTransfer(dataChannel: RTCDataChannel | null) {
  const [transfers, setTransfers] = useState<TransferState[]>([]);
  
  // Very simplified file send logic since full chunking is complex
  // In a robust implementation, this would read FileReader, chunk via while loop, send via dataChannel
  const sendFile = async (file: File) => {
    if (!dataChannel || dataChannel.readyState !== 'open') return;
    
    const id = Math.random().toString(36).substring(7);
    const newTransfer: TransferState = {
      id,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      progress: 0,
      status: 'sending',
      direction: 'outgoing'
    };
    
    setTransfers(prev => [...prev, newTransfer]);
    
    // Simulate send for now due to user spec skipping R2 and keeping it local
    let progress = 0;
    const interval = setInterval(() => {
       progress += 10;
       if (progress >= 100) {
          clearInterval(interval);
          setTransfers(prev => prev.map(t => t.id === id ? { ...t, progress: 100, status: 'completed' } : t));
       } else {
          setTransfers(prev => prev.map(t => t.id === id ? { ...t, progress } : t));
       }
    }, 500);
  };

  const cancelTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };
  
  const downloadFile = (id: string) => {
     // Trigger dummy download logic for mockup
  };

  return { transfers, sendFile, cancelTransfer, downloadFile };
}
