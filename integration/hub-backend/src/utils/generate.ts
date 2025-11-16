/**
 * Data generation utilities for realistic blockchain data
 */

const hexChars = '0123456789abcdef';

function randomHex(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += hexChars[Math.floor(Math.random() * hexChars.length)];
  }
  return result;
}

function randomAlphanumeric(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateTxHash(): string {
  return `0x${randomHex(64)}`;
}

export function generateAddress(): string {
  return `0x${randomHex(40)}`;
}

export function generateMessageId(): string {
  return randomAlphanumeric(32 + Math.floor(Math.random() * 16));
}

export function generateAttestation(): string {
  return `0x${randomHex(128)}`;
}

export function generateContractAddress(): string {
  return `0x${randomHex(40)}`;
}

export function generateBalance(): string {
  const whole = Math.floor(Math.random() * 5000) + 100;
  const decimal = Math.floor(Math.random() * 100);
  return `${whole}.${decimal.toString().padStart(2, '0')}`;
}

export function generateId(): string {
  return `${Date.now()}_${randomHex(16)}`;
}

export function generateBalance(): string {
  const whole = Math.floor(Math.random() * 5000) + 100;
  const decimal = Math.floor(Math.random() * 100);
  return `${whole}.${decimal.toString().padStart(2, '0')}`;
}

