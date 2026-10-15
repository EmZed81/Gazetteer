import React from 'react';
import { Icon } from '../icons/Icon.jsx';

const OPTS = [
  { id: 'list', icon: 'list', label: 'List' },
  { id: 'grid', icon: 'layout-grid', label: 'Grid' },
  { id: 'map', icon: 'map', label: 'Map' },
];

/** Segmented control for list / grid / map. */
export function ViewToggle({ value = 'list', onChange, showLabels = true, options = ['list', 'grid', 'map'], style }) {
  return (
    <div role="radiogroup" aria-label="View as" style={{ display: 'inline-flex', border: '1px solid var(--ink-1)', flexShrink: 0, ...style }}>
      {OPTS.filter(o => options.includes(o.id)).map((o, i) => {
        const on = o.id === value;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={on} aria-label={o.label} onClick={() => onChange && onChange(o.id)}
            style={{
              height: 36, padding: showLabels ? '0 12px' : '0 9px', display: 'inline-flex', alignItems: 'center', gap: 6,
              border: 0, borderLeft: i ? '1px solid var(--ink-1)' : 0, borderRadius: 0,
              background: on ? 'var(--ink-1)' : 'transparent', color: on ? 'var(--paper-0)' : 'var(--ink-1)',
              fontFamily: 'var(--font-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'background var(--dur-fast) var(--ease-out)',
            }}>
            <Icon name={o.icon} size={16} />{showLabels && o.label}
          </button>
        );
      })}
    </div>
  );
}
