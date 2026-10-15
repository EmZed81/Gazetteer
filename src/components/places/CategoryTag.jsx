import React from 'react';
import { CategoryIcon, CATEGORIES, catVar } from '../icons/CategoryIcon.jsx';

/** Category label: kicker caps in the category's ink, with glyph. variant 'text' | 'filled'. */
export function CategoryTag({ category = 'other', variant = 'text', label, style }) {
  const c = CATEGORIES[category] ? category : 'other';
  const text = label || CATEGORIES[c].label;
  const filled = variant === 'filled';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, height: filled ? 22 : 'auto', padding: filled ? '0 7px 0 5px' : 0,
      background: filled ? catVar(c) : 'transparent', color: filled ? catVar(c, 'on') : catVar(c, 'text'),
      fontFamily: 'var(--font-text)', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', lineHeight: 1, whiteSpace: 'nowrap', ...style,
    }}>
      {filled
        ? <span style={{ display: 'inline-flex' }}><CategoryIcon category={c} shape="glyph" size={13} style={{ color: 'inherit' }} /></span>
        : <CategoryIcon category={c} shape="glyph" size={13} />}
      {text}
    </span>
  );
}
