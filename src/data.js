// Loads the place list and works out every count from it (nothing is hard-coded).
import { CATEGORY_KEYS } from './components/icons/CategoryIcon.jsx';
import { displayName } from './names.js';

// The destinations, in Index order. Add a line here to add a destination.
export const CITIES = [
  { code: 'NYC', name: 'New York' },
  { code: 'VIE', name: 'Vienna' },
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'ATH', name: 'Athens' },
  { code: 'AUH', name: 'Abu Dhabi' },
  { code: 'LON', name: 'London' },
  { code: 'DXB', name: 'Dubai' },
  { code: 'CPH', name: 'Copenhagen' },
].map((c, i) => ({ ...c, ordinal: i + 1 }));

const cityByCode = Object.fromEntries(CITIES.map(c => [c.code, c]));

// Is this place shown under the given category chip? Favourites also include
// places that are in a city list *and* in "Favourite places".
export const inCategory = (p, k) => p.category === k || (k === 'favourites' && p.favourite);

// Addresses copied from Google Maps end with the country; on a city page that's just noise.
const COUNTRY_SUFFIX = /,\s*(United States|Netherlands|Greece|United Kingdom|UK|United Arab Emirates|Denmark|Austria)\s*$/;
const tidyAddress = a => (a || '').replace(COUNTRY_SUFFIX, '').replace(/\s+-\s+United Arab Emirates$/, '');

export function buildArchive(raw) {
  return raw.map(p => ({ ...p, ...displayName(p.name), address: tidyAddress(p.address), cityCode: p.city, city: cityByCode[p.city]?.name || p.city }));
}

// All the numbers in the app. They count places still to go: marking a place as been takes it out of
// its category's count and into the destination's "been" count.
export function summarise(places, visited) {
  const countries = CITIES.map(c => {
    const mine = places.filter(p => p.cityCode === c.code);
    const toGo = mine.filter(p => !visited.has(p.id));
    const breakdown = {};
    for (const p of toGo) breakdown[p.category] = (breakdown[p.category] || 0) + 1;
    const counts = Object.fromEntries(CATEGORY_KEYS.map(k => [k, toGo.filter(p => inCategory(p, k)).length]));
    counts.been = mine.length - toGo.length;
    return { ...c, total: mine.length, count: toGo.length, been: counts.been, breakdown, counts };
  });
  const toGo = countries.reduce((n, c) => n + c.count, 0);
  return { places, countries, total: places.length, toGo, been: places.length - toGo, countryTotal: countries.length };
}
