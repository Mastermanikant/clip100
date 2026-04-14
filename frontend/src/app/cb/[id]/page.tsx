'use client';

import React, { useEffect } from 'react';
import { useRoomStore } from '@/store/useRoomStore';
import ClipboardModule from '@/components/ecosystem/ClipboardModule';
import { useParams } from 'next/navigation';

export default function ClipboardPage() {
  const params = useParams();
  const { roomId, setRoom } = useRoomStore();

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      setRoom(params.id, params.id, false);
    }
  }, [params.id, setRoom]);

  // JUGAD: Use NoSSR rendering inside the module
  return <ClipboardModule />;
}
