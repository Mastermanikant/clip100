'use client';

import React, { useEffect } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import TransferRoom from '@/components/TransferRoom';
import { useParams } from 'next/navigation';

export default function RoomPage() {
  const params = useParams();
  const { roomId, setRoom } = useRoomStore();

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      setRoom(params.id, params.id, false);
    }
  }, [params.id, setRoom]);

  if (!roomId) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-mono">Loading Ecosystem...</div>;

  return <TransferRoom initialTab="chat" />;
}
