const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const STEAM = 'https://api.steampowered.com';

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Read key at request time so tests can stub process.env
function getKey() {
  return process.env.STEAM_API_KEY;
}

function noKey(res) {
  return res.status(503).json({ error: 'STEAM_API_KEY not set in .env' });
}

// Resolve a vanity URL (e.g. "gaben") to a 64-bit Steam ID
app.get('/api/resolve/:vanity', async (req, res) => {
  const key = getKey();
  if (!key) return noKey(res);
  try {
    const { data } = await axios.get(`${STEAM}/ISteamUser/ResolveVanityURL/v1/`, {
      params: { key, vanityurl: req.params.vanity },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Player profile summary
app.get('/api/player/:steamId/summary', async (req, res) => {
  const key = getKey();
  if (!key) return noKey(res);
  try {
    const { data } = await axios.get(`${STEAM}/ISteamUser/GetPlayerSummaries/v2/`, {
      params: { key, steamids: req.params.steamId },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recently played games (last 2 weeks)
app.get('/api/player/:steamId/recent', async (req, res) => {
  const key = getKey();
  if (!key) return noKey(res);
  try {
    const { data } = await axios.get(`${STEAM}/IPlayerService/GetRecentlyPlayedGames/v1/`, {
      params: { key, steamid: req.params.steamId, count: 10 },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All owned games with playtime
app.get('/api/player/:steamId/games', async (req, res) => {
  const key = getKey();
  if (!key) return noKey(res);
  try {
    const { data } = await axios.get(`${STEAM}/IPlayerService/GetOwnedGames/v1/`, {
      params: {
        key,
        steamid: req.params.steamId,
        include_appinfo: 1,
        include_played_free_games: 1,
      },
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (_, res) =>
  res.json({ ok: true, keySet: !!getKey() })
);

// Only bind the port when run directly, not when imported by tests
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`🎮 Game Health Dashboard API → http://localhost:${PORT}`)
  );
}

module.exports = { app };
