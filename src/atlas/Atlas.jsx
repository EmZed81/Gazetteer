import React from 'react';
import maplibregl from 'maplibre-gl';
import { buildArchive, CITIES } from '../data.js';
import { fetchLocked, unlockWithSavedKey, unlockWithPasscode } from '../unlock.js';
import { PasscodeScreen } from '../screens/PasscodeScreen.jsx';
import { Wordmark } from '../components/brand/Wordmark.jsx';
import { lineStyle } from './lineStyle.js';

const COUNTRY = { NYC: 'USA', VIE: 'Austria', AMS: 'Netherlands', ATH: 'Greece', AUH: 'UAE', LON: 'UK', DXB: 'UAE', CPH: 'Denmark' };
const FLY_MS = 4500;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The zoom at which the whole globe exactly fills a circle of `size` px (MapLibre's world is 512px at zoom 0).
const globeZoom = size => Math.log2((size * Math.PI) / 512) + Math.log2(1.2); // 1.2: measured fudge so the sphere meets the circle

function useArchive() {
  const [places, setPlaces] = React.useState(null);
  const [locked, setLocked] = React.useState(null);
  React.useEffect(() => {
    fetchLocked('../data/places.locked.json').then(async file => {
      const p = await unlockWithSavedKey(file);
      if (p) setPlaces(buildArchive(p)); else setLocked(file);
    });
  }, []);
  const tryPasscode = async code => {
    const p = await unlockWithPasscode(locked, code);
    if (p) { setPlaces(buildArchive(p)); setLocked(null); }
    return !!p;
  };
  return { places, locked, tryPasscode };
}

/** Box title like the sketch: small caps label in a ruled box. */
const BoxTitle = ({ children, align = 'left' }) => (
  <div style={{ display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
    <span className="gz-kicker" style={{ border: '1.5px solid var(--ink-1)', padding: '6px 12px', fontSize: 13 }}>{children}</span>
  </div>
);

function Globe({ size, city, bounds }) {
  const box = React.useRef(null);
  const map = React.useRef(null);
  const pin = React.useRef(null);
  const spinning = React.useRef(true);

  React.useEffect(() => {
    const m = new maplibregl.Map({
      container: box.current, style: lineStyle(), center: [Math.random() * 360 - 180, 25], zoom: globeZoom(size),
      attributionControl: false, dragRotate: false, pitchWithRotate: false, renderWorldCopies: false,
    });
    map.current = m;
    // Idle: the globe turns slowly until you pick a destination.
    let raf, last = performance.now();
    const turn = now => {
      if (spinning.current && !m.isMoving() && !reducedMotion()) {
        const c = m.getCenter();
        m.jumpTo({ center: [c.lng + (now - last) * 0.004, c.lat] });
      }
      last = now; raf = requestAnimationFrame(turn);
    };
    raf = requestAnimationFrame(turn);
    m.on('mousedown', () => { spinning.current = false; });
    // The red pin marks the destination.
    const el = document.createElement('div');
    el.style.cssText = 'width:16px;height:16px;border-radius:50%;background:var(--red-pencil);border:2px solid var(--paper-0);box-shadow:var(--shadow-marker)';
    pin.current = new maplibregl.Marker({ element: el });
    return () => { cancelAnimationFrame(raf); m.remove(); };
  }, []);

  React.useEffect(() => {
    const m = map.current;
    if (!m) return;
    if (!city) {
      pin.current.remove();
      spinning.current = true;
      m.flyTo({ zoom: globeZoom(size), duration: reducedMotion() ? 0 : 2500, essential: true });
      return;
    }
    spinning.current = false;
    const cam = m.cameraForBounds(bounds, { padding: size * 0.12, maxZoom: 14 });
    pin.current.setLngLat(cam.center).addTo(m);
    m.flyTo({ center: cam.center, zoom: cam.zoom, duration: reducedMotion() ? 0 : FLY_MS, curve: 1.8, essential: true });
  }, [city && city.code]);

  return (
    <div ref={box} style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative',
      boxShadow: '0 0 0 1.5px var(--ink-1)', background: 'var(--paper-0)' }} />
  );
}

function CitySelector({ selected, onSelect }) {
  return (
    <nav aria-label="Destinations" style={{ borderTop: '1.5px solid var(--ink-1)', position: 'relative', paddingTop: 18, display: 'flex', justifyContent: 'center' }}>
      {/* the bracket ends from the sketch */}
      <span style={{ position: 'absolute', left: 0, top: -1.5, width: 1.5, height: 16, background: 'var(--ink-1)' }} />
      <span style={{ position: 'absolute', right: 0, top: -1.5, width: 1.5, height: 16, background: 'var(--ink-1)' }} />
      {CITIES.map((c, i) => {
        const on = selected === c.code;
        return (
          <React.Fragment key={c.code}>
            {i > 0 && <span aria-hidden="true" style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 22, padding: '0 14px' }}>|</span>}
            <button onClick={() => onSelect(on ? null : c.code)} aria-pressed={on} title={c.name}
              style={{ border: 0, background: 'none', cursor: 'pointer', padding: '4px 2px', fontFamily: 'var(--font-mono)', fontSize: 22, letterSpacing: '.06em',
                color: on ? 'var(--ink-1)' : 'var(--ink-2)', opacity: selected && !on ? 0.3 : 1,
                borderBottom: `2px solid ${on ? 'var(--red-pencil)' : 'transparent'}`, transition: 'opacity 320ms var(--ease-out)' }}>
              {c.code}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function Atlas() {
  const { places, locked, tryPasscode } = useArchive();
  const [code, setCode] = React.useState(null);
  const [vh, setVh] = React.useState(window.innerHeight);
  React.useEffect(() => { const r = () => setVh(window.innerHeight); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r); }, []);

  if (locked) return <div style={{ maxWidth: 480, margin: '0 auto' }}><PasscodeScreen onSubmit={tryPasscode} /></div>;
  if (!places) return null;

  const city = CITIES.find(c => c.code === code);
  const mine = city ? places.filter(p => p.cityCode === city.code && p.lat != null) : [];
  const bounds = mine.length ? mine.reduce((b, p) => b.extend([p.lng, p.lat]), new maplibregl.LngLatBounds()) : null;
  const globeSize = Math.max(360, Math.min(vh - 300, 680));

  return (
    <div style={{ height: '100%', boxSizing: 'border-box', padding: '32px 56px 18px', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 20 }}>
      <header style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'start' }}>
        <BoxTitle>Places</BoxTitle>
        <div style={{ textAlign: 'center' }}>
          <Wordmark size={30} />
          <div className="gz-kicker" style={{ color: 'var(--ink-3)', marginTop: 6 }}>The Atlas</div>
        </div>
        <BoxTitle align="right">Categories</BoxTitle>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 320px) 1fr minmax(220px, 320px)', alignItems: 'center', minHeight: 0 }}>
        <aside style={{ alignSelf: 'start', color: 'var(--ink-3)', fontSize: 15 }}>{!city && 'Pick a destination below.'}</aside>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <Globe size={globeSize} city={city} bounds={bounds} />
          <h1 style={{ margin: 0, minHeight: 44, fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: 38, letterSpacing: '.08em', textTransform: 'uppercase', textAlign: 'center' }}>
            {city && <span key={city.code} style={{ animation: 'gzFadeUp 600ms var(--ease-out) 1200ms both' }}>{city.name}, <span style={{ color: 'var(--ink-3)' }}>{COUNTRY[city.code]}</span></span>}
          </h1>
        </div>
        <aside />
      </main>

      <div>
        <CitySelector selected={code} onSelect={setCode} />
        {/* Map credit (required by the map data's licence), kept outside the globe */}
        <p className="gz-mono" style={{ margin: '14px 0 0', textAlign: 'right', fontSize: 10, color: 'var(--ink-3)' }}>
          Map data © <a href="https://openfreemap.org">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/">OpenMapTiles</a> · <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>
        </p>
      </div>
    </div>
  );
}
