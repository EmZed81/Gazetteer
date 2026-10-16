# Gazetteer videos (Remotion)

Animated charts of the archive in the app's design. Landscape 1920×1080 (LinkedIn).

1. `npm install`
2. `npm run data` – counts per city and category from `../private/places.json` (git-ignored)
3. `npm run studio` – live preview in the browser, or `npm run render` – writes `out/what-you-save.mp4`

Fonts are bundled in `public/fonts`, so rendering works offline. In a cloud workspace without
Remotion's own browser, set `REMOTION_CHROME` to an installed Chromium headless shell.
