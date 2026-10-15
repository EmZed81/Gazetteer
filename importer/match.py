"""Pick the best OpenStreetMap match for every saved place from the cached lookups."""
import csv, json, math, os, re, sys, unicodedata, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
CSV_DIR, CACHE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
cache = json.load(open(CACHE))
CENTRE = {"NYC": (40.7128, -74.0060, 35), "AMS": (52.3676, 4.9041, 20), "ATH": (37.9838, 23.7275, 30),
          "LON": (51.5074, -0.1278, 35), "DXB": (25.2048, 55.2708, 50), "AUH": (24.4539, 54.3773, 50),
          "CPH": (55.6761, 12.5683, 20), "VIE": (48.2082, 16.3738, 20)}
CITY = {"NYC": "New York", "AMS": "Amsterdam", "ATH": "Athens", "LON": "London",
        "DXB": "Dubai", "AUH": "Abu Dhabi", "CPH": "Copenhagen", "VIE": "Vienna"}
LIST_CITY = {"NYC": "NYC", "NYT": "NYC", "AMS": "AMS", "ATH": "ATH", "LDN": "LON", "DXB": "DXB",
             "Ditch": "DXB", "Abu": "AUH", "CPH": "CPH"}
PREFIX = {"0x89c2": "NYC", "0x47c6": "AMS", "0x47c5": "AMS", "0x14a1": "ATH", "0x4876": "LON",
          "0x4875": "LON", "0x3e5f": "DXB", "0x3ef5": "DXB", "0x3e5e": "AUH", "0x4652": "CPH", "0x476d": "VIE"}
ID = re.compile(r"!1s(0x[0-9a-f]+:0x[0-9a-f]+)")
STOP = {"the", "and", "cafe", "café", "restaurant", "bakery", "&", "de", "of", "by", "co"}

def km(a, b, c, d):
    p = math.pi / 180
    h = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))

def city_of(lat, lng):
    best = min(CENTRE, key=lambda k: km(lat, lng, *CENTRE[k][:2]))
    return best if km(lat, lng, *CENTRE[best][:2]) <= CENTRE[best][2] else None

def toks(s):
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    return [t for t in re.findall(r"\w+", s) if t not in STOP] or re.findall(r"\w+", s)

def sim(a, b):
    A, B = set(toks(a)), set(toks(b))
    return len(A & B) / min(len(A), len(B)) if A and B else 0

def results_for(title):
    out = []
    for url, res in cache.items():
        q = urllib.parse.parse_qs(urllib.parse.urlparse(url).query).get("q", [""])[0]
        if q == title or q.startswith(title + ", ") or (title and q and q.split(", ")[0] in title and len(q.split(", ")[0]) > 3):
            out += res
    return out

def addr(a, display):
    road = " ".join(x for x in [a.get("house_number"), a.get("road") or a.get("pedestrian")] if x)
    town = a.get("city") or a.get("town") or a.get("village") or a.get("municipality") or ""
    parts = [p for p in [road, " ".join(x for x in [a.get("postcode"), town] if x)] if p]
    return ", ".join(parts) or display
def area(a):
    return a.get("suburb") or a.get("neighbourhood") or a.get("city_district") or a.get("quarter") or ""

places = []
for f in sorted(os.listdir(CSV_DIR)):
    if not f.endswith(".csv"): continue
    lst = f[:-4]
    for r in csv.DictReader(open(os.path.join(CSV_DIR, f), encoding="utf-8-sig")):
        title, url = r["Title"].strip(), r["URL"].strip()
        if not (title or url): continue
        m = ID.search(url)
        lc = LIST_CITY.get(lst.split()[0])
        rec = {"list": lst, "name": title, "url": url, "note": r["Note"].strip() or r["Comment"].strip(),
               "id": m.group(1) if m else None, "listCity": lc}
        if not m:
            c = re.search(r"/search/(-?[\d.]+),(-?[\d.]+)", url)
            if c:
                lat, lng = map(float, c.groups())
                rev = next((v for k, v in cache.items() if "reverse" in k and f"lat={c.group(1)}" in k), {})
                rec.update(id="pin:" + c.group(1) + "," + c.group(2), lat=lat, lng=lng, foundCity=city_of(lat, lng),
                           address=addr(rev.get("address", {}), rev.get("display_name", "")), area=area(rev.get("address", {})), score=1)
            places.append(rec); continue
        rec["hintCity"] = PREFIX.get(m.group(1)[:6])
        expect = {c for c in (lc, rec["hintCity"]) if c}
        best = None
        for x in results_for(title):
            lat, lng = float(x["lat"]), float(x["lon"])
            s = sim(title, x.get("name") or x.get("display_name", ""))
            fc = city_of(lat, lng)
            if fc not in expect: continue
            rank = (s >= 0.5, fc == lc and fc is not None, fc is not None, x.get("category") in ("amenity", "shop", "tourism", "leisure", "craft"), s)
            if best is None or rank > best[0]: best = (rank, x, fc, s)
        if best and best[3] >= 0.5:
            _, x, fc, s = best
            rec.update(lat=float(x["lat"]), lng=float(x["lon"]), foundCity=fc, osmName=x.get("name"),
                       address=addr(x.get("address", {}), x.get("display_name", "")), area=area(x.get("address", {})), score=round(s, 2))
        places.append(rec)
json.dump(places, open(OUT, "w"), ensure_ascii=False, indent=1)

found = [p for p in places if "lat" in p]
print("rows", len(places), "found", len(found), "not found", len(places) - len(found))
for p in places:
    hc = p.get("hintCity") or p.get("foundCity")
    if p["listCity"] and hc != p["listCity"]:
        print("WRONG CITY?", p["list"], "|", p["name"], "| Google code says:", hc or "outside the 8 cities", "| OSM:", p.get("foundCity"), p.get("address"))
fav = [p for p in places if not p["listCity"]]
print("favourites", len(fav), "in 8 cities", sum(1 for p in fav if p.get("hintCity") or p.get("foundCity")))
import collections
print("not found by list:", collections.Counter(p["list"] for p in places if "lat" not in p and (p["listCity"] or p.get("hintCity"))))
