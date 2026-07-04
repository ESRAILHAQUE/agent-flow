import crypto from 'crypto';
import { config } from '../config/index.js';

// AES-256-CBC encryption for sensitive values like API keys
// Requires API_KEY_ENCRYPTION_SECRET env var (exactly 32 characters)
const getKey = (): Buffer => {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET || config.jwt.accessSecret;
  // Always use first 32 bytes as the key
  return Buffer.from(secret.padEnd(32, '0').slice(0, 32));
};

/**
 * Encrypts a plaintext string using AES-256-CBC.
 * Returns: "ivHex:encryptedHex"
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string previously encrypted with `encrypt()`.
 */
export function decrypt(encryptedText: string): string {
  const [ivHex, encryptedHex] = encryptedText.split(':');
  if (!ivHex || !encryptedHex) throw new Error('Invalid encrypted format');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    getKey(),
    Buffer.from(ivHex, 'hex'),
  );
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Masks an API key for display. Shows first 6 and last 4 chars.
 * e.g. "sk-or-v1-abc...xyz1"
 */
export function maskApiKey(key: string): string {
  if (key.length <= 10) return '••••••••••••';
  return `${key.slice(0, 6)}${'•'.repeat(Math.max(key.length - 10, 6))}${key.slice(-4)}`;
}
