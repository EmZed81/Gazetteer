"""Look up every saved place on OpenStreetMap (Nominatim), 1 request/second, cached."""
import csv, json, os, re, sys, time, urllib.parse, urllib.request

CSV_DIR, CACHE = sys.argv[1], sys.argv[2]
EMAIL = os.environ["GAZETTEER_EMAIL"]  # OpenStreetMap asks for a contact address
UA = f"Gazetteer-import/1.0 ({EMAIL})"
CITY = {"NYC": "New York", "AMS": "Amsterdam", "ATH": "Athens", "LON": "London",
        "DXB": "Dubai", "AUH": "Abu Dhabi", "CPH": "Copenhagen", "VIE": "Vienna"}
PREFIX = {"0x89c2": "NYC", "0x47c6": "AMS", "0x47c5": "AMS", "0x14a1": "ATH", "0x4876": "LON",
          "0x4875": "LON", "0x3e5f": "DXB", "0x3ef5": "DXB", "0x3e5e": "AUH", "0x4652": "CPH", "0x476d": "VIE"}
LIST_CITY = {"NYC": "NYC", "NYT": "NYC", "AMS": "AMS", "ATH": "ATH", "LDN": "LON", "DXB": "DXB",
             "Ditch": "DXB", "Abu": "AUH", "CPH": "CPH"}
ID = re.compile(r"!1s(0x[0-9a-f]+:0x[0-9a-f]+)")

cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
last = [0.0]

def get(url):
    if url in cache: return cache[url]
    wait = 1.1 - (time.time() - last[0])
    if wait > 0: time.sleep(wait)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r: data = json.load(r)
            break
        except Exception as e:
            print("  retry", e, file=sys.stderr); time.sleep(5 * (attempt + 1))
    else:
        raise SystemExit("Nominatim unreachable")
    last[0] = time.time()
    cache[url] = data
    json.dump(cache, open(CACHE, "w"), ensure_ascii=False)
    return data

def search(q):
    return get("https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": q, "format": "jsonv2", "addressdetails": 1, "limit": 5, "accept-language": "en", "email": EMAIL}))

def reverse(lat, lng):
    return get("https://nominatim.openstreetmap.org/reverse?" + urllib.parse.urlencode(
        {"lat": lat, "lon": lng, "format": "jsonv2", "addressdetails": 1, "zoom": 18, "accept-language": "en", "email": EMAIL}))

def simplify(t):
    t = re.sub(r"\(.*?\)", "", t)          # drop "(...)"
    t = re.split(r"\s[-–|/]\s", t)[0]       # drop " - branch name"
    return t.strip()

rows = []
for f in sorted(os.listdir(CSV_DIR)):
    if not f.endswith(".csv"): continue
    for r in csv.DictReader(open(os.path.join(CSV_DIR, f), encoding="utf-8-sig")):
        if r["Title"].strip() or r["URL"].strip(): rows.append((f[:-4], r))

for i, (lst, r) in enumerate(rows, 1):
    title, url = r["Title"].strip(), r["URL"].strip()
    m = ID.search(url)
    print(f"[{i}/{len(rows)}] {lst}: {title}", file=sys.stderr)
    if not m:
        c = re.search(r"/search/(-?[\d.]+),(-?[\d.]+)", url)
        if c: reverse(*c.groups())
        continue
    cities = []
    lc = LIST_CITY.get(lst.split()[0])
    if lc: cities.append(lc)
    hint = PREFIX.get(m.group(1)[:6])
    if hint and hint not in cities: cities.append(hint)
    found = False
    for code in cities:
        for name in dict.fromkeys([title, simplify(title)]):
            if search(f"{name}, {CITY[code]}"): found = True; break
        if found: break
    if not found:
        for name in dict.fromkeys([title, simplify(title)]):
            if search(name): break
print("done", len(cache), "cached lookups", file=sys.stderr)
