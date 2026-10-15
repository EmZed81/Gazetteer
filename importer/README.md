# Importer

Turns the Google Takeout "Saved" CSVs into place data for the app. Personal files live in `private/` (not committed).

1. `geocode.py <csv-dir> <cache.json>` – OpenStreetMap (Nominatim) lookups, 1 per second, cached.
2. `match.py <csv-dir> <cache.json> <matched.json>` – picks the best match in the expected city.
3. `overpass.py <osm-dir>` – downloads named places per city from OpenStreetMap (Overpass).
4. `fuzzy.py <matched.json> <osm-dir> <out.json>` – looser name matching for places step 2 missed.

Set `GAZETTEER_EMAIL` to a contact address before running steps 1 and 3.
5. `finalize.py <csv-dir> <matched.json> <filled.csv> <cache.json> <places.json> <decisions.json>` – merges the
   automatic matches with the owner's filled-in addresses and decisions (removals, moves) into the final place list.
