import React from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import { MapMarker } from './MapMarker.jsx';
import { IconButton } from '../controls/Button.jsx';

// Free OpenStreetMap vector map (no account or key). Repainted below with the --map-* colour tokens,
// so your pins are the only colour on the map.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

function tokens() {
  const css = getComputedStyle(document.documentElement);
  const v = n => css.getPropertyValue(n).trim();
  return { land: v('--map-land'), water: v('--map-water'), road: v('--map-road'), label: v('--map-label'), rule: v('--rule-soft') };
}

function paint(map) {
  const t = tokens();
  for (const layer of map.getStyle().layers) {
    const id = layer.id, set = (prop, val) => map.setPaintProperty(id, prop, val);
    if (layer.type === 'background') set('background-color', t.land);
    else if (layer.type === 'fill') set('fill-color', /water/.test(id) ? t.water : /building/.test(id) ? t.rule : t.land);
    else if (layer.type === 'line') {
      if (/water|river|waterway/.test(id)) set('line-color', t.water);
      else if (/boundary|admin/.test(id)) set('line-color', t.rule);
      else set('line-color', t.road);
    } else if (layer.type === 'symbol') {
      if (/poi/.test(id)) map.setLayoutProperty(id, 'visibility', 'none'); // other businesses would compete with your pins
      else { set('text-color', t.label); set('text-halo-color', t.land); }
    }
  }
}

/** Real map with one pin per place. Tap a pin to open the place. */
export function MapView({ places = [], selectedId, onSelect, height = 360, caption, style }) {
  const box = React.useRef(null);
  const mapRef = React.useRef(null);
  const markers = React.useRef([]);
  const pinned = places.filter(p => p.lat != null && p.lng != null);

  const fitAll = (animate = true) => {
    const map = mapRef.current;
    if (!map || !pinned.length) return;
    const b = new maplibregl.LngLatBounds();
    pinned.forEach(p => b.extend([p.lng, p.lat]));
    map.fitBounds(b, { padding: 48, maxZoom: 15, animate });
  };

  React.useEffect(() => {
    const map = new maplibregl.Map({ container: box.current, style: STYLE_URL, attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false });
    map.touchZoomRotate.disableRotation();
    mapRef.current = map;
    map.on('style.load', () => paint(map));
    // Repaint when the day/night edition changes.
    const watch = new MutationObserver(() => map.isStyleLoaded() && paint(map));
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => { watch.disconnect(); markers.current.forEach(m => m.remove()); map.remove(); };
  }, []);

  const key = pinned.map(p => p.id).join('|');
  React.useEffect(() => { fitAll(false); }, [key]);

  React.useEffect(() => {
    markers.current.forEach(m => m.remove());
    markers.current = pinned.map(p => {
      const selected = p.id === selectedId;
      const el = document.createElement('div');
      el.style.zIndex = selected ? 5 : 1;
      const root = createRoot(el);
      root.render(<MapMarker category={p.category} label={p.name} selected={selected} faded={p.visited && !selected} onClick={() => onSelect && onSelect(p.id)} />);
      // The pin's disc sits at the left of the element (its name flag extends right), so centre the disc on the spot.
      const m = new maplibregl.Marker({ element: el, anchor: 'left', offset: [selected ? -21 : -15, 0] }).setLngLat([p.lng, p.lat]).addTo(mapRef.current);
      const remove = m.remove.bind(m);
      m.remove = () => { remove(); setTimeout(() => root.unmount()); return m; };
      return m;
    });
  }, [key, selectedId]);

  return (
    <div style={{ position: 'relative', height, background: 'var(--map-land)', overflow: 'hidden', border: '1px solid var(--ink-1)', ...style }}>
      <div ref={box} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', right: 12, top: 12, display: 'flex', flexDirection: 'column', zIndex: 2 }}>
        <IconButton icon="plus" label="Zoom in" variant="raised" size="lg" onClick={() => mapRef.current.zoomIn()} />
        <IconButton icon="circle-dashed" label="Fit all places" variant="raised" size="lg" onClick={() => fitAll()} style={{ borderTop: 0 }} />
      </div>
      {caption && (
        <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 2, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--map-label)', background: 'var(--paper-0)', padding: '3px 6px' }}>{caption}</div>
      )}
    </div>
  );
}
