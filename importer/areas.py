"""Fill in each place's neighbourhood (shown under its name) with an OpenStreetMap reverse lookup, cached."""
import json, os, re, sys, time, urllib.parse, urllib.request
PLACES, CACHE = sys.argv[1], sys.argv[2]
EMAIL = os.environ["GAZETTEER_EMAIL"]  # OpenStreetMap asks for a contact address
cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
places = json.load(open(PLACES))
# Which OpenStreetMap field reads like a neighbourhood differs by city ("Manhattan" is too broad, "Jordaan" is right).
ORDER = {"NYC": ["neighbourhood", "quarter", "suburb"], "AMS": ["quarter", "suburb"], "ATH": ["neighbourhood", "quarter", "suburb"],
         "CPH": ["quarter", "suburb"], "LON": ["suburb", "quarter"], "VIE": ["suburb", "city_district"]}
DEFAULT = ["suburb", "neighbourhood", "quarter"]
for i, p in enumerate(places):
    key = f"{p['lat']:.5f},{p['lng']:.5f}"
    if key not in cache:
        url = "https://nominatim.openstreetmap.org/reverse?" + urllib.parse.urlencode(
            {"lat": p["lat"], "lon": p["lng"], "format": "jsonv2", "zoom": 16, "addressdetails": 1, "accept-language": "en", "email": EMAIL})
        for attempt in range(5):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": f"Gazetteer-import/1.0 ({EMAIL})"}), timeout=30) as r:
                    cache[key] = json.load(r).get("address", {}); break
            except Exception as e:
                print("retry", e, file=sys.stderr); time.sleep(5 * (attempt + 1))
        json.dump(cache, open(CACHE, "w"), ensure_ascii=False); time.sleep(1.1)
    a = cache.get(key, {})
    # Skip administrative names that don't read like a neighbourhood ("Manhattan Community Board 8").
    ok = lambda v: v and not re.search(r"Community Board|District|Borough|County|Katastralgemeinde", v)
    p["area"] = next((a[k] for k in ORDER.get(p["city"], DEFAULT) + ["suburb"] if ok(a.get(k))), "")
    print(f"[{i+1}/{len(places)}] {p['name']}: {p['area']}", file=sys.stderr)
json.dump(places, open(PLACES, "w"), ensure_ascii=False, indent=1)
print("areas filled:", sum(bool(p["area"]) for p in places), "of", len(places))
