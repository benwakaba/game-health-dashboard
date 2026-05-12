import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';

// vi.mock is hoisted before imports, so both modules are mocked before
// index.js loads — dotenv becomes a no-op and axios.get becomes a spy.
vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));
vi.mock('axios', () => ({ default: { get: vi.fn() } }));

import axios from 'axios';
import { app } from '../index.js';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STEAM_API_KEY = 'test-key-123';
});

// ─── /api/health ─────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  it('returns ok:true when key is set', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, keySet: true });
  });

  it('returns keySet:false when key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.keySet).toBe(false);
  });
});

// ─── /api/resolve/:vanity ─────────────────────────────────────────────────────

describe('GET /api/resolve/:vanity', () => {
  it('resolves a vanity URL and returns Steam data', async () => {
    axios.get.mockResolvedValue({
      data: { response: { steamid: '76561198028291995', success: 1 } },
    });

    const res = await request(app).get('/api/resolve/gaben');
    expect(res.status).toBe(200);
    expect(res.body.response.steamid).toBe('76561198028291995');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('ResolveVanityURL'),
      expect.objectContaining({ params: expect.objectContaining({ vanityurl: 'gaben' }) })
    );
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/resolve/gaben');
    expect(res.status).toBe(503);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns 500 when Steam API throws', async () => {
    axios.get.mockRejectedValue(new Error('Steam is down'));
    const res = await request(app).get('/api/resolve/gaben');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Steam is down');
  });
});

// ─── /api/player/:steamId/summary ────────────────────────────────────────────

describe('GET /api/player/:steamId/summary', () => {
  it('proxies the Steam player summary', async () => {
    axios.get.mockResolvedValue({
      data: { response: { players: [{ personaname: 'TestPlayer', steamid: '76561198189486707' }] } },
    });

    const res = await request(app).get('/api/player/76561198189486707/summary');
    expect(res.status).toBe(200);
    expect(res.body.response.players[0].personaname).toBe('TestPlayer');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('GetPlayerSummaries'),
      expect.objectContaining({
        params: expect.objectContaining({ steamids: '76561198189486707' }),
      })
    );
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/player/123/summary');
    expect(res.status).toBe(503);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('returns 500 on upstream error', async () => {
    axios.get.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/player/123/summary');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('timeout');
  });
});

// ─── /api/player/:steamId/recent ─────────────────────────────────────────────

describe('GET /api/player/:steamId/recent', () => {
  it('returns recently played games', async () => {
    axios.get.mockResolvedValue({
      data: { response: { games: [{ appid: 730, name: 'CS2', playtime_forever: 100 }] } },
    });

    const res = await request(app).get('/api/player/123/recent');
    expect(res.status).toBe(200);
    expect(res.body.response.games).toHaveLength(1);
    expect(res.body.response.games[0].name).toBe('CS2');
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('GetRecentlyPlayedGames'),
      expect.objectContaining({ params: expect.objectContaining({ count: 10 }) })
    );
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/player/123/recent');
    expect(res.status).toBe(503);
    expect(axios.get).not.toHaveBeenCalled();
  });
});

// ─── /api/player/:steamId/games ──────────────────────────────────────────────

describe('GET /api/player/:steamId/games', () => {
  it('returns owned games with appinfo flags', async () => {
    axios.get.mockResolvedValue({
      data: { response: { game_count: 2, games: [{ appid: 730 }, { appid: 570 }] } },
    });

    const res = await request(app).get('/api/player/123/games');
    expect(res.status).toBe(200);
    expect(res.body.response.game_count).toBe(2);
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('GetOwnedGames'),
      expect.objectContaining({
        params: expect.objectContaining({ include_appinfo: 1, include_played_free_games: 1 }),
      })
    );
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/player/123/games');
    expect(res.status).toBe(503);
    expect(axios.get).not.toHaveBeenCalled();
  });
});
