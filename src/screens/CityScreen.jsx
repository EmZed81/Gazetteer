import React from 'react';
import { CountryHeader } from '../components/country/CountryHeader.jsx';
import { FilterBar } from '../components/filters/FilterBar.jsx';
import { PlaceCard } from '../components/places/PlaceCard.jsx';
import { MapView } from '../components/map/MapView.jsx';
import { EmptyState } from '../components/feedback/EmptyState.jsx';
import { Button } from '../components/controls/Button.jsx';
import { CATEGORY_KEYS, CATEGORIES } from '../components/icons/CategoryIcon.jsx';
import { inCategory } from '../data.js';
import { load, save } from '../storage.js';
import { Masonry } from '../components/places/Masonry.jsx';

const MASTHEAD_H = 73; // the filter bar sticks just below the masthead

// Search looks through the name, neighbourhood, your note, the list and the recommender.
const matches = (p, q) => [p.name, p.area, p.address, p.note, p.list, p.source].join(' ').toLowerCase().includes(q);

/** One destination: header, sticky filters, then list / grid / map. */
export function CityScreen({ city, places, onBack, onOpenPlace, selectedId }) {
  const remembered = load('view-' + city.code, {});
  const [q, setQ] = React.useState(remembered.q || '');
  const [cats, setCats] = React.useState(remembered.cats || []);
  const [view, setView] = React.useState(remembered.view || 'list');
  React.useEffect(() => { save('view-' + city.code, { q, cats, view }); }, [q, cats, view]);

  const ql = q.trim().toLowerCase();
  // Chips: categories pick places still to go; "Been" picks places you've been to. Ignore chips that have emptied.
  const active = cats.filter(k => city.counts[k] > 0);
  const picked = p => !active.length || (p.visited ? active.includes('been') : active.some(k => k !== 'been' && inCategory(p, k)));
  const found = places.filter(p => picked(p) && (!ql || matches(p, ql)));
  const shown = [...found.filter(p => !p.visited), ...found.filter(p => p.visited)]; // been places go last
  const groups = [...CATEGORY_KEYS, 'other'].map(k => ({ k, title: CATEGORIES[k].plural, items: shown.filter(p => !p.visited && p.category === k) }));
  groups.push({ k: 'been', title: 'Been', items: shown.filter(p => p.visited) });
  const reset = () => { setQ(''); setCats([]); };

  const tiles = shown.map((p, i) => <PlaceCard key={p.id} variant="tile" index={i + 1} {...p} city={city.name} selected={p.id === selectedId} onClick={() => onOpenPlace(p.id)} />);
  let body;
  if (places.length === 0) body = <EmptyState kind="country" />;
  else if (!shown.length) body = <EmptyState kind={ql ? 'search' : 'filter'} query={ql ? q : undefined} actionLabel={ql ? 'Clear search' : 'Reset filters'} onAction={reset} />;
  else if (view === 'grid') body = (
    <Masonry style={{ paddingTop: 20 }}>{tiles}</Masonry>
  );
  else if (view === 'map') body = (
    <div style={{ marginTop: 20 }}>
      <MapView places={shown} selectedId={selectedId} onSelect={onOpenPlace} height={360} caption={`${city.name} · ${shown.length} places`} />
      <div style={{ borderLeft: '1px solid var(--ink-1)', borderRight: '1px solid var(--ink-1)', borderBottom: '1px solid var(--ink-1)', background: 'var(--surface-page)' }}>
        {shown.map(p => <PlaceCard key={p.id} variant="compact" {...p} selected={p.id === selectedId} onClick={() => onOpenPlace(p.id)} />)}
      </div>
    </div>
  );
  else body = groups.filter(g => g.items.length).map(g => (
    <section key={g.k} style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid var(--ink-1)', paddingBottom: 6 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-.01em' }}>{g.title}</h2>
        <span className="gz-mono" style={{ fontSize: 12, color: 'var(--text-meta)' }}>{g.items.length}</span>
      </div>
      {g.items.map(p => <PlaceCard key={p.id} {...p} selected={p.id === selectedId} onClick={() => onOpenPlace(p.id)} />)}
    </section>
  ));

  return (
    <div style={{ padding: '16px 16px 80px', boxSizing: 'border-box' }}>
      <Button variant="ghost" size="sm" icon="arrow-left" onClick={onBack} style={{ marginBottom: 16, marginLeft: -4 }}>The Index</Button>
      <CountryHeader name={city.name} code={city.code} ordinal={city.ordinal} breakdown={city.breakdown}
        countLabel={city.been ? `${city.count} to go · ${city.been} been` : `${city.count} places`} />
      {places.length > 0 && (
        <div style={{ position: 'sticky', top: MASTHEAD_H, zIndex: 10, background: 'var(--surface-page)', paddingTop: 16, paddingBottom: 12, marginTop: 8, borderBottom: '1px solid var(--rule-soft)' }}>
          <FilterBar query={q} onQueryChange={setQ} placeholder={`Search ${city.total} places in ${city.name}`} counts={city.counts} selected={active}
            onToggleCategory={k => setCats(x => x.includes(k) ? x.filter(y => y !== k) : [...x, k])} onClear={() => setCats([])}
            view={view} onViewChange={setView} resultCount={shown.length} compact />
        </div>
      )}
      {body}
    </div>
  );
}
