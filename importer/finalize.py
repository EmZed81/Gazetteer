"""Combine automatic matches + owner's filled-in addresses into the final place list."""
import csv, json, unicodedata, os, re, sys, time, urllib.parse, urllib.request
CSV_DIR, MATCHED, FILLED, CACHE, OUT, DECISIONS = sys.argv[1:7]
_d = json.load(open(DECISIONS))   # owner's decisions: removals, extra addresses, Greek street spellings (private)
EXTRA_REMOVE = {(n, l) for n, l in _d["remove"]}
EXTRA_ADDRESS = {k: tuple(v) for k, v in _d["address"].items()}
GREEK_STREET = _d["greek_street"]
EMAIL = os.environ["GAZETTEER_EMAIL"]
CITY = {"NYC": "New York", "AMS": "Amsterdam", "ATH": "Athens", "LON": "London",
        "DXB": "Dubai", "AUH": "Abu Dhabi", "CPH": "Copenhagen", "VIE": "Vienna"}
CODE = {v: k for k, v in CITY.items()}
CENTRE = {"NYC": (40.7128, -74.0060), "AMS": (52.3676, 4.9041), "ATH": (37.9838, 23.7275), "LON": (51.5074, -0.1278),
          "DXB": (25.2048, 55.2708), "AUH": (24.4539, 54.3773), "CPH": (55.6761, 12.5683), "VIE": (48.2082, 16.3738)}
CATEGORY = {"Bakes": "bakery", "Eats": "restaurant", "Pizza": "pizza", "Pizzas": "pizza", "Cafés": "coffee",
            "Sandwiches": "sandwich"}
RECCS = {"NYT reccs": "NYT Cooking", "AMS by Tomek": "Tomek", "Ditch the Silver": "Ditch the Silver"}

cache = json.load(open(CACHE)); last = [0.0]
def nominatim(q):
    url = "https://nominatim.openstreetmap.org/search?" + urllib.parse.urlencode(
        {"q": q, "format": "jsonv2", "addressdetails": 1, "limit": 1, "accept-language": "en", "email": EMAIL})
    if url not in cache:
        time.sleep(max(0, 1.1 - (time.time() - last[0])))
        for attempt in range(5):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": f"Gazetteer-import/1.0 ({EMAIL})"}), timeout=30) as r:
                    cache[url] = json.load(r); break
            except Exception as e:
                print("  retry", e, file=sys.stderr); time.sleep(5 * (attempt + 1))
        last[0] = time.time(); json.dump(cache, open(CACHE, "w"), ensure_ascii=False)
    return cache.get(url) or []

