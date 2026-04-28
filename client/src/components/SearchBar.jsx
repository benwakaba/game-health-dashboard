import React, { useState } from 'react';

export default function SearchBar({ onSearch, onDemo, loading }) {
  const [input, setInput] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim());
  };

  return (
    <div style={{
      background: '#0f1525', border: '1px solid #1e2d4a',
      borderRadius: 16, padding: '28px 32px',
    }}>
      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 20, marginBottom: 6 }}>
        Look up a Steam Player
      </h2>
      <p style={{ color: '#8892b0', fontSize: 13, marginBottom: 20 }}>
        Enter a 64-bit Steam ID (e.g. <code style={{ color: '#00d4aa' }}>76561198028291995</code>) or a custom profile URL slug.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Steam ID or custom URL..."
          disabled={loading}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid #1e2d4a', borderRadius: 10,
            padding: '12px 16px', color: '#e8eaf6', fontSize: 14,
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = '#00d4aa')}
          onBlur={e => (e.target.style.borderColor = '#1e2d4a')}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: '#00d4aa', color: '#000', padding: '12px 24px',
            borderRadius: 10, fontWeight: 700, fontSize: 14,
            opacity: (loading || !input.trim()) ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? '...' : 'Search'}
        </button>
        <button
          type="button"
          onClick={onDemo}
          disabled={loading}
          style={{
            background: 'rgba(124,77,255,0.15)', color: '#a78bfa',
            border: '1px solid rgba(124,77,255,0.3)',
            padding: '12px 20px', borderRadius: 10,
            fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
          }}
          onMouseOver={e => (e.target.style.background = 'rgba(124,77,255,0.25)')}
          onMouseOut={e => (e.target.style.background = 'rgba(124,77,255,0.15)')}
        >
          Demo Mode
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 12, color: '#4a5568' }}>
        Requires a Steam API key configured in <code>.env</code>. Use Demo Mode to preview without one.
      </p>
    </div>
  );
}
