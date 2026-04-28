import React from 'react';

const R = 54;
const CIRC = 2 * Math.PI * R;

function Ring({ progress, color, size = 140, strokeWidth = 8, children }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(1, Math.max(0, progress)))}
        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
      />
    </svg>
  );
}

function fmt(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function scoreColor(score) {
  if (score >= 80) return '#2ed573';
  if (score >= 50) return '#ffa502';
  return '#ff4757';
}

function timerColor(elapsed) {
  if (elapsed < 45 * 60) return '#00d4aa';
  if (elapsed < 90 * 60) return '#ffa502';
  return '#ff4757';
}

export default function HealthTimer({ timer }) {
  const { status, elapsed, breakLog, healthScore, progress, nextBreakIn, start, pause, stop } = timer;
  const color = timerColor(elapsed);
  const sc = scoreColor(healthScore);

  return (
    <aside style={{
      width: 260, flexShrink: 0, background: '#0f1525',
      borderRight: '1px solid #1e2d4a', display: 'flex',
      flexDirection: 'column', padding: '24px 20px', gap: 24,
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 15, color: '#e8eaf6', marginBottom: 4 }}>
          🏃 Health Tracker
        </h2>
        <p style={{ color: '#8892b0', fontSize: 12 }}>Track your gaming session</p>
      </div>

      {/* Ring Timer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <Ring progress={progress} color={color} size={140} strokeWidth={10} />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'Space Grotesk' }}>
              {fmt(elapsed)}
            </span>
            <span style={{ fontSize: 11, color: '#8892b0', marginTop: 2 }}>
              {status === 'idle' ? 'not started' : status === 'paused' ? 'paused' : 'session'}
            </span>
          </div>
        </div>

        {/* Next break */}
        {status === 'running' && (
          <div style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 10,
            padding: '10px 16px', width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: '#8892b0', marginBottom: 4 }}>Next break in</div>
            <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'Space Grotesk' }}>
              {fmt(nextBreakIn)}
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
          {status === 'idle' ? (
            <button onClick={start} style={{
              flex: 1, background: '#00d4aa', color: '#000',
              padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: 13,
            }}>
              ▶ Start Session
            </button>
          ) : (
            <>
              <button onClick={pause} style={{
                flex: 1, background: 'rgba(255,255,255,0.07)', color: '#e8eaf6',
                padding: '10px 0', borderRadius: 10, fontWeight: 600, fontSize: 13,
              }}>
                {status === 'paused' ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button onClick={stop} style={{
                background: 'rgba(255,71,87,0.15)', color: '#ff4757',
                padding: '10px 14px', borderRadius: 10, fontWeight: 600, fontSize: 13,
              }}>
                ■
              </button>
            </>
          )}
        </div>
      </div>

      {/* Health Score */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: '#8892b0' }}>Health Score</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: sc, fontFamily: 'Space Grotesk' }}>
            {healthScore}
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
          <div style={{
            width: `${healthScore}%`, height: '100%', borderRadius: 4,
            background: sc, transition: 'width 0.5s, background 0.5s',
          }} />
        </div>
        <p style={{ fontSize: 11, color: '#8892b0', marginTop: 8 }}>
          Take breaks to earn points. Skip them to lose points.
        </p>
      </div>

      {/* Break Log */}
      <div>
        <h3 style={{ fontSize: 12, color: '#8892b0', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Break Log
        </h3>
        {breakLog.length === 0 ? (
          <p style={{ fontSize: 12, color: '#4a5568' }}>No breaks taken yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {breakLog.map((b, i) => (
              <div key={i} style={{
                background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)',
                borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: '#e8eaf6', fontWeight: 600 }}>{b.title}</div>
                  <div style={{ fontSize: 10, color: '#8892b0' }}>{b.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div style={{
        marginTop: 'auto', background: 'rgba(124,77,255,0.08)',
        border: '1px solid rgba(124,77,255,0.2)', borderRadius: 12, padding: '14px',
      }}>
        <p style={{ fontSize: 11, color: '#8892b0', lineHeight: 1.6 }}>
          💡 <strong style={{ color: '#a78bfa' }}>Tip:</strong> The 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.
        </p>
      </div>
    </aside>
  );
}
