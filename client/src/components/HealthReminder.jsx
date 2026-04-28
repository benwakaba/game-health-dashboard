import React, { useEffect, useState } from 'react';

export default function HealthReminder({ reminder, onDismiss }) {
  const [countdown, setCountdown] = useState(reminder.duration || 0);

  useEffect(() => {
    if (!countdown) return;
    const id = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const urgentColor = reminder.type === 'urgent' ? '#ff4757' : reminder.type === 'long' ? '#ffa502' : '#00d4aa';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(8,12,24,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#141c30', border: `2px solid ${urgentColor}`,
        borderRadius: 20, padding: '40px 48px', maxWidth: 460, width: '90%',
        textAlign: 'center', animation: 'slideUp 0.3s ease',
        boxShadow: `0 0 60px ${urgentColor}33`,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{reminder.icon}</div>
        <h2 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          color: urgentColor, fontSize: 22, marginBottom: 12,
        }}>
          {reminder.title}
        </h2>
        <p style={{ color: '#8892b0', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
          {reminder.msg}
        </p>

        {countdown > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: 12,
            padding: '12px 20px', marginBottom: 24, display: 'inline-block',
          }}>
            <span style={{ color: '#8892b0', fontSize: 13 }}>Suggested break duration: </span>
            <span style={{ color: urgentColor, fontWeight: 600, fontSize: 18 }}>{fmt(countdown)}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => onDismiss(true)}
            style={{
              background: urgentColor, color: '#000',
              padding: '12px 28px', borderRadius: 10,
              fontWeight: 700, fontSize: 14, transition: 'opacity 0.2s',
            }}
            onMouseOver={e => (e.target.style.opacity = '0.85')}
            onMouseOut={e => (e.target.style.opacity = '1')}
          >
            ✓ Break taken!
          </button>
          <button
            onClick={() => onDismiss(false)}
            style={{
              background: 'rgba(255,255,255,0.06)', color: '#8892b0',
              padding: '12px 28px', borderRadius: 10,
              fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.color = '#e8eaf6'; }}
            onMouseOut={e => { e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.color = '#8892b0'; }}
          >
            Skip (−5 pts)
          </button>
        </div>
      </div>
    </div>
  );
}
