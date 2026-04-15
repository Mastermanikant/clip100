'use client';

import { useState } from 'react';
import { encryptAES256, decryptAES256, isEncrypted } from '@/lib/crypto';
import { useAppStore } from '@/store/useAppStore';

export function useEncryption() {
  const { roomCode } = useAppStore();

  const encrypt = async (text: string) => {
    if (!roomCode) return text;
    try {
      return await encryptAES256(text, roomCode);
    } catch {
      return text;
    }
  };

  const decrypt = async (text: string) => {
    if (!isEncrypted(text) || !roomCode) return text;
    try {
      return await decryptAES256(text, roomCode);
    } catch {
      return '*** Encrypted Message ***';
    }
  };

  return { encrypt, decrypt };
}
