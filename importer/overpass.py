"""Download every named shop/café/restaurant etc. in each city from OpenStreetMap (Overpass), cached per city."""
import json, os, sys, time, urllib.parse, urllib.request
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
UA = f"Gazetteer-import/1.0 ({os.environ['GAZETTEER_EMAIL']})"  # OpenStreetMap asks for a contact address
BOX = {  # south, west, north, east
    "NYC": (40.49, -74.27, 40.93, -73.68), "AMS": (52.27, 4.72, 52.45, 5.08), "ATH": (37.80, 23.55, 38.15, 23.95),
    "LON": (51.28, -0.52, 51.70, 0.34), "DXB": (24.85, 54.95, 25.40, 55.65), "AUH": (24.15, 54.25, 24.65, 54.80),
    "CPH": (55.58, 12.40, 55.78, 12.70), "VIE": (48.11, 16.18, 48.33, 16.58)}
TILES = {}
for code, (s, w, n, e) in BOX.items():   # 2x2 tiles keep each request small
    ms, mw = (s + n) / 2, (w + e) / 2
    for i, t in enumerate([(s, w, ms, mw), (s, mw, ms, e), (ms, w, n, mw), (ms, mw, n, e)]):
        TILES[f"{code}.{i}"] = t
for code, (s, w, n, e) in TILES.items():
    if os.path.exists(os.path.join(OUT, code.split(".")[0] + ".json")): continue
    path = os.path.join(OUT, "tiles", code + ".json"); os.makedirs(os.path.dirname(path), exist_ok=True)
    if os.path.exists(path): continue
    q = f"""[out:json][timeout:300];
(nwr["name"]["amenity"]({s},{w},{n},{e}); nwr["name"]["shop"]({s},{w},{n},{e});
 nwr["name"]["tourism"]({s},{w},{n},{e}); nwr["name"]["leisure"]({s},{w},{n},{e}); nwr["name"]["craft"]({s},{w},{n},{e}););
out center tags;"""
    for attempt in range(15):
        try:
            req = urllib.request.Request("https://overpass-api.de/api/interpreter",
                                         data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=400) as r: data = json.load(r)
            json.dump(data, open(path, "w"), ensure_ascii=False)
            print(code, len(data["elements"]), "places", file=sys.stderr); break
        except Exception as ex:
            print(code, "retry", attempt, ex, file=sys.stderr); time.sleep(min(60, 10 * (attempt + 1)))
    else:
        print(code, "FAILED", file=sys.stderr)
    time.sleep(5)

for code in BOX:   # merge tiles into one file per city
    final = os.path.join(OUT, code + ".json")
    parts = [os.path.join(OUT, "tiles", f"{code}.{i}.json") for i in range(4)]
    if os.path.exists(final) or not all(map(os.path.exists, parts)): continue
    els = {}
    for f in parts:
        for e in json.load(open(f))["elements"]: els[(e["type"], e["id"])] = e
    json.dump({"elements": list(els.values())}, open(final, "w"), ensure_ascii=False)
    print(code, "merged", len(els), file=sys.stderr)
