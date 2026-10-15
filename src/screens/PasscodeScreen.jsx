import React from 'react';
import { Wordmark } from '../components/brand/Wordmark.jsx';
import { Button } from '../components/controls/Button.jsx';

/** First-run lock screen. Asks for the passcode once; the phone remembers it after that. */
export function PasscodeScreen({ onSubmit }) {
  const [value, setValue] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [wrong, setWrong] = React.useState(false);
  const submit = async e => {
    e.preventDefault();
    if (!value.trim() || busy) return;
    setBusy(true); setWrong(false);
    const ok = await onSubmit(value);
    if (!ok) { setBusy(false); setWrong(true); }
  };
  return (
    <div style={{ minHeight: '100%', padding: '24px 16px 48px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <Wordmark size={24} />
      <form onSubmit={submit} style={{ borderTop: '4px solid var(--ink-1)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span className="gz-kicker">Private archive</span>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-title)', fontWeight: 400, fontSize: 38, lineHeight: 1.1 }}>
          Yours, <span style={{ color: 'var(--red-pencil)' }}>and only yours.</span>
        </h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--text-secondary)' }}>Enter your passcode. This phone will remember it, so you only do this once.</p>
        <input type="password" value={value} onChange={e => setValue(e.target.value)} autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false}
          aria-label="Passcode" placeholder="Passcode"
          style={{ height: 48, border: 0, borderBottom: `2px solid ${wrong ? 'var(--red-pencil)' : 'var(--ink-1)'}`, background: 'transparent', color: 'var(--ink-1)',
            fontFamily: 'var(--font-text)', fontSize: 16, outline: 'none', padding: '0 2px' }} />
        {wrong && <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--red-pencil)' }}>Not quite. Try again.</p>}
        <Button type="submit" size="lg" disabled={busy} style={{ alignSelf: 'flex-start' }}>{busy ? 'Opening…' : 'Open the archive'}</Button>
      </form>
    </div>
  );
}
