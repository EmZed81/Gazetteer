// A line-drawing map: ink lines on paper, no names, no icons.
// Data: OpenFreeMap (free OpenStreetMap vector tiles, no key). Colours come from the design tokens.

function graticule(step = 15) {
  const lines = [];
  for (let lng = -180; lng <= 180; lng += step) lines.push(Array.from({ length: 37 }, (_, i) => [lng, -90 + i * 5]));
  for (let lat = -75; lat <= 75; lat += step) lines.push(Array.from({ length: 73 }, (_, i) => [-180 + i * 5, lat]));
  return { type: 'Feature', geometry: { type: 'MultiLineString', coordinates: lines } };
}

export function lineStyle() {
  const css = getComputedStyle(document.documentElement);
  const v = n => css.getPropertyValue(n).trim();
  const paper = v('--paper-0'), land = v('--paper-1'), ink = v('--ink-1'), soft = v('--ink-3'), faint = v('--paper-3');
  return {
    version: 8,
    projection: { type: 'globe' },
    sources: {
      osm: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
      grid: { type: 'geojson', data: graticule() },
    },
    layers: [
      { id: 'land', type: 'background', paint: { 'background-color': land } },
      // Sea: lighter paper, so the globe reads as a drawn sphere; coastline is its ink edge.
      { id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water', paint: { 'fill-color': paper } },
      { id: 'coast', type: 'line', source: 'osm', 'source-layer': 'water',
        paint: { 'line-color': ink, 'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.6, 8, 0.9, 14, 1.2] } },
      { id: 'grid', type: 'line', source: 'grid', maxzoom: 6, paint: { 'line-color': faint, 'line-width': 0.6 } },
      { id: 'borders', type: 'line', source: 'osm', 'source-layer': 'boundary', filter: ['==', ['get', 'admin_level'], 2],
        paint: { 'line-color': soft, 'line-width': 0.6, 'line-dasharray': [3, 2] } },
      { id: 'rivers', type: 'line', source: 'osm', 'source-layer': 'waterway', minzoom: 9, paint: { 'line-color': ink, 'line-width': 0.7 } },
      { id: 'parks', type: 'line', source: 'osm', 'source-layer': 'park', minzoom: 11, paint: { 'line-color': soft, 'line-width': 0.5, 'line-dasharray': [1, 2] } },
      // Streets: major roads first, then smaller ones as you zoom in. Thin ink, no names.
      { id: 'roads-minor', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 13,
        filter: ['in', ['get', 'class'], ['literal', ['minor', 'service']]],
        paint: { 'line-color': soft, 'line-width': 0.4, 'line-opacity': 0.7 } },
      { id: 'roads', type: 'line', source: 'osm', 'source-layer': 'transportation', minzoom: 9,
        filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary']]],
        paint: { 'line-color': ink, 'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.3, 12, 0.7, 15, 1.4], 'line-opacity': 0.75 } },
    ],
  };
}
