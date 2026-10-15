// Scrambles (encrypts) your place list with your passcode so it can sit on a public website.
// Usage: GAZETTEER_PASSCODE='your passcode' node scripts/lock-data.mjs <places.json>
// Writes public/data/places.locked.json. The app asks for the passcode once, then remembers it on the phone.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';

const ITERATIONS = 310000; // PBKDF2 rounds: makes guessing passcodes slow
const passcode = process.env.GAZETTEER_PASSCODE;
const input = process.argv[2];
if (!passcode || !input) { console.error('Set GAZETTEER_PASSCODE and pass the places.json path.'); process.exit(1); }

const b64 = buf => Buffer.from(buf).toString('base64');
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passcode.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const plain = new TextEncoder().encode(JSON.stringify(JSON.parse(readFileSync(input, 'utf8'))));
const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);

mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/places.locked.json', JSON.stringify({ v: 1, iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) }));
console.log('Locked', JSON.parse(readFileSync(input, 'utf8')).length, 'places into public/data/places.locked.json');
