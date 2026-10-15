import React from 'react';
import { CATEGORY_KEYS, CATEGORIES } from '../icons/CategoryIcon.jsx';
import { Chip } from '../controls/Chip.jsx';
import { SearchField } from '../controls/SearchField.jsx';
import { ViewToggle } from '../controls/ViewToggle.jsx';

/** Search + category chips + result count + view toggle. Chips scroll horizontally on narrow screens. */
export function FilterBar({ query = '', onQueryChange, counts = {}, selected = [], onToggleCategory, onClear, view = 'list', onViewChange, resultCount, compact = false, placeholder, style }) {
  const toggle = k => onToggleCategory && onToggleCategory(k);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <SearchField value={query} onChange={onQueryChange} placeholder={placeholder} style={{ flex: 1 }} />
        <ViewToggle value={view} onChange={onViewChange} showLabels={!compact} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, minWidth: 0, scrollbarWidth: 'none', paddingBottom: 1 }}>
          <Chip label="All" selected={selected.length === 0} onClick={onClear} size={compact ? 'sm' : 'md'} />
          {CATEGORY_KEYS.map(k => (
            <Chip key={k} label={CATEGORIES[k].plural} category={k} count={counts[k]} disabled={counts[k] === 0}
              selected={selected.includes(k)} onClick={() => toggle(k)} size={compact ? 'sm' : 'md'} />
          ))}
        </div>
        {resultCount != null && !compact && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-meta)', whiteSpace: 'nowrap' }}>{resultCount} {resultCount === 1 ? 'place' : 'places'}</span>
        )}
      </div>
    </div>
  );
}
