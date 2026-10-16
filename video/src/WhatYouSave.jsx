import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { TITLE, TEXT, MONO } from './fonts.js';
import '../../src/design/tokens/colors.css';
import { ICON_PATHS } from './icons.js';
import data from './data.json';


// Category order, labels and glyphs: same as the app's design system.
const CATS = [
  ['restaurant', 'Restaurants', 'utensils'], ['bakery', 'Bakeries', 'croissant'], ['pizza', 'Pizza', 'pizza'],
  ['coffee', 'Coffee', 'coffee'], ['sandwich', 'Sandwiches', 'sandwich'], ['reccs', 'Reccs', 'megaphone'],
  ['favourites', 'Favourites', 'heart'],
];
const present = CATS.filter(([k]) => data.byCategory[k]);
const label = Object.fromEntries(CATS.map(([k, l]) => [k, l]));

// The opening line, in the app's voice: what the archive is mostly made of.
const top = Object.entries(data.byCategory).sort((a, b) => b[1] - a[1])[0][0];
const QUIP = { restaurant: 'Mostly dinner, frankly.', bakery: 'Mostly bread, frankly.', coffee: 'Mostly coffee, frankly.',
  reccs: 'Mostly other people’s ideas.', favourites: 'Mostly favourites.', pizza: 'Mostly pizza. No regrets.', sandwich: 'Mostly sandwiches.' }[top];

// Timeline (frames at 30 fps)
const T = { titleOut: 80, chartIn: 90, shareStart: 450, shareEnd: 500, endIn: 640 };
export const DURATION = 750;

// Chart geometry (px)
const X0 = 470, ABS_W = 1180, SHARE_W = 960, ROW_H = 62, ROW_GAP = 16, TOP = 320, GAP = 3;
const maxTotal = Math.max(...data.cities.map(c => c.total));

const Glyph = ({ name, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] }} />
);

