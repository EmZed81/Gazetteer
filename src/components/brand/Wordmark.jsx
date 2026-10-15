import React from 'react';

/** Typographic wordmark. No drawn symbol: the name is the mark. */
export function Wordmark({ variant = 'full', size = 32, tone = 'ink', style }) {
  const color = tone === 'inverse' ? 'var(--text-inverse)' : tone === 'accent' ? 'var(--red-pencil)' : 'var(--text-primary)';
  if (variant === 'monogram') {
    return (
      <span aria-label="Gazetteer" style={{
        width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--red-pencil)', color: 'var(--red-pencil-ink)',
        fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: size * 0.5,
        lineHeight: 1, letterSpacing: '-.02em', paddingBottom: size * 0.04, boxSizing: 'border-box', ...style,
      }}>Gz.</span>
    );
  }
  const word = (
    <span style={{ fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: size, lineHeight: 1, letterSpacing: '-.01em', color }}>
      Gazetteer<span style={{ color: tone === 'ink' ? 'var(--red-pencil)' : color }}>.</span>
    </span>
  );
  if (variant === 'stacked') {
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', gap: size * 0.22, ...style }}>
        <span style={{ fontFamily: 'var(--font-text)', fontSize: Math.max(10, size * 0.18), fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color }}>The</span>
        {word}
        <span style={{ fontFamily: 'var(--font-text)', fontSize: Math.max(13, size * 0.24), color, opacity: tone === 'ink' ? 1 : 0.9 }}>A private index of places worth the detour</span>
      </span>
    );
  }
  return <span style={{ display: 'inline-flex', ...style }}>{word}</span>;
}
