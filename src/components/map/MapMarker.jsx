import React from 'react';
import { CategoryIcon } from '../icons/CategoryIcon.jsx';

/**
 * Map marker. dot (zoomed out) · pin (default disc with glyph) · cluster (ink disc + count).
 * Selected pins grow and fly an ink label flag.
 */
export function MapMarker({ category = 'other', variant = 'pin', selected = false, faded = false, count, label, onClick, style }) {
  if (variant === 'cluster') {
    const s = count > 99 ? 40 : count > 9 ? 34 : 28;
    return (
      <button type="button" onClick={onClick} aria-label={`${count} places`} style={{
        width: s, height: s, borderRadius: '50%', border: '2px solid var(--marker-ring)', background: 'var(--ink-1)', color: 'var(--paper-0)',
        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'var(--shadow-marker)', cursor: 'pointer', padding: 0, ...style,
      }}>{count}</button>
    );
  }
  if (variant === 'dot') {
    return <span onClick={onClick} style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: `var(--cat-${category})`, border: '1.5px solid var(--marker-ring)', boxShadow: 'var(--shadow-marker)', cursor: onClick ? 'pointer' : 'default', ...style }}></span>;
  }
  const size = selected ? 36 : 26;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', opacity: faded ? 0.45 : 1, ...style }}>
      <button type="button" onClick={onClick} aria-label={label} aria-pressed={selected} style={{
        padding: 0, border: `${selected ? 3 : 2}px solid ${selected ? 'var(--ink-1)' : 'var(--marker-ring)'}`, borderRadius: '50%',
        background: 'transparent', boxShadow: 'var(--shadow-marker)', cursor: 'pointer', display: 'inline-flex',
        transition: 'transform var(--dur-base) var(--ease-out)', zIndex: selected ? 2 : 1,
      }}>
        <CategoryIcon category={category} shape="disc" size={size} />
      </button>
      {selected && label && (
        <span style={{
          position: 'absolute', left: size + 8, top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap',
          background: 'var(--ink-1)', color: 'var(--paper-0)', fontFamily: 'var(--font-text)', fontSize: 13, fontWeight: 600,
          padding: '5px 9px', boxShadow: 'var(--shadow-marker)', zIndex: 3,
        }}>{label}</span>
      )}
    </span>
  );
}
