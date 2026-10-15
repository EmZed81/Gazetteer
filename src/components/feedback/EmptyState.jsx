import React from 'react';
import { Icon } from '../icons/Icon.jsx';
import { Button } from '../controls/Button.jsx';

const PRESETS = {
  search: { numeral: '0', kicker: 'No results', title: 'Nothing filed under that.', body: 'Try a city, a dish, or a word from one of your notes.' },
  filter: { numeral: '0', kicker: 'Filtered out', title: 'Too picky, even for you.', body: 'No places match every filter at once. Loosen one.' },
  country: { numeral: '—', kicker: 'Unexplored', title: 'Nothing saved here. Yet.', body: 'Save a place in Google Maps and it will turn up on the next sync.' },
  list: { numeral: '0', kicker: 'Empty list', title: 'A list with ambitions.', body: 'Add places to it in Google Maps.' },
};

/** Empty state: oversized Bodoni numeral, a dry headline, one way out. */
export function EmptyState({ kind = 'search', title, body, kicker, actionLabel, onAction, query, align = 'left', style }) {
  const p = PRESETS[kind] || PRESETS.search;
  const center = align === 'center';
  return (
    <section style={{ display: 'grid', gridTemplateColumns: center ? '1fr' : 'auto minmax(0,1fr)', columnGap: 28, rowGap: 8, alignItems: 'start', justifyItems: center ? 'center' : 'start', textAlign: center ? 'center' : 'left', padding: '40px 0', ...style }}>
      <div aria-hidden="true" style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 168, lineHeight: 0.78, letterSpacing: '-.04em', color: 'var(--red-pencil)' }}>{p.numeral}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: center ? 'center' : 'flex-start', maxWidth: 440, paddingTop: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-1)', borderTop: '2px solid var(--ink-1)', paddingTop: 8 }}>{kicker || p.kicker}</span>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 36, lineHeight: 1, letterSpacing: '-.02em', color: 'var(--ink-1)', textWrap: 'balance' }}>{title || p.title}</h2>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--text-secondary)', textWrap: 'pretty' }}>
          {query && <>No places match <span style={{ color: 'var(--ink-1)', fontWeight: 600 }}>“{query}”</span>. </>}{body || p.body}
        </p>
        {actionLabel && <Button variant="secondary" size="sm" onClick={onAction} style={{ marginTop: 6 }}>{actionLabel}</Button>}
      </div>
    </section>
  );
}
