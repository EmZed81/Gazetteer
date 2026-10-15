// Small things the app remembers on this phone: theme and which places you've been to.
// Wrapped in try/catch because private browsing can block storage; the app still works without it.
export function load(key, fallback) {
  try { const v = localStorage.getItem('gz-' + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
}
export function save(key, value) {
  try { localStorage.setItem('gz-' + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
