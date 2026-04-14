'use client';

import React from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import TransferRoom from '@/components/TransferRoom';
import { useParams } from 'next/navigation';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { setRoom } = useRoomStore();

  React.useEffect(() => {
    if (roomId) {
      // Logic for joining via vanity URL
      setRoom(roomId, roomId, false);
    }
  }, [roomId, setRoom]);

  return <TransferRoom />;
}
