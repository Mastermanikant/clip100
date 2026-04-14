/**
 * Hashes a string using SHA-256 for secure client-side password verification.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 */
export async function encryptAES256(plaintext: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Hash password to use as key base
  const passHash = await hashPassword(password);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passHash),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );
  
  const encryptedBytes = new Uint8Array(encryptedBuf);
  // Encode Base64
  const saltB64 = btoa(String.fromCharCode(...salt));
  const ivB64 = btoa(String.fromCharCode(...iv));
  const encryptedB64 = btoa(String.fromCharCode(...encryptedBytes));
  
  return `ENCRYPTED:${saltB64}:${ivB64}:${encryptedB64}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 */
export async function decryptAES256(ciphertext: string, password: string): Promise<string> {
  if (!ciphertext.startsWith('ENCRYPTED:')) {
    throw new Error('Invalid ciphertext format');
  }
  
  const parts = ciphertext.split(':');
  const salt = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(parts[3]), c => c.charCodeAt(0));
  
  const passHash = await hashPassword(password);
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passHash),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  return new TextDecoder().decode(decryptedBuf);
}
