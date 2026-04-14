'use client';
import { useCallback } from 'react';
import { encryptAES256, decryptAES256, hashPassword } from '@/lib/crypto';

export function useEncryption() {
  const isEncrypted = useCallback((text: string) => {
    return text.startsWith('ENCRYPTED:');
  }, []);

  const encrypt = useCallback(async (plaintext: string, password: string) => {
    return await encryptAES256(plaintext, password);
  }, []);

  const decrypt = useCallback(async (ciphertext: string, password: string) => {
    try {
      return await decryptAES256(ciphertext, password);
    } catch (err) {
      throw new Error('Failed to decrypt. Incorrect password?');
    }
  }, []);

  return { encrypt, decrypt, hashPassword, isEncrypted };
}
