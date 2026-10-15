// Display rules for place names. The original name is kept for search and Google Maps;
// these only change how a name is typeset on cards and sheets.
//
//  1. Tidy spacing: no double spaces, no space inside brackets "( Fresh" -> "(Fresh", none before commas.
//  2. Company suffixes go: "Cafe Villa 515 LLC" -> "Cafe Villa 515".
//  3. A branch after " - ", " – " or " | " moves to its own small line:
//     "Arabian Tea House - Jumeirah Archaeological Site, Dubai" -> "Arabian Tea House" + "Jumeirah Archaeological Site".
//  4. ALL-CAPS Latin names are calmed to Title Case ("OF THE EARTH" -> "Of the Earth"); short caps brands (OBA, SURT) stay.
//  5. Separators never start a line: a no-break space glues "|", "–", "-", "·", "/" to the word before.
//  6. Straight apostrophes become typographic ones (Hartog’s).

const NBSP = ' ';
const CITY_NAMES = ['New York', 'Vienna', 'Wien', 'Amsterdam', 'Athens', 'Abu Dhabi', 'London', 'Dubai', 'Copenhagen'];
const SMALL_WORDS = new Set(['of', 'the', 'and', 'a', 'an', 'in', 'on', 'at', 'by', 'for', 'with', 'de', 'la', 'le', 'di', 'e', 'y', 'van', 'met']);

const tidy = s => s
  .replace(/[​-‏‪-‮⁦-⁩]/g, '') // invisible direction marks copied from Google Maps
  .replace(/\s+/g, ' ')
  .replace(/\(\s+/g, '(').replace(/\s+\)/g, ')')
  .replace(/\s+,/g, ',')
  .replace(/(\p{L})'/gu, '$1’') // typographic apostrophe: Hartog's -> Hartog’s
  .trim();

const dropSuffix = s => {
  let prev;
  do { prev = s; s = s.replace(/[\s,]+(L\.?L\.?C\.?|Ltd\.?|Limited|S\.A\.S\.?|S\.A\.?|GmbH|Inc\.?|B\.V\.?|E C\.)$/i, '').trim(); } while (s !== prev);
  return s;
};

const isShouting = s => {
  const letters = s.replace(/[^A-Za-z]/g, '');
  return letters.length > 4 && letters === letters.toUpperCase() && /[A-Z]{5,}/.test(s);
};

const titleCase = s => s.toLowerCase().split(' ').map((w, i) =>
  i > 0 && SMALL_WORDS.has(w) ? w : w.replace(/^([("'“]*)(\p{L})/u, (_, pre, ch) => pre + ch.toUpperCase())
).join(' ');

const glueSeparators = s => s.replace(/ ([|–\-·/]) /g, `${NBSP}$1 `);

export function displayName(name) {
  let title = dropSuffix(tidy(name || ''));
  let branch = '';
  const m = title.match(/^(.+?)\s+[-–|]\s+(.+)$/);
  if (m) {
    title = m[1];
    branch = m[2].replace(new RegExp(`,\\s*(${CITY_NAMES.join('|')})$`, 'i'), '');
    if (CITY_NAMES.some(c => c.toLowerCase() === branch.toLowerCase())) branch = ''; // "Stories Lounge - Dubai"
  }
  if (isShouting(title)) title = titleCase(title);
  if (isShouting(branch)) branch = titleCase(branch);
  return { title: glueSeparators(title), branch: glueSeparators(branch) };
}
