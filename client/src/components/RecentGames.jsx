import React from 'react';

function GameCard({ game }) {
  const imgUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`;
  const hrs2wk = (game.playtime_2weeks / 60).toFixed(1);
  const hrsTotal = (game.playtime_forever / 60).toFixed(0);

  return (
    <div style={{
      background: '#141c30', border: '1px solid #1e2d4a', borderRadius: 12,
      overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseOver={e => { e.currentTarget.style.borderColor = '#00d4aa33'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = '#1e2d4a'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <img
        src={imgUrl}
        alt={game.name}
        style={{ width: '100%', height: 90, objectFit: 'cover', display: 'block' }}
        onError={e => { e.target.style.display = 'none'; }}
      />
      <div style={{ padding: '12px' }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: '#e8eaf6',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 8,
        }}>
          {game.name}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: '#8892b0' }}>Last 2 weeks</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#00d4aa' }}>{hrs2wk}h</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#8892b0' }}>Total</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaf6' }}>{hrsTotal}h</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecentGames({ games }) {
  if (!games?.length) return null;

  return (
    <div>
      <h3 style={{
        fontFamily: 'Space Grotesk', fontSize: 16, marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        🕹️ Recently Played
        <span style={{
          fontSize: 11, color: '#8892b0', fontFamily: 'Inter',
          fontWeight: 400,
        }}>
          — last 2 weeks
        </span>
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12,
      }}>
        {games.map(g => <GameCard key={g.appid} game={g} />)}
      </div>
    </div>
  );
}
