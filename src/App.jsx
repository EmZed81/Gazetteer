import React from 'react';
import { buildArchive } from './data.js';
import { fetchLocked, unlockWithSavedKey, unlockWithPasscode } from './unlock.js';
import { PasscodeScreen } from './screens/PasscodeScreen.jsx';
import { load, save } from './storage.js';
import { Masthead } from './screens/Masthead.jsx';
import { IndexScreen } from './screens/IndexScreen.jsx';
import { CityScreen } from './screens/CityScreen.jsx';
import { PlaceSheet } from './screens/PlaceSheet.jsx';

const PUSH_MS = 380, PUSH_EASE = 'cubic-bezier(.32,.72,0,1)';
const THEME_COLOR = { day: '#F2EBDC', night: '#1A1814' }; // --paper-1 in each edition (phone status bar)
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Addresses live after the # so the Android back gesture works and any page can be reopened:
//   #/          The Index
//   #/nyc       a destination
//   #/nyc/<id>  a destination with a place sheet open
function readHash() {
  const [, code = '', id = ''] = window.location.hash.replace(/^#/, '').split('/');
  return { code: code.toUpperCase(), placeId: id ? decodeURIComponent(id) : null };
}
const hashFor = (code, placeId) => '#/' + (code ? code.toLowerCase() + (placeId ? '/' + encodeURIComponent(placeId) : '') : '');

export function App() {
  const [archive, setArchive] = React.useState(null);
  const [locked, setLocked] = React.useState(null); // the scrambled file, while we wait for the passcode
  const [error, setError] = React.useState(null);
  const [loc, setLoc] = React.useState(readHash);
  const [theme, setTheme] = React.useState(() => load('theme', 'day'));
  const [visited, setVisited] = React.useState(() => new Set(load('visited', [])));
  const [trans, setTrans] = React.useState(null);
  const intro = React.useRef(true);       // the Index roll-in plays once per app load
  const pushed = React.useRef(0);         // how many entries we added to history, so "back" can pop them
  const scroller = React.useRef(null);
  const prevCode = React.useRef(loc.code);

  React.useEffect(() => {
    fetchLocked().then(async file => {
      const places = await unlockWithSavedKey(file);
      if (places) setArchive(buildArchive(places)); else setLocked(file);
    }).catch(e => setError(e.message));
  }, []);
  const tryPasscode = async code => {
    const places = await unlockWithPasscode(locked, code);
    if (places) { setArchive(buildArchive(places)); setLocked(null); }
    return !!places;
  };

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme === 'night' ? 'night' : '';
    document.querySelector('meta[name="theme-color"]').content = THEME_COLOR[theme];
    save('theme', theme);
  }, [theme]);

  React.useEffect(() => {
    const onHash = () => setLoc(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Slide between the Index and a destination whenever the destination part of the address changes.
  React.useLayoutEffect(() => {
    const from = prevCode.current;
    prevCode.current = loc.code;
    if (from === loc.code) return;
    if (loc.code) intro.current = false;
    const offset = scroller.current ? scroller.current.scrollTop : 0;
    if (reducedMotion()) { if (scroller.current) scroller.current.scrollTop = 0; return; }
    setTrans({ from, dir: loc.code ? 'fwd' : 'back', offset, id: Date.now() });
  }, [loc.code]);

  React.useLayoutEffect(() => {
    if (!trans) return;
    if (scroller.current) scroller.current.scrollTop = 0;
    const t = setTimeout(() => setTrans(null), PUSH_MS + 20);
    return () => clearTimeout(t);
  }, [trans && trans.id]);

  const navigate = (code, placeId) => { pushed.current += 1; window.location.hash = hashFor(code, placeId); };
  // Go "up" a level: pop our own history entry if there is one (same as the back gesture), else replace.
  const goUp = (code, placeId) => {
    if (pushed.current > 0) { pushed.current -= 1; window.history.back(); }
    else window.location.replace(hashFor(code, placeId));
  };

  const toggleVisited = id => setVisited(v => {
    const next = new Set(v);
    next.has(id) ? next.delete(id) : next.add(id);
    save('visited', [...next]);
    return next;
  });

  if (error) return <p style={{ padding: 16 }}>{error}</p>;
  if (locked) return <PasscodeScreen onSubmit={tryPasscode} />;
  if (!archive) return null;

  const city = archive.countries.find(c => c.code === loc.code);
  const code = city ? city.code : '';
  const place = loc.placeId && archive.places.find(p => p.id === loc.placeId && p.cityCode === code);
  const withVisited = p => ({ ...p, visited: visited.has(p.id) });

  const screen = (c, live) => c
    ? <CityScreen key={c} city={archive.countries.find(x => x.code === c)} places={archive.places.filter(p => p.cityCode === c).map(withVisited)}
        selectedId={live && place ? place.id : null} onBack={() => goUp('')} onOpenPlace={id => navigate(c, id)} />
    : <IndexScreen archive={archive} visited={visited} animateIn={live && intro.current && !reducedMotion()} onOpenCity={c2 => navigate(c2)} onOpenPlace={(c2, id) => navigate(c2, id)} />;

  const layers = trans ? [{ c: trans.from, out: true }, { c: code }] : [{ c: code }];
  const layerStyle = out => {
    if (!trans) return { position: 'relative' };
    const fwd = trans.dir === 'fwd', top = out ? !fwd : fwd;
    const anim = out ? (fwd ? 'gzPushUnder' : 'gzPopOut') : (fwd ? 'gzPushIn' : 'gzPopUnder');
    return {
      position: out ? 'absolute' : 'relative', left: 0, right: 0, top: out ? -trans.offset : undefined,
      zIndex: top ? 2 : 1, pointerEvents: out ? 'none' : undefined, background: 'var(--surface-page)',
      boxShadow: top ? '-10px 0 28px rgba(0,0,0,.10)' : undefined, minHeight: '100%',
      animation: `${anim} ${PUSH_MS}ms ${PUSH_EASE} both`,
    };
  };

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: 'var(--surface-page)', color: 'var(--text-primary)', fontFamily: 'var(--font-text)' }}>
      <div ref={scroller} data-scroll style={{ height: '100%', overflowY: trans ? 'hidden' : 'auto' }}>
        <Masthead theme={theme} onTheme={() => setTheme(t => t === 'night' ? 'day' : 'night')} onHome={() => code && goUp('')} />
        <div style={{ position: 'relative', clipPath: trans ? 'inset(0 0 -100000px 0)' : undefined }}>
          {layers.map(l => (
            <div key={l.c || 'index'} style={layerStyle(l.out)}>
              {screen(l.c, !l.out)}
              {trans && <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '100%', height: '100vh', background: 'var(--surface-page)' }} />}
            </div>
          ))}
        </div>
      </div>
      {place && <PlaceSheet place={withVisited(place)} city={city} onClose={() => goUp(code)} onToggleVisited={() => toggleVisited(place.id)} />}
    </div>
  );
}
