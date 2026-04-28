import React from 'react';

const STATUS = { 0: 'Offline', 1: 'Online', 2: 'Busy', 3: 'Away', 4: 'Snooze', 5: 'Looking to Trade', 6: 'Looking to Play' };
const STATUS_COLOR = { 0: '#8892b0', 1: '#2ed573', 2: '#ff4757', 3: '#ffa502', 4: '#ffa502' };

export default function PlayerProfile({ player, totalGames, totalHours }) {
  const status = STATUS[player.personastate] ?? 'Unknown';
  const statusColor = STATUS_COLOR[player.personastate] ?? '#8892b0';

  return (
    <div style={{
      background: '#0f1525', border: '1px solid #1e2d4a',
      borderRadius: 16, padding: '24px', display: 'flex',
      gap: 20, alignItems: 'flex-start', animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={player.avatarfull}
          alt={player.personaname}
          style={{ width: 80, height: 80, borderRadius: 12, border: '2px solid #1e2d4a' }}
        />
        <span style={{
          position: 'absolute', bottom: -4, right: -4,
          width: 16, height: 16, borderRadius: '50%',
          background: statusColor, border: '2px solid #0f1525',
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700 }}>
            {player.personaname}
          </h2>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20,
            background: `${statusColor}22`, color: statusColor, fontWeight: 600,
          }}>
            {status}
          </span>
        </div>
        {player.loccountrycode && (
          <p style={{ fontSize: 12, color: '#8892b0', marginTop: 2 }}>
            📍 {player.loccountrycode}
          </p>
        )}
        <a
          href={player.profileurl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: '#00d4aa', marginTop: 4, display: 'inline-block' }}
        >
          View Steam Profile ↗
        </a>
      </div>

      <div style={{ display: 'flex', gap: 16, flexShrink: 0, flexWrap: 'wrap' }}>
        {[
          { label: 'Games Owned', value: totalGames?.toLocaleString() ?? '—' },
          { label: 'Total Hours', value: totalHours ? `${totalHours.toLocaleString()}h` : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', borderRadius: 12,
            padding: '14px 20px', textAlign: 'center', minWidth: 100,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#00d4aa', fontFamily: 'Space Grotesk' }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: '#8892b0', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
