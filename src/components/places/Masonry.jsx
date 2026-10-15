import React from 'react';

/**
 * Two-column "wrap-around" layout: each card keeps its own height and the next card slots in
 * wherever there's room, so short and long cards interlock instead of leaving gaps.
 * (CSS grid with 1px rows; each card spans as many rows as it is tall.)
 */
export function Masonry({ children, gap = 10, style }) {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const grid = ref.current;
    const fit = () => {
      for (const cell of grid.children) {
        const h = cell.firstElementChild.getBoundingClientRect().height;
        cell.style.gridRowEnd = `span ${Math.ceil(h + gap)}`;
      }
    };
    fit();
    const ro = new ResizeObserver(fit); // re-fit when fonts load or text wraps differently
    for (const cell of grid.children) ro.observe(cell.firstElementChild);
    return () => ro.disconnect();
  });
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: 1, columnGap: gap, alignItems: 'start', ...style }}>
      {React.Children.map(children, child => <div>{child}</div>)}
    </div>
  );
}
