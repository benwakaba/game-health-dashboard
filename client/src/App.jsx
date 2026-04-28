import React, { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import PlayerProfile from './components/PlayerProfile.jsx';
import RecentGames from './components/RecentGames.jsx';
import TopGames from './components/TopGames.jsx';
import HealthTimer from './components/HealthTimer.jsx';
import HealthReminder from './components/HealthReminder.jsx';
import { useHealthTimer } from './hooks/useHealthTimer.js';

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_PLAYER = {
  personaname: 'DemoGamer',
  avatarfull: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  personastate: 1,
  profileurl: 'https://store.steampowered.com/',
  loccountrycode: 'US',
};

const DEMO_RECENT = [
  { appid: 730,   name: 'Counter-Strike 2',          playtime_2weeks: 312, playtime_forever: 4820 },
  { appid: 570,   name: 'Dota 2',                    playtime_2weeks: 180, playtime_forever: 12400 },
  { appid: 1172470, name: 'Apex Legends',            playtime_2weeks: 240, playtime_forever: 3200 },
  { appid: 292030, name: 'The Witcher 3',            playtime_2weeks: 90,  playtime_forever: 9800 },
  { appid: 1245620, name: 'Elden Ring',              playtime_2weeks: 150, playtime_forever: 5600 },
  { appid: 413150, name: 'Stardew Valley',           playtime_2weeks: 60,  playtime_forever: 2100 },
];

const DEMO_GAMES = [
  ...DEMO_RECENT,
  { appid: 440,    name: 'Team Fortress 2',          playtime_forever: 18000 },
  { appid: 4000,   name: "Garry's Mod",              playtime_forever: 7200 },
  { appid: 271590, name: 'Grand Theft Auto V',       playtime_forever: 6400 },
  { appid: 252950, name: 'Rocket League',            playtime_forever: 5100 },
  { appid: 20900,  name: 'The Elder Scrolls V: Skyrim', playtime_forever: 14300 },
  { appid: 49520,  name: 'Borderlands 2',            playtime_forever: 3800 },
];
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function App() {
  const [player, setPlayer] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const timer = useHealthTimer();

  const loadPlayer = useCallback(async (input) => {
    setLoading(true);
    setError(null);
    setPlayer(null);
    setRecentGames([]);
    setAllGames([]);
    setIsDemo(false);

    try {
      // Determine if input is a Steam ID (numeric) or vanity URL
      let steamId = input;
      if (!/^\d{17}$/.test(input)) {
        const resolveData = await apiFetch(`/api/resolve/${encodeURIComponent(input)}`);
        if (resolveData.response?.success !== 1) {
          throw new Error('Could not resolve that vanity URL. Try a 17-digit Steam ID.');
        }
        steamId = resolveData.response.steamid;
      }

      const [summaryData, recentData, gamesData] = await Promise.all([
        apiFetch(`/api/player/${steamId}/summary`),
        apiFetch(`/api/player/${steamId}/recent`),
        apiFetch(`/api/player/${steamId}/games`),
      ]);

      setPlayer(summaryData.response?.players?.[0] ?? null);
      setRecentGames(recentData.response?.games ?? []);
      setAllGames(gamesData.response?.games ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDemo = () => {
    setError(null);
    setIsDemo(true);
    setPlayer(DEMO_PLAYER);
    setRecentGames(DEMO_RECENT);
    setAllGames(DEMO_GAMES);
  };

  const totalHours = allGames.length
    ? Math.round(allGames.reduce((sum, g) => sum + g.playtime_forever, 0) / 60)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header />

      {timer.reminder && (
        <HealthReminder reminder={timer.reminder} onDismiss={timer.dismissReminder} />
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <HealthTimer timer={timer} />

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {isDemo && (
            <div style={{
              background: 'rgba(124,77,255,0.1)', border: '1px solid rgba(124,77,255,0.3)',
              borderRadius: 10, padding: '10px 18px', fontSize: 13, color: '#a78bfa',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>✨</span>
              <span>
                <strong>Demo Mode</strong> — showing sample data. Enter a real Steam ID above to see live stats.
              </span>
            </div>
          )}

          <SearchBar onSearch={loadPlayer} onDemo={loadDemo} loading={loading} />

          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#8892b0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚙️</div>
              <p>Loading Steam data…</p>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
              borderRadius: 12, padding: '16px 20px', color: '#ff4757', fontSize: 14,
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {player && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
              <PlayerProfile
                player={player}
                totalGames={allGames.length || null}
                totalHours={totalHours}
              />

              {recentGames.length > 0 && <RecentGames games={recentGames} />}

              {allGames.length > 0 && <TopGames games={allGames} />}

              {recentGames.length === 0 && allGames.length === 0 && (
                <div style={{
                  background: '#0f1525', border: '1px solid #1e2d4a',
                  borderRadius: 16, padding: '40px', textAlign: 'center', color: '#8892b0',
                }}>
                  <p style={{ fontSize: 32, marginBottom: 12 }}>🔒</p>
                  <p>This profile's game data is private.</p>
                </div>
              )}
            </div>
          )}

          {!player && !loading && !error && (
            <div style={{
              textAlign: 'center', padding: '60px 0', color: '#8892b0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 56 }}>🎮</span>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 18, color: '#4a5568' }}>
                Search for a Steam player to get started
              </h3>
              <p style={{ fontSize: 13, maxWidth: 380, lineHeight: 1.7 }}>
                Enter your Steam ID above, or click <strong style={{ color: '#a78bfa' }}>Demo Mode</strong> to
                preview the dashboard. Start a health session in the sidebar to track breaks.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
