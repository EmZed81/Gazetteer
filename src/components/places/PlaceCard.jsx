import React from 'react';
import { CategoryIcon, CATEGORIES, catVar } from '../icons/CategoryIcon.jsx';
import { CategoryTag } from './CategoryTag.jsx';
import { Icon } from '../icons/Icon.jsx';

const pad2 = n => String(n).padStart(3, '0');

/**
 * A saved place. Three densities:
 *  row     — the default list entry (name, area, note, list)
 *  compact — one line, for screens holding hundreds of places
 *  tile    — grid card, typographic (no photo needed)
 */
export function PlaceCard({ name, category = 'other', area, city, countryCode, note, list, source, favourite, index, visited, variant = 'row', selected, onClick, style }) {
  const [hover, setHover] = React.useState(false);
  const where = [area, city].filter(Boolean).join(', ');
  // Recommended places credit the reviewer ("via Tomek") where other places show their Google list.
  const listLine = source ? `via ${source}` : list;
  // A place that is also in "Favourite places" gets a small heart next to its name.
  const heart = favourite && category !== 'favourites' && (
    <span title="Also a favourite" style={{ color: catVar('favourites', 'text'), display: 'inline-flex' }}><Icon name="heart" size={13} /></span>
  );
  const common = {
    role: onClick ? 'button' : undefined, tabIndex: onClick ? 0 : undefined, onClick,
    onKeyDown: e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } },
    onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
  };
  const bg = selected ? 'var(--paper-0)' : hover && onClick ? 'var(--paper-2)' : 'transparent';

  if (variant === 'compact') {
    return (
      <div {...common} style={{
        display: 'grid', gridTemplateColumns: '16px minmax(0,1fr) auto', alignItems: 'center', gap: 10, minHeight: 48, padding: '0 8px', // 48px: Android tap-target minimum
        borderBottom: '1px solid var(--rule-soft)', background: bg, cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? 'inset 3px 0 0 var(--red-pencil)' : 'none', ...style,
      }}>
        <CategoryIcon category={category} shape="disc" size={16} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
          {heart}
          <span style={{ fontSize: 13, color: 'var(--text-meta)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{where}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-meta)' }}>{countryCode}</span>
      </div>
    );
  }

  if (variant === 'tile') {
    return (
      <article {...common} style={{
        display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px 16px', minHeight: 200, boxSizing: 'border-box',
        background: hover && onClick ? 'var(--paper-0)' : 'var(--surface-raised)',
        borderTop: `6px solid ${catVar(category)}`, outline: selected ? '2px solid var(--red-pencil)' : 'none', outlineOffset: -2,
        cursor: onClick ? 'pointer' : 'default', transition: 'background var(--dur-fast) var(--ease-out)', ...style,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CategoryTag category={category} />
          {index != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-meta)' }}>№ {pad2(index)}</span>}
        </div>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: 24, lineHeight: 1.25, letterSpacing: '-.01em', color: 'var(--ink-1)', textWrap: 'balance', overflowWrap: 'anywhere', hyphens: 'auto' }}>{name}</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{where}{countryCode && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-meta)', marginLeft: 6 }}>{countryCode}</span>}</div>
        {note && <p style={{ margin: 0, fontFamily: 'var(--font-text)', fontSize: 14, lineHeight: 1.45, color: 'var(--ink-1)', textWrap: 'pretty' }}>“{note}”</p>}
        <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--rule-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-meta)' }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listLine || '—'}</span>
          {visited ? <span style={{ fontWeight: 600, color: 'var(--ink-1)' }}>Been ✓</span> : <span>Not yet</span>}
        </div>
      </article>
    );
  }

  return (
    <article {...common} style={{
      display: 'grid', gridTemplateColumns: (index != null ? '36px ' : '') + '28px minmax(0,1fr) auto', columnGap: 14, alignItems: 'start',
      padding: '14px 8px 14px 8px', borderBottom: '1px solid var(--rule-soft)', background: bg,
      boxShadow: selected ? 'inset 3px 0 0 var(--red-pencil)' : 'none', cursor: onClick ? 'pointer' : 'default',
      transition: 'background var(--dur-fast) var(--ease-out)', ...style,
    }}>
      {index != null && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-meta)', paddingTop: 6 }}>{pad2(index)}</span>}
      <CategoryIcon category={category} shape="disc" size={28} style={{ marginTop: 0 }} />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, lineHeight: 1.2, color: 'var(--ink-1)', letterSpacing: '-.005em' }}>{name}</h3>
          {heart}
          {visited && <span title="Visited" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-meta)' }}>Been</span>}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: catVar(category, 'text'), fontWeight: 600 }}>{(CATEGORIES[category] || CATEGORIES.other).label}</span>
          {where && <span> · {where}</span>}
          {listLine && <span style={{ color: 'var(--text-meta)' }}> · {listLine}</span>}
        </div>
        {note && <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-text)', fontSize: 14, lineHeight: 1.45, color: 'var(--ink-1)', textWrap: 'pretty' }}>{note}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, color: 'var(--text-meta)' }}>
        {countryCode && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{countryCode}</span>}
        {onClick && <Icon name="arrow-up-right" size={16} style={{ opacity: hover ? 1 : 0.5, color: hover ? 'var(--red-pencil)' : 'inherit' }} />}
      </div>
    </article>
  );
}
