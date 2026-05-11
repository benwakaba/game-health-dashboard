import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import nock from 'nock';
import { app } from '../index.js';

const STEAM = 'https://api.steampowered.com';

// Block real outbound HTTP but allow 127.0.0.1 so supertest can reach Express
beforeAll(() => {
  nock.disableNetConnect();
  nock.enableNetConnect('127.0.0.1');
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

beforeEach(() => {
  process.env.STEAM_API_KEY = 'test-key-123';
});

afterEach(() => {
  nock.cleanAll();
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
    nock(STEAM)
      .get('/ISteamUser/ResolveVanityURL/v1/')
      .query(true)
      .reply(200, { response: { steamid: '76561198028291995', success: 1 } });

    const res = await request(app).get('/api/resolve/gaben');
    expect(res.status).toBe(200);
    expect(res.body.response.steamid).toBe('76561198028291995');
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/resolve/gaben');
    expect(res.status).toBe(503);
    expect(nock.pendingMocks()).toHaveLength(0); // no upstream call was made
  });

  it('returns 500 when Steam API throws', async () => {
    nock(STEAM)
      .get('/ISteamUser/ResolveVanityURL/v1/')
      .query(true)
      .replyWithError('Steam is down');

    const res = await request(app).get('/api/resolve/gaben');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Steam is down/);
  });
});

// ─── /api/player/:steamId/summary ────────────────────────────────────────────

describe('GET /api/player/:steamId/summary', () => {
  it('proxies the Steam player summary', async () => {
    nock(STEAM)
      .get('/ISteamUser/GetPlayerSummaries/v2/')
      .query(true)
      .reply(200, { response: { players: [{ personaname: 'TestPlayer', steamid: '76561198189486707' }] } });

    const res = await request(app).get('/api/player/76561198189486707/summary');
    expect(res.status).toBe(200);
    expect(res.body.response.players[0].personaname).toBe('TestPlayer');
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/player/123/summary');
    expect(res.status).toBe(503);
  });

  it('returns 500 on upstream error', async () => {
    nock(STEAM)
      .get('/ISteamUser/GetPlayerSummaries/v2/')
      .query(true)
      .replyWithError('timeout');

    const res = await request(app).get('/api/player/123/summary');
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/timeout/);
  });
});

// ─── /api/player/:steamId/recent ─────────────────────────────────────────────

describe('GET /api/player/:steamId/recent', () => {
  it('returns recently played games', async () => {
    nock(STEAM)
      .get('/IPlayerService/GetRecentlyPlayedGames/v1/')
      .query(true)
      .reply(200, { response: { games: [{ appid: 730, name: 'CS2', playtime_forever: 100 }] } });

    const res = await request(app).get('/api/player/123/recent');
    expect(res.status).toBe(200);
    expect(res.body.response.games).toHaveLength(1);
    expect(res.body.response.games[0].name).toBe('CS2');
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/player/123/recent');
    expect(res.status).toBe(503);
  });
});

// ─── /api/player/:steamId/games ──────────────────────────────────────────────

describe('GET /api/player/:steamId/games', () => {
  it('returns owned games list', async () => {
    nock(STEAM)
      .get('/IPlayerService/GetOwnedGames/v1/')
      .query(true)
      .reply(200, { response: { game_count: 2, games: [{ appid: 730 }, { appid: 570 }] } });

    const res = await request(app).get('/api/player/123/games');
    expect(res.status).toBe(200);
    expect(res.body.response.game_count).toBe(2);
  });

  it('returns 503 when API key is missing', async () => {
    process.env.STEAM_API_KEY = '';
    const res = await request(app).get('/api/player/123/games');
    expect(res.status).toBe(503);
  });
});
