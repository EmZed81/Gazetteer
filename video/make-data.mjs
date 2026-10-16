// Turns your place list into the counts the video needs (per city, per category).
// Usage: node make-data.mjs ../private/places.json  ->  writes src/data.json (git-ignored)
import { readFileSync, writeFileSync } from 'node:fs';
const NAMES = { NYC: 'New York', VIE: 'Vienna', AMS: 'Amsterdam', ATH: 'Athens', AUH: 'Abu Dhabi', LON: 'London', DXB: 'Dubai', CPH: 'Copenhagen' };
const places = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const cities = Object.entries(NAMES).map(([code, name]) => {
  const mine = places.filter(p => p.city === code);
  const breakdown = {};
  for (const p of mine) breakdown[p.category] = (breakdown[p.category] || 0) + 1;
  return { code, name, total: mine.length, breakdown };
}).sort((a, b) => b.total - a.total);
const byCategory = {};
for (const p of places) byCategory[p.category] = (byCategory[p.category] || 0) + 1;
writeFileSync(new URL('./src/data.json', import.meta.url), JSON.stringify({ total: places.length, cities, byCategory }, null, 1));
console.log('wrote src/data.json:', places.length, 'places,', cities.length, 'cities');
