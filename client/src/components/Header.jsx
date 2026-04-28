import React from 'react';

export default function Header() {
  return (
    <header style={{
      background: '#0f1525', borderBottom: '1px solid #1e2d4a',
      padding: '0 28px', height: 60, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>🎮</span>
        <div>
          <h1 style={{
            fontFamily: 'Space Grotesk', fontSize: 17, fontWeight: 700,
            background: 'linear-gradient(90deg, #00d4aa, #7c4dff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Game Health Dashboard
          </h1>
          <p style={{ fontSize: 11, color: '#8892b0', marginTop: -2 }}>
            Steam stats + healthy gaming reminders
          </p>
        </div>
      </div>
      <a
        href="https://steamcommunity.com/dev/apikey"
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 12, color: '#8892b0', textDecoration: 'none',
          padding: '6px 14px', borderRadius: 8,
          border: '1px solid #1e2d4a', transition: 'all 0.2s',
        }}
        onMouseOver={e => { e.target.style.borderColor = '#00d4aa'; e.target.style.color = '#00d4aa'; }}
        onMouseOut={e => { e.target.style.borderColor = '#1e2d4a'; e.target.style.color = '#8892b0'; }}
      >
        Get Steam API Key ↗
      </a>
    </header>
  );
}