const fade = (f, from, to) => interpolate(f, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

function Row({ city, i, frame, fps }) {
  // Bars grow left to right, one row after another; segments fill in category order.
  const grow = spring({ frame: frame - (T.chartIn + 20 + i * 14), fps, config: { damping: 200 }, durationInFrames: 70 });
  const share = interpolate(frame, [T.shareStart, T.shareEnd], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  const segs = CATS.filter(([k]) => city.breakdown[k]).map(([k, , icon]) => ({ k, icon, n: city.breakdown[k] }));
  const unitAbs = ABS_W / maxTotal, unitShare = SHARE_W / city.total;
  const unit = unitAbs + (unitShare - unitAbs) * share;
  let shown = grow * city.total, x = X0;
  const y = TOP + i * (ROW_H + ROW_GAP);
  const dominant = segs.slice().sort((a, b) => b.n - a.n)[0];
  return (
    <>
      <div style={{ position: 'absolute', left: 120, top: y, height: ROW_H, display: 'flex', alignItems: 'center', fontFamily: TITLE, fontSize: 46, color: 'var(--ink-1)', opacity: fade(frame, T.chartIn + 10 + i * 14, T.chartIn + 30 + i * 14) }}>{city.name}</div>
      {segs.map(s => {
        const n = Math.max(0, Math.min(s.n, shown)); shown -= s.n;
        const w = Math.max(0, n * unit - GAP);
        const left = x; x += s.n * unit;
        if (w <= 0) return null;
        return (
          <div key={s.k} style={{ position: 'absolute', left, top: y, width: w, height: ROW_H, background: `var(--cat-${s.k})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {s.n * unit >= 34 && <Glyph name={s.icon} size={26} color={`var(--cat-${s.k}-on)`} />}
          </div>
        );
      })}
      {/* Count at the end of the bar (absolute view), then the city's biggest category share (share view) */}
      <div style={{ position: 'absolute', left: X0 + city.total * unitAbs * grow + 22, top: y, height: ROW_H, display: 'flex', alignItems: 'center', fontFamily: MONO, fontSize: 34, color: 'var(--ink-1)', opacity: fade(frame, T.chartIn + 40 + i * 14, T.chartIn + 60 + i * 14) * (1 - share) }}>
        {Math.round(city.total * grow)}
      </div>
      <div style={{ position: 'absolute', left: X0 + SHARE_W + 36, top: y, height: ROW_H, display: 'flex', alignItems: 'center', gap: 12, fontFamily: TEXT, fontSize: 30, color: 'var(--ink-2)', opacity: fade(frame, T.shareEnd - 5 + i * 6, T.shareEnd + 15 + i * 6) }}>
        <span style={{ fontFamily: MONO, fontSize: 30, color: 'var(--ink-1)' }}>{Math.round(dominant.n / city.total * 100)}%</span>
        <span>{label[dominant.k].toLowerCase()}</span>
      </div>
    </>
  );
}

export function WhatYouSave() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const titleOpacity = 1 - fade(frame, T.titleOut, T.chartIn);
  const share = fade(frame, T.shareStart, T.shareEnd);
  const chartOpacity = fade(frame, T.chartIn, T.chartIn + 15) * (1 - fade(frame, T.endIn - 20, T.endIn));
  const endOpacity = fade(frame, T.endIn, T.endIn + 20);

  return (
    <AbsoluteFill style={{ background: 'var(--paper-1)', color: 'var(--ink-1)', fontFamily: TEXT }}>
      {/* 1 · Title */}
      <AbsoluteFill style={{ padding: '110px 120px', opacity: titleOpacity }}>
        <div style={{ borderTop: '6px solid var(--ink-1)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          <span>The Index</span><span style={{ fontFamily: MONO, fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'var(--ink-3)' }}>{data.total} places · {data.cities.length} destinations</span>
        </div>
        <div style={{ marginTop: 150, fontFamily: TITLE, fontSize: 124, lineHeight: 1.15, transform: `translateY(${(1 - titleIn) * 40}px)`, opacity: titleIn }}>
          {data.total} places.<br /><span style={{ color: 'var(--red-pencil)' }}>{QUIP}</span>
        </div>
      </AbsoluteFill>

      {/* 2 + 3 · Chart: places per destination, then what each destination is made of */}
      <AbsoluteFill style={{ opacity: chartOpacity }}>
        <div style={{ position: 'absolute', left: 120, right: 120, top: 110, borderTop: '6px solid var(--ink-1)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', fontSize: 22, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>
          <span style={{ position: 'relative' }}>
            <span style={{ opacity: 1 - share }}>What you save, by destination</span>
            <span style={{ position: 'absolute', left: 0, whiteSpace: 'nowrap', opacity: share }}>What each destination is made of</span>
          </span>
          <span style={{ fontFamily: MONO, fontWeight: 400, letterSpacing: 0, textTransform: 'none', color: 'var(--ink-3)' }}>{share < 0.5 ? 'places saved' : 'share of each city'}</span>
        </div>
        {/* Legend: colour + glyph + word, so no category relies on colour alone */}
        <div style={{ position: 'absolute', left: 120, top: 210, display: 'flex', gap: 36, fontSize: 26, color: 'var(--ink-2)' }}>
          {present.map(([k, l, icon], i) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, opacity: fade(frame, T.chartIn + i * 4, T.chartIn + 15 + i * 4) }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: `var(--cat-${k})`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Glyph name={icon} size={20} color={`var(--cat-${k}-on)`} />
              </span>{l}
            </span>
          ))}
        </div>
        {data.cities.map((c, i) => <Row key={c.code} city={c} i={i} frame={frame} fps={fps} />)}
      </AbsoluteFill>

      {/* 4 · End card */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: endOpacity, gap: 28 }}>
        <div style={{ fontFamily: TITLE, fontSize: 180, lineHeight: 1 }}>Gazetteer<span style={{ color: 'var(--red-pencil)' }}>.</span></div>
        <div style={{ fontSize: 36, color: 'var(--ink-2)' }}>A private index of places worth the detour.</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
