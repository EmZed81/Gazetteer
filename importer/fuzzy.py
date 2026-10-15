"""Second pass: fuzzy-match places that Nominatim missed against the per-city OpenStreetMap downloads."""
import json, os, re, sys, unicodedata
from difflib import SequenceMatcher
MATCHED, OSM, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
places = json.load(open(MATCHED))
GREEK = dict(zip("αβγδεζηθικλμνξοπρσςτυφχψω", ["a","v","g","d","e","z","i","th","i","k","l","m","n","x","o","p","r","s","s","t","y","f","ch","ps","o"]))
STOP = {"the", "and", "cafe", "coffee", "restaurant", "restaurants", "bakery", "bar", "de", "of", "by", "co", "deli", "kitchen",
        "dubai", "abu", "dhabi", "athens", "amsterdam", "london", "nyc", "new", "york", "copenhagen", "vienna", "specialty", "eatery"}

def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = "".join(GREEK.get(ch, ch) for ch in s).replace("&", " and ")
    return re.findall(r"[a-z0-9؀-ۿ]+", s)

def core(s):
    s = re.sub(r"\(.*?\)", " ", s); s = re.split(r"\s[-–|/]\s", s)[0]
    t = [w for w in norm(s) if w not in STOP]
    return t or norm(s)

def score(title, name):
    a, b = core(title), core(name)
    if not a or not b: return 0
    A, B = set(a), set(b)
    common = len(A & B)
    seq = SequenceMatcher(None, " ".join(a), " ".join(b)).ratio()
    if common:
        saved_cov, osm_cov = common / len(A), common / len(B)   # how much of each name the other covers
        if saved_cov == 1 and osm_cov >= (0.67 if len(A) == 1 else 0.5): return max(0.9, seq)
        if osm_cov == 1 and saved_cov >= 0.6: return max(0.9, seq)
    return seq if seq >= 0.9 else 0

osm = {}
for f in os.listdir(OSM):
    els = json.load(open(os.path.join(OSM, f)))["elements"]
    cands = []
    for e in els:
        t = e.get("tags", {}); c = e.get("center") or e
        if "lat" not in c: continue
        names = {t[k] for k in ("name", "name:en", "alt_name", "official_name", "brand", "name:el", "short_name", "old_name") if k in t}
        cands.append((names, c["lat"], c["lon"], t))
    osm[f[:-5]] = cands

def addr(t):
    road = " ".join(x for x in [t.get("addr:housenumber"), t.get("addr:street")] if x)
    town = " ".join(x for x in [t.get("addr:postcode"), t.get("addr:city")] if x)
    return ", ".join(x for x in [road, town] if x)

newly = 0
for p in places:
    if "lat" in p: continue
    city = p.get("hintCity") or p.get("listCity")
    if not p["listCity"] and not p.get("hintCity"): continue   # favourites outside the 8 cities
    if city not in osm: continue
    best = []
    for names, lat, lng, t in osm[city]:
        s = max(score(p["name"], n) for n in names)
        if s >= 0.8: best.append((s, lat, lng, t))
    if not best: continue
    best.sort(key=lambda x: -x[0])
    top = [b for b in best if b[0] >= best[0][0] - 0.02]
    if len(top) > 1:   # several branches: use the branch words ("De Pijp") to choose, else flag
        extra = set(norm(p["name"])) - set(core(p["name"]))
        pick = [b for b in top if extra & set(norm(" ".join(b[3].get(k, "") for k in ("name", "addr:street", "addr:suburb", "branch"))))]
        if len(pick) == 1: top = pick
        else:
            p["ambiguous"] = len(top); continue
    s, lat, lng, t = top[0]
    p.update(lat=lat, lng=lng, foundCity=city, osmName=t.get("name"), address=addr(t), area=t.get("addr:suburb", ""),
             score=round(s, 2), via="overpass"); newly += 1
json.dump(places, open(OUT, "w"), ensure_ascii=False, indent=1)
inscope = [p for p in places if p["listCity"] or p.get("hintCity")]
print("newly found", newly, "| in-scope", len(inscope), "found", sum("lat" in p for p in inscope),
      "ambiguous", sum(1 for p in inscope if p.get("ambiguous") and "lat" not in p))
for p in places:
    if p.get("via") == "overpass" and p["score"] < 0.9: print("  check:", p["name"], "->", p["osmName"], p["score"])
