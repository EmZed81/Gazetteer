import React from 'react';
import { Icon } from '../icons/Icon.jsx';

/** Underline search field — a ruled line, not a box. */
export function SearchField({ value = '', onChange, placeholder = 'Search 412 places', onClear, autoFocus, style }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10, height: 44, minWidth: 0,
      borderBottom: `${focus ? 2 : 1}px solid ${focus ? 'var(--red-pencil)' : 'var(--ink-1)'}`,
      paddingBottom: focus ? 0 : 1, color: 'var(--ink-1)', ...style,
    }}>
      <Icon name="search" size={18} />
      <input value={value} autoFocus={autoFocus} placeholder={placeholder}
        onChange={e => onChange && onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', color: 'var(--ink-1)', fontFamily: 'var(--font-text)', fontSize: 16, padding: 0 }} />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onClear ? onClear() : onChange && onChange('')}
          style={{ border: 0, background: 'transparent', color: 'var(--ink-2)', padding: 6, margin: -6, cursor: 'pointer', display: 'flex' }}>
          <Icon name="x" size={16} />
        </button>
      )}
    </label>
  );
}