# --- Open Location Code ("plus code") decoding, per the public spec ---
OLC = "23456789CFGHJMPQRVWX"
def olc_decode(code):
    code = code.replace("+", "").upper()
    lat, lng, res = -90.0, -180.0, 20.0
    for i in range(0, min(len(code), 10), 2):
        lat += OLC.index(code[i]) * res; lng += OLC.index(code[i + 1]) * res
        if i + 2 < min(len(code), 10): res /= 20
    lat_res = lng_res = res
    if len(code) > 10:
        for ch in code[10:]:
            d = OLC.index(ch); lat_res /= 5; lng_res /= 4
            lat += (d // 4) * lat_res; lng += (d % 4) * lng_res
    return lat + lat_res / 2, lng + lng_res / 2
def olc_recover(short, ref):
    short = short.upper(); pad = 8 - short.index("+")
    res = 20.0 / (20 ** (pad / 2 - 1)) if pad else 20.0
    res = [20.0, 1.0, 0.05, 0.0025][pad // 2] if pad else 20.0
    lat0, lng0 = ref
    def fmt(lat, lng):  # encode the reference to get its prefix
        lat += 90; lng += 180; out = ""; r = 20.0
        for _ in range(5):
            a, b = int(lat // r), int(lng // r); out += OLC[a] + OLC[b]; lat -= a * r; lng -= b * r; r /= 20
        return out[:8] + "+" + out[8:]
    full = fmt(lat0, lng0)[:pad] + short
    lat, lng = olc_decode(full)
    # snap to the nearest copy of the cell if it landed on the wrong side of a boundary
    if lat - lat0 > res / 2: lat -= res
    if lat0 - lat > res / 2: lat += res
    if lng - lng0 > res / 2: lng -= res
    if lng0 - lng > res / 2: lng += res
    return lat, lng

def geocode_address(addr, city):
    m = re.match(r"^([23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3})\b", addr.upper())
    if m: return (*olc_recover(m.group(1), CENTRE[city]), "exact")
    tries = [(addr, "exact")]
    tries += [(f"{gr}, Αθήνα", "exact") for en, gr in GREEK_STREET.items() if addr.startswith(en)]
    bits = [b.strip(" &") for b in addr.split(",") if b.strip(" &")]
    if bits and re.fullmatch(r"[\d\-–]+", bits[0]) and len(bits) > 1:      # "9-11, Patroou St"
        bits = [bits[1] + " " + bits[0].split("-")[0]] + bits[2:]
    street = next((b for b in bits if re.search(r"\d", b) and not re.fullmatch(r"[\d\s]+", b)), None)
    if street:
        street = re.sub(r"\b(\d+)[A-Za-zα-ω\-]*\b.*$", r"\1", street)         # "63H", "47H", "69α" -> number
        street = re.sub(r"\b(Ave|Avenue|St|Street|Leof)\.?(\s|$)", " ", street).strip()
        tries.append((f"{street}, {CITY[city]}", "exact"))
        name_only = re.sub(r"\s*\d+\s*$", "", street).replace("Pl. ", "").strip()
        if name_only: tries.append((f"{name_only}, {CITY[city]}", "street"))   # right street, not the exact door
    parts = [p.strip() for p in re.split(r"\s+-\s+", addr) if p.strip()]
    tries += [(", ".join(parts[i:]), "area") for i in range(1, len(parts) - 1)]
    for q, precision in tries:
        r = nominatim(q)
        if r:
            lat, lng = float(r[0]["lat"]), float(r[0]["lon"])
            if abs(lat - CENTRE[city][0]) < 0.8 and abs(lng - CENTRE[city][1]) < 0.8:
                return lat, lng, precision
    return None

matched = json.load(open(MATCHED))
filled = {r["Google Maps link"]: r for r in csv.DictReader(open(FILLED, encoding="utf-8-sig"))}

def removed(p):
    return any(p["name"] == n and (l is None or p["list"] == l) for n, l in EXTRA_REMOVE)

places, dropped, failed = {}, [], []
for p in matched:
    p["list"] = unicodedata.normalize("NFC", p["list"])
    if removed(p): dropped.append((p["name"], "you asked")); continue
    f = filled.get(p["url"])
    if f and f["Address (please fill in)"].strip().lower() == "remove": dropped.append((p["name"], "you asked")); continue
    if p["name"] in EXTRA_ADDRESS:
        city, address = EXTRA_ADDRESS[p["name"]]; f = {"City": CITY[city], "Address (please fill in)": address}
    if f:
        city = CODE[f["City"]]; address = f["Address (please fill in)"].strip()
        g = geocode_address(address, city)
        if g: lat, lng, precision = g
        else: lat = lng = None; precision = None; failed.append((p["name"], address))
        area = ""
    elif "lat" in p:
        city, address, lat, lng, area, precision = p["foundCity"], p.get("address", ""), p["lat"], p["lng"], p.get("area", ""), "exact"
    else:
        if not p["listCity"]: dropped.append((p["name"], "favourite outside your 8 cities"))
        continue
    p["list"] = unicodedata.normalize("NFC", p["list"])
    words = p["list"].split()
    category = "favourites" if p["list"] == "Favourite places" else ("reccs" if p["list"] in RECCS else CATEGORY.get(words[-1], "other"))
    rec = places.get(p["id"])
    if rec:   # same place in two lists: keep the city-list category, mark as favourite
        if category == "favourites": rec["favourite"] = True
        elif rec["category"] == "favourites": rec.update(category=category, list=p["list"], favourite=True)
        rec["note"] = rec["note"] or p["note"]
        continue
    places[p["id"]] = {"id": p["id"], "name": p["name"], "category": category, "city": city, "area": area,
                       "address": address, "lat": lat, "lng": lng, "precision": precision, "note": p["note"],
                       "list": p["list"], "source": RECCS.get(p["list"]), "favourite": category == "favourites",
                       "url": p["url"]}
out = sorted(places.values(), key=lambda r: (list(CITY).index(r["city"]), r["category"], r["name"].lower()))
json.dump(out, open(OUT, "w"), ensure_ascii=False, indent=1)
print("FINAL", len(out), "places")
import collections
for c in CITY:
    rows = [r for r in out if r["city"] == c]
    print(f"  {CITY[c]:11s} {len(rows):3d}  ", dict(collections.Counter(r["category"] for r in rows)),
          " no pin:", sum(r["lat"] is None for r in rows), " area-only pin:", sum(r["precision"] == "area" for r in rows))
print("removed:", len(dropped)); print("could not pin:", failed)
