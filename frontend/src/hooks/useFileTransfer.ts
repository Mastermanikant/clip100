import { useState } from 'react';
import { db } from '@/lib/storage';
import { CHUNK_SIZE } from '@/lib/constants';

interface TransferState {
  [fileId: string]: {
    name: string;
    size: number;
    progress: number;
    status: 'encrypting' | 'sending' | 'receiving' | 'verifying' | 'completed' | 'error';
    speed: number;
  };
}

export function useFileTransfer(dataChannelRef: React.MutableRefObject<RTCDataChannel | null>) {
  const [transfers, setTransfers] = useState<TransferState>({});

  const sendFile = async (file: File) => {
    const fileId = Math.random().toString(36).slice(2);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    setTransfers(prev => ({
      ...prev,
      [fileId]: { name: file.name, size: file.size, progress: 0, status: 'sending', speed: 0 }
    }));

    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      setTransfers(prev => ({ ...prev, [fileId]: { ...prev[fileId], status: 'error' } }));
      return;
    }

    // Send metadata
    dataChannelRef.current.send(JSON.stringify({
      type: 'file_meta',
      fileId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      totalChunks
    }));

    let offset = 0;
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE);
      const buffer = await chunk.arrayBuffer();
      
      // We would encrypt here in Phase 3
      dataChannelRef.current.send(buffer);
      offset += CHUNK_SIZE;
      
      setTransfers(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], progress: Math.min(100, Math.round((offset / file.size) * 100)) }
      }));
    }

    setTransfers(prev => ({ ...prev, [fileId]: { ...prev[fileId], status: 'completed' } }));
  };

  return { transfers, sendFile };
}
