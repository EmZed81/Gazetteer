// Unscrambles your place list with your passcode (see scripts/lock-data.mjs).
// The derived key is remembered on this phone so you only type the passcode once.
import { load, save } from './storage.js';

const fromB64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

export async function fetchLocked(path = 'data/places.locked.json') {
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load your places');
  return res.json();
}

async function decrypt(locked, key) {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(locked.iv) }, key, fromB64(locked.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

// Try the key saved on this phone. Returns the places, or null if there's none or it no longer fits.
export async function unlockWithSavedKey(locked) {
  const saved = load('key', null);
  if (!saved || saved.salt !== locked.salt) return null;
  try {
    const key = await crypto.subtle.importKey('raw', fromB64(saved.key), 'AES-GCM', false, ['decrypt']);
    return await decrypt(locked, key);
  } catch { return null; }
}

// Try a typed passcode. Returns the places, or null if it's wrong.
export async function unlockWithPasscode(locked, passcode) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passcode.trim().normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: fromB64(locked.salt), iterations: locked.iterations, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  try {
    const places = await decrypt(locked, key);
    save('key', { salt: locked.salt, key: toB64(await crypto.subtle.exportKey('raw', key)) });
    return places;
  } catch { return null; }
}
