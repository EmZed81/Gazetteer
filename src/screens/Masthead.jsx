import React from 'react';
import { Wordmark } from '../components/brand/Wordmark.jsx';
import { IconButton } from '../components/controls/Button.jsx';

/** Sticky top bar: wordmark (back to the Index) and the day/night edition switch. */
export function Masthead({ onHome, theme, onTheme }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--ink-1)', background: 'var(--surface-page)', position: 'sticky', top: 0, zIndex: 20 }}>
      <button onClick={onHome} aria-label="The Index" style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }}>
        <Wordmark size={24} />
      </button>
      <IconButton icon={theme === 'night' ? 'sun' : 'moon'} label={theme === 'night' ? 'Day edition' : 'Night edition'} variant="ghost" size="lg" onClick={onTheme} />
    </header>
  );
}
