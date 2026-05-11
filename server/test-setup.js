// Pre-set env vars before any module is imported by tests.
// This runs before index.js loads, so dotenv won't override these.
process.env.STEAM_API_KEY = 'test-key-123';
process.env.PORT = '3099';
