# 🎮 Game Health Dashboard

A full-stack React web app that pulls live Steam player stats and overlays healthy gaming reminders — because your eyes deserve breaks too.

## Features

- **Steam Integration** — look up any public Steam profile by Steam ID or vanity URL
- **Game Stats** — recently played games, top games by total playtime, hours played
- **Health Session Timer** — start a session to track how long you've been playing
- **Smart Break Reminders** — scheduled alerts at 20 min (eye break), 45 min (stretch), 1 hr (water), 90 min (movement), and 2 hr (long break)
- **Health Score** — gamified score that rewards you for taking breaks
- **Break Log** — timestamped history of breaks taken during your session
- **Demo Mode** — works without a Steam API key using sample data

## Tech Stack

| Layer    | Tech                     |
|----------|--------------------------|
| Frontend | React 18 + Vite          |
| Backend  | Node.js + Express        |
| API      | Steam Web API (proxied)  |
| Styling  | Vanilla CSS (dark theme) |

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd game-health-dashboard
npm install          # root deps (concurrently)
npm run install:all  # installs server + client deps
```

### 2. Configure Steam API Key

```bash
cp .env.example .env
# Edit .env and add your Steam API key
# Get one free at: https://steamcommunity.com/dev/apikey
```

### 3. Run

```bash
npm run dev
```

Opens at **http://localhost:5173** (client) with the API at **http://localhost:3001**.

## Without a Steam API Key

Click **Demo Mode** in the app to preview with sample data — no key needed.

## Project Structure

```
game-health-dashboard/
├── server/
│   └── index.js          # Express API proxy for Steam endpoints
└── client/
    └── src/
        ├── App.jsx
        ├── hooks/
        │   └── useHealthTimer.js   # Session timer + break scheduling logic
        └── components/
            ├── Header.jsx
            ├── SearchBar.jsx
            ├── PlayerProfile.jsx
            ├── RecentGames.jsx
            ├── TopGames.jsx
            ├── HealthTimer.jsx     # Sidebar timer widget with SVG ring
            └── HealthReminder.jsx  # Full-screen break modal
```

## Steam API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `ISteamUser/ResolveVanityURL/v1` | Convert custom URL slug → Steam ID |
| `ISteamUser/GetPlayerSummaries/v2` | Profile info, avatar, status |
| `IPlayerService/GetRecentlyPlayedGames/v1` | Games played in last 2 weeks |
| `IPlayerService/GetOwnedGames/v1` | Full library with total playtime |
