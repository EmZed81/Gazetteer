import React from 'react';
import { Icon } from './Icon.jsx';

export const CATEGORIES = {
  restaurant: { label: 'Restaurant', plural: 'Restaurants', icon: 'utensils', ink: 'Claret' },
  bakery:     { label: 'Bakery', plural: 'Bakeries', icon: 'croissant', ink: 'Crust' },
  pizza:      { label: 'Pizza', plural: 'Pizza', icon: 'pizza', ink: 'Basil' },
  coffee:     { label: 'Coffee', plural: 'Coffee', icon: 'coffee', ink: 'Espresso' },
  sandwich:   { label: 'Sandwich', plural: 'Sandwiches', icon: 'sandwich', ink: 'Paprika' },
  reccs:      { label: 'Recc', plural: 'Reccs', icon: 'megaphone', ink: 'Ultraviolet' },
  favourites: { label: 'Favourite', plural: 'Favourites', icon: 'heart', ink: 'Rose' },
  other:      { label: 'Other', plural: 'Other', icon: 'map-pin', ink: 'Pencil' },
};
export const CATEGORY_KEYS = ['restaurant', 'bakery', 'pizza', 'coffee', 'sandwich', 'reccs', 'favourites'];
export const catVar = (c, part = '') => `var(--cat-${CATEGORIES[c] ? c : 'other'}${part ? '-' + part : ''})`;

/** Category glyph. shape: 'glyph' (line icon in category text ink) | 'disc' | 'square' (filled). */
export function CategoryIcon({ category = 'other', shape = 'glyph', size = 20, title, style }) {
  const c = CATEGORIES[category] ? category : 'other';
  const name = CATEGORIES[c].icon;
  if (shape === 'glyph') {
    return <span style={{ color: catVar(c, 'text'), display: 'inline-flex', ...style }}><Icon name={name} size={size} title={title} /></span>;
  }
  const glyph = Math.round(size * 0.56);
  return (
    <span role={title ? 'img' : undefined} aria-label={title} style={{
      width: size, height: size, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: catVar(c), color: catVar(c, 'on'), borderRadius: shape === 'disc' ? '50%' : 0, ...style,
    }}>
      <Icon name={name} size={glyph} strokeWidth={size < 24 ? 2 : 1.75} />
    </span>
  );
}
