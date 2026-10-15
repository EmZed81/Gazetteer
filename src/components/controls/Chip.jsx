import React from 'react';
import { CategoryIcon } from '../icons/CategoryIcon.jsx';

/** Filter chip. Off = hairline outline, on = ink slab. Optional category glyph and mono count. */
export function Chip({ label, selected = false, count, category, onClick, disabled, size = 'md', style }) {
  const [hover, setHover] = React.useState(false);
  const h = size === 'sm' ? 30 : 36;
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height: h, padding: `0 ${size === 'sm' ? 10 : 12}px`, display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0,
        background: selected ? 'var(--ink-1)' : hover ? 'var(--paper-2)' : 'transparent',
        color: selected ? 'var(--paper-0)' : 'var(--ink-1)',
        border: `1px solid ${selected ? 'var(--ink-1)' : 'var(--ink-1)'}`, borderRadius: 0,
        fontFamily: 'var(--font-text)', fontSize: size === 'sm' ? 12 : 13, fontWeight: 500,
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, whiteSpace: 'nowrap',
        transition: 'background var(--dur-fast) var(--ease-out), color var(--dur-fast)', ...style,
      }}>
      {category && <CategoryIcon category={category} shape="disc" size={size === 'sm' ? 14 : 16} />}
      <span>{label}</span>
      {count != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: selected ? 0.75 : 1, color: selected ? 'inherit' : 'var(--text-meta)' }}>{count}</span>}
    </button>
  );
}
