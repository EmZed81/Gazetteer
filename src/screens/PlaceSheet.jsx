import React from 'react';
import { CategoryTag } from '../components/places/CategoryTag.jsx';
import { Button, IconButton } from '../components/controls/Button.jsx';

const Row = ({ label, children }) => (<>
  <dt className="gz-kicker" style={{ color: 'var(--text-meta)', paddingTop: 2 }}>{label}</dt>
  <dd style={{ margin: 0 }}>{children}</dd>
</>);

/** Bottom sheet with one place's details. Slides up; × or the back gesture closes it. */
export function PlaceSheet({ place: p, city, onClose, onToggleVisited }) {
  const [shown, setShown] = React.useState(false);
  React.useEffect(() => { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t); }, [p.id]);
  React.useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const where = [p.area, p.city].filter(Boolean).join(', ');
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'var(--overlay-scrim)', opacity: shown ? 1 : 0, transition: 'opacity var(--dur-slow) var(--ease-out)' }}></div>
      <aside role="dialog" aria-label={p.name} style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '82%', transform: shown ? 'none' : 'translateY(100%)',
        borderTop: '4px solid var(--ink-1)', background: 'var(--surface-raised)', boxShadow: 'var(--shadow-float)', overflowY: 'auto',
        transition: 'transform var(--dur-slow) var(--ease-out)', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ height: 10, background: `var(--cat-${p.category})`, flexShrink: 0 }}></div>
        <div style={{ padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CategoryTag category={p.category} />
            <IconButton icon="x" label="Close" variant="ghost" size="lg" onClick={onClose} />
          </div>
          <h2 className="gz-display" style={{ margin: 0, fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: 40, lineHeight: 1.08, textWrap: 'balance', overflowWrap: 'anywhere' }}>{p.name}</h2>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            {where} <span className="gz-mono" style={{ fontSize: 12, color: 'var(--text-meta)', marginLeft: 6 }}>{p.cityCode}</span>
          </div>
          {p.note && (
            <blockquote style={{ margin: 0, padding: '14px 0', borderTop: '1px solid var(--ink-1)', borderBottom: '1px solid var(--ink-1)' }}>
              <div className="gz-kicker" style={{ color: 'var(--text-meta)', marginBottom: 6 }}>Your note</div>
              <p style={{ margin: 0, fontFamily: 'var(--font-text)', fontSize: 14, lineHeight: 1.45, color: 'var(--ink-1)' }}>{p.note}</p>
            </blockquote>
          )}
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content 1fr', columnGap: 16, rowGap: 10, fontSize: 14 }}>
            <Row label="Address">{p.address}</Row>
            <Row label="List">{p.list}{p.favourite && p.category !== 'favourites' ? ' · Favourite places' : ''}</Row>
            {p.source && <Row label="Recommended by">{p.source}</Row>}
            <Row label="Status">{p.visited ? 'Been' : 'Not yet'}</Row>
            <Row label="Filed in">No. {String(city.ordinal).padStart(2, '0')} · {city.name}</Row>
          </dl>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
            <Button size="lg" iconRight="arrow-up-right" onClick={() => window.open(p.url, '_blank', 'noopener')}>Open in Google Maps</Button>
            <Button size="lg" variant="secondary" icon="bookmark" onClick={onToggleVisited}>{p.visited ? 'Mark not been' : 'Mark as been'}</Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
