import React from 'react';

const STRETCH = 90; // the most a card may grow to line up with its neighbour before a full-width card

/**
 * Two-column "wrap-around" layout. Each card keeps its own height and goes into the shorter column,
 * so short and long cards interlock instead of leaving gaps.
 *
 * Full-width cards (children with a `wide` prop) follow one rule: they only go where both columns
 * end at (nearly) the same height. The shorter column's last card stretches to meet it, so there's
 * never a gap above a full-width card. If no such spot comes up, it waits; as a last resort it goes at the end.
 */
export function Masonry({ children, gap = 10, style }) {
  const box = React.useRef(null);
  const items = React.Children.toArray(children);

  React.useLayoutEffect(() => {
    const el = box.current;
    const cells = [...el.children];
    const layout = () => {
      const width = el.clientWidth, col = (width - gap) / 2;
      // Size every card for its slot, clear any earlier stretch, then measure its natural height.
      cells.forEach((c, i) => {
        c.style.width = (items[i].props.wide ? width : col) + 'px';
        c.firstElementChild.style.minHeight = '';
      });
      const h = cells.map(c => c.firstElementChild.getBoundingClientRect().height);

      const bottom = [0, 0];        // where each column currently ends
      const last = [null, null];    // index of the last card in each column (to stretch it)
      const pos = [];
      const place = (i, x, y) => { pos[i] = { x, y }; };
      // Walk the cards in order. A full-width card waits in a queue until the columns line up,
      // so it stays close to its place in the order but never leaves a gap.
      const waiting = [];
      const placeWide = () => {
        const top = Math.max(...bottom);
        for (const c of [0, 1]) {   // stretch the shorter column's last card to the same line
          if (last[c] != null && bottom[c] < top) {
            cells[last[c]].firstElementChild.style.minHeight = (h[last[c]] + top - bottom[c]) + 'px';
          }
        }
        const i = waiting.shift();
        place(i, 0, top);
        bottom[0] = bottom[1] = top + h[i] + gap;
        last[0] = last[1] = null;
      };
      const lined = () => Math.abs(bottom[0] - bottom[1]) <= STRETCH;
      items.forEach((item, i) => {
        if (item.props.wide) { waiting.push(i); if (waiting.length === 1 && lined()) placeWide(); return; }
        const c = bottom[0] <= bottom[1] ? 0 : 1;
        place(i, c ? col + gap : 0, bottom[c]);
        bottom[c] += h[i] + gap;
        last[c] = i;
        if (waiting.length && lined()) placeWide();
      });
      while (waiting.length) placeWide();   // last resort: any still waiting go at the end

      cells.forEach((c, i) => { c.style.transform = `translate(${pos[i].x}px, ${pos[i].y}px)`; });
      el.style.height = Math.max(0, Math.max(...bottom) - gap) + 'px';
    };
    layout();
    document.fonts.ready.then(layout);
    const ro = new ResizeObserver(() => requestAnimationFrame(layout)); // fonts loading, rotation
    ro.observe(el);
    return () => ro.disconnect();
  });

  return (
    <div ref={box} style={{ position: 'relative', ...style }}>
      {items.map(child => (
        <div key={child.key} style={{ position: 'absolute', left: 0, top: 0 }}>{child}</div>
      ))}
    </div>
  );
}
