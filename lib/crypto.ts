/**
 * SHA-256 hash for password verification.
 * Ported from backup_frank/src/lib/crypto.ts
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * AES-256-GCM encryption using Web Crypto API.
 * Returns format: ENCRYPTED:<base64 salt>:<base64 iv>:<base64 ciphertext>
 */
export async function encryptAES256(
  plaintext: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from password using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Encrypt
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  // Encode to base64
  const toBase64 = (buf: ArrayBuffer) =>
    btoa(Array.from(new Uint8Array(buf)).map(b => String.fromCharCode(b)).join(''));

  return `ENCRYPTED:${toBase64(salt.buffer)}:${toBase64(iv.buffer)}:${toBase64(ciphertext)}`;
}

/**
 * AES-256-GCM decryption. Input must be in ENCRYPTED:salt:iv:ciphertext format.
 * Throws if password is wrong or data is corrupted.
 */
export async function decryptAES256(
  encrypted: string,
  password: string
): Promise<string> {
  const encoder = new TextEncoder();
  const parts = encrypted.split(':');

  if (parts.length !== 4 || parts[0] !== 'ENCRYPTED') {
    throw new Error('Invalid encrypted format');
  }

  // Decode from base64
  const fromBase64 = (str: string) =>
    new Uint8Array(
      atob(str)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

  const salt = fromBase64(parts[1]);
  const iv = fromBase64(parts[2]);
  const ciphertext = fromBase64(parts[3]);

  // Derive same key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/** Check if a string is in our encrypted format */
export function isEncrypted(text: string): boolean {
  return text.startsWith('ENCRYPTED:');
}
