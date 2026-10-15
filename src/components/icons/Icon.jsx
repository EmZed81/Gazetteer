import React from 'react';

// Path data copied from lucide-static@0.460.0 (ISC). See assets/icons/*.svg.
export const ICON_PATHS = {
 "utensils": "<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\" /> <path d=\"M7 2v20\" /> <path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\" />",
 "croissant": "<path d=\"m4.6 13.11 5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23.16.79 15.23 4.6 13.11Z\" /> <path d=\"m10.5 9.5-1-2.29C9.2 6.48 8.8 6 8 6H4.5C2.79 6 2 6.5 2 8.5a7.71 7.71 0 0 0 2 4.83\" /> <path d=\"M8 6c0-1.55.24-4-2-4-2 0-2.5 2.17-2.5 4\" /> <path d=\"m14.5 13.5 2.29 1c.73.3 1.21.7 1.21 1.5v3.5c0 1.71-.5 2.5-2.5 2.5a7.71 7.71 0 0 1-4.83-2\" /> <path d=\"M18 16c1.55 0 4-.24 4 2 0 2-2.17 2.5-4 2.5\" />",
 "pizza": "<path d=\"m12 14-1 1\" /> <path d=\"m13.75 18.25-1.25 1.42\" /> <path d=\"M17.775 5.654a15.68 15.68 0 0 0-12.121 12.12\" /> <path d=\"M18.8 9.3a1 1 0 0 0 2.1 7.7\" /> <path d=\"M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.68 19.68 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695z\" />",
 "coffee": "<path d=\"M10 2v2\" /> <path d=\"M14 2v2\" /> <path d=\"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1\" /> <path d=\"M6 2v2\" />",
 "sandwich": "<path d=\"m2.37 11.223 8.372-6.777a2 2 0 0 1 2.516 0l8.371 6.777\" /> <path d=\"M21 15a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-5.25\" /> <path d=\"M3 15a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h9\" /> <path d=\"m6.67 15 6.13 4.6a2 2 0 0 0 2.8-.4l3.15-4.2\" /> <rect width=\"20\" height=\"4\" x=\"2\" y=\"11\" rx=\"1\" />",
 "heart": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\" />",
 "megaphone": "<path d=\"m3 11 18-5v12L3 14v-3z\" /> <path d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\" />",
 "map-pin": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /> <circle cx=\"12\" cy=\"10\" r=\"3\" />",
 "search": "<circle cx=\"11\" cy=\"11\" r=\"8\" /> <path d=\"m21 21-4.3-4.3\" />",
 "list": "<path d=\"M3 12h.01\" /> <path d=\"M3 18h.01\" /> <path d=\"M3 6h.01\" /> <path d=\"M8 12h13\" /> <path d=\"M8 18h13\" /> <path d=\"M8 6h13\" />",
 "layout-grid": "<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\" /> <rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\" />",
 "map": "<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\" /> <path d=\"M15 5.764v15\" /> <path d=\"M9 3.236v15\" />",
 "x": "<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />",
 "arrow-left": "<path d=\"m12 19-7-7 7-7\" /> <path d=\"M19 12H5\" />",
 "arrow-right": "<path d=\"M5 12h14\" /> <path d=\"m12 5 7 7-7 7\" />",
 "arrow-up-right": "<path d=\"M7 7h10v10\" /> <path d=\"M7 17 17 7\" />",
 "sliders-horizontal": "<line x1=\"21\" x2=\"14\" y1=\"4\" y2=\"4\" /> <line x1=\"10\" x2=\"3\" y1=\"4\" y2=\"4\" /> <line x1=\"21\" x2=\"12\" y1=\"12\" y2=\"12\" /> <line x1=\"8\" x2=\"3\" y1=\"12\" y2=\"12\" /> <line x1=\"21\" x2=\"16\" y1=\"20\" y2=\"20\" /> <line x1=\"12\" x2=\"3\" y1=\"20\" y2=\"20\" /> <line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"6\" /> <line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\" /> <line x1=\"16\" x2=\"16\" y1=\"18\" y2=\"22\" />",
 "bookmark": "<path d=\"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z\" />",
 "star": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\" />",
 "plus": "<path d=\"M5 12h14\" /> <path d=\"M12 5v14\" />",
 "chevron-down": "<path d=\"m6 9 6 6 6-6\" />",
 "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\" /> <path d=\"M12 2v2\" /> <path d=\"M12 20v2\" /> <path d=\"m4.93 4.93 1.41 1.41\" /> <path d=\"m17.66 17.66 1.41 1.41\" /> <path d=\"M2 12h2\" /> <path d=\"M20 12h2\" /> <path d=\"m6.34 17.66-1.41 1.41\" /> <path d=\"m19.07 4.93-1.41 1.41\" />",
 "moon": "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\" />",
 "circle-dashed": "<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\" /> <path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\" /> <path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\" /> <path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\" /> <path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\" /> <path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\" /> <path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\" /> <path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\" />"
};

/** Line icon. 24-grid, 1.5 stroke, square-ish caps, currentColor. */
export function Icon({ name, size = 20, strokeWidth = 1.5, title, style, ...rest }) {
  const body = ICON_PATHS[name];
  if (!body) return null;
  return React.createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
    role: title ? 'img' : undefined, 'aria-hidden': title ? undefined : true, 'aria-label': title,
    style: { display: 'block', flexShrink: 0, ...style },
    dangerouslySetInnerHTML: { __html: body }, ...rest,
  });
}
