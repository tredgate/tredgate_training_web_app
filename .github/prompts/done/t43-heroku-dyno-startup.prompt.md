# T43 — Heroku Dyno Startup for Vite SPA

## Context
Deploy the frontend-only Vite app to Heroku dyno without backend or secrets.

## Problem
Heroku dyno crashed on startup with:

- `sh: 1: vite: not found`

Root cause: `vite` is a `devDependency`, not available in production runtime.

## Implementation
- Updated npm scripts in `package.json`:
  - `start` => `node server.mjs`
  - `heroku-postbuild` => `npm run build`
- Added `server.mjs` static server:
  - serves `dist/`
  - binds `0.0.0.0`
  - uses `PORT`
  - SPA fallback to `index.html`

## Validation
- Local build passes (`npm run build`)
- Local start passes (`PORT=5050 npm run start`)
- Heroku deployment confirmed working

## Done Criteria
- Dyno starts with `npm start` in production
- App is reachable on Heroku URL without `vite` runtime dependency
