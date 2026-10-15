import React from 'react';
import { Icon } from '../icons/Icon.jsx';

const H = { sm: 32, md: 40, lg: 48 };

/** Square-cornered button. primary = ink slab, accent = red pencil, secondary = ruled outline, ghost = underlined text. */
export function Button({ variant = 'primary', size = 'md', icon, iconRight, children, disabled, onClick, type = 'button', style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const pal = {
    primary: { bg: 'var(--ink-1)', fg: 'var(--paper-0)', bd: 'var(--ink-1)', hbg: 'var(--ink-2)' },
    accent: { bg: 'var(--red-pencil)', fg: 'var(--red-pencil-ink)', bd: 'var(--red-pencil)', hbg: 'var(--ink-1)' },
    secondary: { bg: 'transparent', fg: 'var(--ink-1)', bd: 'var(--ink-1)', hbg: 'var(--paper-2)' },
    ghost: { bg: 'transparent', fg: 'var(--ink-1)', bd: 'transparent', hbg: 'transparent' },
  }[variant];
  const h = H[size] || H.md;
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)}
      style={{
        height: h, padding: variant === 'ghost' ? '0 4px' : `0 ${size === 'sm' ? 12 : 18}px`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: hover && !disabled ? pal.hbg : pal.bg, color: pal.fg,
        border: `1px solid ${pal.bd}`, borderRadius: 0,
        fontFamily: 'var(--font-text)', fontSize: size === 'sm' ? 13 : 14, fontWeight: 600, letterSpacing: '.01em',
        textDecoration: variant === 'ghost' ? 'underline' : 'none', textUnderlineOffset: '.22em',
        textDecorationColor: variant === 'ghost' && hover ? 'var(--red-pencil)' : 'currentColor',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transform: down && !disabled ? 'translateY(1px)' : 'none',
        transition: 'background var(--dur-fast) var(--ease-out), transform var(--dur-fast)',
        whiteSpace: 'nowrap', ...style,
      }} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} />}
    </button>
  );
}

/** Icon-only square button. Hit area never below 40px (44 on touch via size="lg"). */
export function IconButton({ icon, label, size = 'md', variant = 'secondary', onClick, active, style }) {
  const [hover, setHover] = React.useState(false);
  const h = H[size] || H.md;
  const filled = active || variant === 'primary';
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} aria-pressed={active}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: h, height: h, padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: filled ? 'var(--ink-1)' : hover ? 'var(--paper-2)' : variant === 'raised' ? 'var(--paper-0)' : 'transparent',
        color: filled ? 'var(--paper-0)' : 'var(--ink-1)',
        border: variant === 'ghost' ? '1px solid transparent' : '1px solid var(--ink-1)', borderRadius: 0, cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-out)', ...style,
      }}>
      <Icon name={icon} size={size === 'sm' ? 16 : 20} />
    </button>
  );
}
