import React from 'react';

export default function TopGames({ games }) {
  if (!games?.length) return null;

  const top = [...games]
    .filter(g => g.playtime_forever > 0)
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .slice(0, 8);

  const maxHrs = top[0]?.playtime_forever ?? 1;

  const barColor = (i) => {
    const colors = ['#00d4aa', '#7c4dff', '#ffa502', '#ff6b81', '#2ed573', '#eccc68', '#45aaf2', '#fd9644'];
    return colors[i % colors.length];
  };

  return (
    <div style={{
      background: '#0f1525', border: '1px solid #1e2d4a',
      borderRadius: 16, padding: '24px',
    }}>
      <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 16, marginBottom: 20 }}>
        🏆 Top Games by Playtime
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {top.map((g, i) => {
          const hrs = (g.playtime_forever / 60).toFixed(0);
          const pct = (g.playtime_forever / maxHrs) * 100;
          const color = barColor(i);
          const imgUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`;

          return (
            <div key={g.appid} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 20, fontSize: 12, color: '#8892b0',
                fontWeight: 700, textAlign: 'right', flexShrink: 0,
              }}>
                #{i + 1}
              </span>
              <img
                src={imgUrl}
                alt={g.name}
                style={{ width: 48, height: 28, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                onError={e => { e.target.style.visibility = 'hidden'; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: '#e8eaf6',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%',
                  }}>
                    {g.name}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color, flexShrink: 0 }}>
                    {parseInt(hrs).toLocaleString()}h
                  </span>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 4, height: 6, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 4,
                    background: color, transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
