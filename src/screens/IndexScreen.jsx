import React from 'react';
import { PlaceCard } from '../components/places/PlaceCard.jsx';

// Today's handful of places you haven't been to: a shuffle that stays the same all day, then changes.
function todaysPicks(places, n) {
  let seed = [...new Date().toDateString()].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const pool = [...places];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n);
}

// First-load intro: each row rolls forward off the top face of a long cube, like a departures-board flap.
const ROLL = { duration: 700, firstDelay: 250, stagger: 120, ease: 'cubic-bezier(.25,1.35,.5,1)' };

function ContentsRow({ c, onOpen, rollIndex }) {
  const [pressed, setPressed] = React.useState(false);
  const empty = c.count === 0;
  return (
    <button onClick={() => onOpen(c.code)}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
      style={{
        display: 'grid', gridTemplateColumns: '44px minmax(0,1fr) auto', alignItems: 'center', columnGap: 12,
        width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid var(--rule-soft)', padding: '24px 0',
        background: pressed ? 'var(--paper-2)' : 'transparent', color: 'var(--ink-1)', cursor: 'pointer', fontFamily: 'var(--font-text)',
        transition: 'background var(--dur-fast) var(--ease-out)',
        ...(rollIndex != null ? { transformOrigin: '50% 50% -30px', backfaceVisibility: 'hidden', animation: `gzRoll ${ROLL.duration}ms ${ROLL.ease} ${ROLL.firstDelay + rollIndex * ROLL.stagger}ms both` } : {}),
      }}>
      <span className="gz-display" style={{ fontFamily: 'var(--font-title)', fontWeight: 400, lineHeight: '10px', fontSize: 30, color: pressed ? 'var(--red-pencil)' : 'var(--ink-1)', paddingLeft: 4 }}>{String(c.ordinal).padStart(2, '0')}</span>
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2, paddingLeft: 16 }}>
        <span className="gz-display" style={{ fontFamily: 'var(--font-title)', fontWeight: 400, lineHeight: '10px', fontSize: 28, color: empty ? 'var(--text-meta)' : 'var(--ink-1)' }}>{c.name}</span>
        {empty && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Nothing yet</span>}
      </span>
      <span className="gz-mono" style={{ fontSize: 13, textAlign: 'right', paddingRight: 8, color: empty ? 'var(--text-meta)' : 'var(--ink-1)' }}>{c.count}</span>
    </button>
  );
}

/** The Index: a magazine contents page listing every destination with live counts. */
export function IndexScreen({ archive, visited, onOpenCity, onOpenPlace, animateIn }) {
  const [roll] = React.useState(() => !!animateIn);
  const notYet = archive.places.filter(p => !visited.has(p.id));
  const picks = React.useMemo(() => todaysPicks(notYet, 5), [notYet.length]);
  return (
    <div style={{ padding: '24px 16px 48px', boxSizing: 'border-box' }}>
      <div style={{ borderTop: '4px solid var(--ink-1)', paddingTop: 14, display: 'flex', justifyContent: 'space-between' }} className="gz-kicker">
        <span>The Index</span>
        <span className="gz-mono" style={{ letterSpacing: 0, fontWeight: 400, textTransform: 'none', color: 'var(--text-meta)' }}>{archive.total} places · {archive.countryTotal} destinations</span>
      </div>
      <h1 className="gz-display" style={{ margin: '16px 0 28px', fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: 38, lineHeight: 1.1 }}>
        <span style={{ whiteSpace: 'nowrap', fontSize: 41, lineHeight: '62px' }}>So many saves,</span><br />
        <em style={{ color: 'var(--red-pencil)', fontStyle: 'normal', whiteSpace: 'nowrap', fontSize: 41 }}>so little time.</em>
      </h1>
      <section style={roll ? { perspective: 700 } : undefined}>
        <div className="gz-kicker" style={{ borderBottom: '1px solid var(--ink-1)', paddingBottom: 8, display: 'grid', gridTemplateColumns: '44px 1fr auto', columnGap: 12 }}>
          <span>No.</span><span style={{ paddingLeft: 16 }}>Destinations</span><span style={{ textAlign: 'right', paddingRight: 8 }}>Places</span>
        </div>
        {archive.countries.map((c, i) => <ContentsRow key={c.code} c={c} onOpen={onOpenCity} rollIndex={roll ? i : null} />)}
      </section>
      {picks.length > 0 && (
        <aside style={{ marginTop: 40 }}>
          <div className="gz-kicker" style={{ borderTop: '2px solid var(--ink-1)', paddingTop: 8, marginBottom: 8 }}>Not yet visited</div>
          <p style={{ margin: '0 0 12px', fontSize: 15, lineHeight: 1.45, color: 'var(--text-secondary)' }}>
            <span className="gz-mono" style={{ color: 'var(--ink-1)' }}>{notYet.length}</span> places saved and not yet visited. That is not a backlog; it is a plan.
          </p>
          {picks.map(p => <PlaceCard key={p.id} variant="compact" {...p} countryCode={p.cityCode} onClick={() => onOpenPlace(p.cityCode, p.id)} />)}
        </aside>
      )}
    </div>
  );
}
