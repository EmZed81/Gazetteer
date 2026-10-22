import React from 'react';
import { AbsoluteFill, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { TITLE, TEXT, MONO } from './fonts.js';
import '../../src/design/tokens/colors.css';

// The screen recording (kept out of the repository: public/rec/ is ignored). 886×1920, 24.6 s.
const REC = { src: 'rec/recording.mp4', w: 886, h: 1920, seconds: 24.5 };
const HOLD = 1.5; // seconds the last frame stays on screen at the end
export const WALK_FPS = 30;
export const WALK_DURATION = Math.round((REC.seconds + HOLD) * WALK_FPS);

// Where each tap lands in the recording: seconds, then x/y in recording pixels.
const TAPS = [
  [0.25, 136, 252],   // Gazetteer icon on the home screen
  [3.05, 380, 1200],  // Amsterdam
  [4.95, 729, 931],   // Grid
  [6.65, 809, 931],   // Map
  [8.75, 545, 1037],  // Bakeries
  [10.55, 266, 1037], // Restaurants
  [12.55, 77, 1037],  // All
  [14.15, 649, 931],  // List
  [15.8, 372, 1471],  // Café Kompleet
  [17.85, 673, 1724], // Mark as been
  [18.95, 790, 899],  // ×
  [21.25, 795, 213],  // Moon
  [23.55, 162, 367],  // The Index
];

// Labels beside the phone (option "steps"): from this second on.
const STEPS = [
  [0, 'The Index', 'Every saved place, filed by destination.'],
  [3.0, 'A destination', 'Amsterdam: seventy-one places worth the detour.'],
  [4.85, 'Three views', 'A list, a grid, a map.'],
  [8.65, 'Filters', 'Bakeries, restaurants, or all of it.'],
  [15.7, 'A place', 'Where it is, which list, who recommended it.'],
  [17.75, 'Been', 'Mark it off once you’ve been.'],
  [21.15, 'Night edition', 'For reading after dinner.'],
];

// Phone geometry: screen size on the canvas, then the bezel and titanium band around it.
const SCREEN_W = 420, SCREEN_H = Math.round(SCREEN_W * REC.h / REC.w);
const BEZEL = 11, BAND = 5, RADIUS = 60;
const PHONE_W = SCREEN_W + 2 * (BEZEL + BAND), PHONE_H = SCREEN_H + 2 * (BEZEL + BAND);
const scale = SCREEN_W / REC.w;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

/** A fingertip: a soft dot that presses in, then a ring that spreads out. */
function Tap({ at }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (f / fps - at) * 1000; // ms since the tap
  if (t < -200 || t > 700) return null;
  const dot = interpolate(t, [-200, -60, 0, 120, 360], [0, 1, 1, 1, 0], clamp);
  const press = interpolate(t, [-200, -60, 0, 120], [1.25, 1, 0.82, 0.9], clamp);
  const ring = interpolate(t, [0, 600], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const D = 46;
  return (
    <>
      <div style={{ position: 'absolute', left: -D / 2, top: -D / 2, width: D, height: D, borderRadius: '50%',
        background: 'rgba(27,24,20,.28)', boxShadow: '0 0 0 2px rgba(251,247,238,.85), 0 2px 8px rgba(27,24,20,.25)',
        opacity: dot, transform: `scale(${press})` }} />
      {t >= 0 && <div style={{ position: 'absolute', left: -D / 2, top: -D / 2, width: D, height: D, borderRadius: '50%',
        border: '2.5px solid var(--red-pencil)', opacity: 1 - ring, transform: `scale(${1 + ring * 1.3})` }} />}
    </>
  );
}

/** iPhone 15 Pro, drawn: titanium band, black bezel, side buttons, the Dynamic Island. */
function Phone({ x, y }) {
  const { fps } = useVideoConfig();
  const last = Math.floor(REC.seconds * fps) - 1;
  const button = (side, top, h) => (
    <div style={{ position: 'absolute', [side]: -3.5, top, width: 4, height: h, borderRadius: 2,
      background: 'linear-gradient(90deg, #6d6a66, #b9b5ae 50%, #6d6a66)' }} />
  );
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: PHONE_W, height: PHONE_H }}>
      {button('left', 150, 30)}{button('left', 215, 58)}{button('left', 285, 58)}{button('right', 240, 92)}
      <div style={{ position: 'absolute', inset: 0, borderRadius: RADIUS + BEZEL + BAND,
        background: 'linear-gradient(135deg, #8d8a85, #d8d4cc 22%, #77746f 50%, #c9c5bd 78%, #85827d)',
        boxShadow: '0 40px 80px -20px rgba(27,24,20,.45), 0 12px 24px -8px rgba(27,24,20,.3)' }} />
      <div style={{ position: 'absolute', inset: BAND, borderRadius: RADIUS + BEZEL, background: '#0b0b0c' }} />
      <div style={{ position: 'absolute', left: BAND + BEZEL, top: BAND + BEZEL, width: SCREEN_W, height: SCREEN_H, borderRadius: RADIUS, overflow: 'hidden', background: '#000' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: REC.w, height: REC.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          <Sequence durationInFrames={last}><OffthreadVideo src={staticFile(REC.src)} muted style={{ width: REC.w, height: REC.h }} /></Sequence>
          <Sequence from={last}><Freeze frame={last - 1}><OffthreadVideo src={staticFile(REC.src)} muted style={{ width: REC.w, height: REC.h }} /></Freeze></Sequence>
          {/* The Dynamic Island, drawn over the recording's own (which shows the red recording dot) */}
          <div style={{ position: 'absolute', left: 242, top: 26, width: 388, height: 82, borderRadius: 41, background: '#000' }} />
          {TAPS.map(([at, tx, ty]) => (
            <div key={at} style={{ position: 'absolute', left: tx, top: ty, transform: `scale(${1 / scale})`, transformOrigin: '0 0' }}><Tap at={at} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Wordmark = ({ size }) => (
  <span style={{ fontFamily: TITLE, fontSize: size, lineHeight: 1, color: 'var(--ink-1)' }}>Gazetteer<span style={{ color: 'var(--red-pencil)' }}>.</span></span>
);

function TitleText() {
  const f = useCurrentFrame();
  const a = interpolate(f, [0, 24], [0, 1], clamp);
  return (
    <div style={{ position: 'absolute', left: 190, top: 0, bottom: 0, width: 820, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 34, opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
      <Wordmark size={132} />
      <div style={{ fontFamily: TEXT, fontSize: 40, lineHeight: 1.3, color: 'var(--ink-2)', maxWidth: 640, textWrap: 'balance' }}>A private index of places worth the detour.</div>
    </div>
  );
}

function StepText() {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = f / fps;
  return (
    <div style={{ position: 'absolute', left: 190, top: 0, bottom: 0, width: 820 }}>
      <div style={{ position: 'absolute', top: 128 }}><Wordmark size={46} /></div>
      {STEPS.map(([from, title, sub], i) => {
        const to = i + 1 < STEPS.length ? STEPS[i + 1][0] : 999;
        const inA = interpolate(s, [from, from + 0.45], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
        const outA = interpolate(s, [to - 0.25, to], [1, 0], clamp);
        const o = Math.min(inA, outA);
        if (o <= 0) return null;
        return (
          <div key={title} style={{ position: 'absolute', top: 420, opacity: o, transform: `translateY(${(1 - inA) * 24}px)` }}>
            <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '.04em', color: 'var(--red-pencil)' }}>{String(i + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}</div>
            <div style={{ fontFamily: TITLE, fontSize: 96, lineHeight: 1.1, marginTop: 18, color: 'var(--ink-1)' }}>{title}</div>
            <div style={{ fontFamily: TEXT, fontSize: 36, lineHeight: 1.3, marginTop: 22, color: 'var(--ink-2)', maxWidth: 640 }}>{sub}</div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', bottom: 128, fontFamily: TEXT, fontSize: 26, color: 'var(--ink-3)' }}>A private index of places worth the detour.</div>
    </div>
  );
}

/** Landscape walkthrough for LinkedIn. `type`: 'phone' (phone only), 'title' (wordmark + line), 'steps' (changing labels). */
export function Walkthrough({ type = 'steps' }) {
  const phoneX = type === 'phone' ? (1920 - PHONE_W) / 2 : 1920 - 190 - PHONE_W - 120;
  return (
    <AbsoluteFill style={{ background: 'var(--paper-1)' }}>
      {type === 'title' && <TitleText />}
      {type === 'steps' && <StepText />}
      <Phone x={phoneX} y={(1080 - PHONE_H) / 2} />
    </AbsoluteFill>
  );
}
