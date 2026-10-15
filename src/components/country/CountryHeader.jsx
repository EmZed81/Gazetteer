import React from 'react';
import { CATEGORY_KEYS, CATEGORIES, catVar } from '../icons/CategoryIcon.jsx';

/** Magazine-section opener for a country: ordinal, name in the title face (auto-fits the container width), stats in mono, category ink-bar. */
const TITLE_FIT_CHARS = 10;

export function CountryHeader({ name, code, ordinal, placeCount = 0, cityCount, breakdown = {}, dek, size = 'lg', style }) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
  const keys = [...CATEGORY_KEYS, 'other'].filter(k => breakdown[k]);
  const big = size === 'lg';
  // One shared title size for every destination: sized so a 10-character name (Amsterdam, Copenhagen) fits one line
  // of the container, capped at the display size. Raise TITLE_FIT_CHARS if a longer destination is added.
  // 0.68em ≈ Cantata One average glyph advance incl. tracking, with headroom for wide letters (m, A, W).
  const fit = `min(${big ? 'var(--display-xl)' : 'var(--display-m)'}, calc(100cqi / ${TITLE_FIT_CHARS * 0.68}))`;
  return (
    <header style={{ containerType: 'inline-size', borderTop: `${big ? 4 : 2}px solid var(--ink-1)`, paddingTop: big ? 14 : 10, display: 'flex', flexDirection: 'column', gap: big ? 16 : 10, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, fontFamily: 'var(--font-text)', fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-1)' }}>
        <span>{ordinal != null && <>No. {String(ordinal).padStart(2, '0')}<span style={{ color: 'var(--text-meta)', margin: '0 8px' }}>/</span></>}<span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, letterSpacing: '.04em' }}>{code}</span></span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, letterSpacing: '.02em', textTransform: 'none', color: 'var(--text-meta)' }}>
          {placeCount} places{cityCount != null && ` · ${cityCount} ${cityCount === 1 ? 'city' : 'cities'}`}
        </span>
      </div>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: fit, lineHeight: 0.9, letterSpacing: '-.025em', color: 'var(--ink-1)', whiteSpace: 'nowrap' }}>{name}</h1>
      {dek && <p style={{ margin: 0, maxWidth: '52ch', fontFamily: 'var(--font-text)', fontSize: big ? 18 : 15, lineHeight: 1.3, color: 'var(--ink-2)', textWrap: 'pretty' }}>{dek}</p>}
      {keys.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div role="img" aria-label={keys.map(k => `${breakdown[k]} ${CATEGORIES[k].plural}`).join(', ')} style={{ display: 'flex', height: big ? 10 : 6, gap: 2 }}>
            {keys.map(k => <span key={k} style={{ flex: breakdown[k] / total, background: catVar(k), minWidth: 4 }}></span>)}
          </div>
          {big && (
            <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 18, rowGap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              {keys.map(k => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, background: catVar(k), borderRadius: '50%' }}></span>
                  {CATEGORIES[k].plural}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-meta)' }}>{breakdown[k]}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
