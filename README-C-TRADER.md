# C Trader

Multi-exchange cryptocurrency dashboard for web and Android, built around the CCXT ecosystem.

## Modules

- `backend/` — Express API and public CCXT ticker data.
- `frontend-web/` — Vite web client shared with Android.
- `mobile-app/` — Capacitor Android wrapper configuration.
- `matching-engine/` — optional Go simulation-only service scaffold.
- `docs/` — architecture and API notes.
- `c-trader/` — original prototype retained while the monorepo is validated.
- `docker-compose.yml` — existing CCXT development service plus optional C Trader services.

## Local development

Requires Node.js 20+ and npm.

```sh
cd frontend-web
npm install
npm run dev
```

Run the API in another terminal:

```sh
cd backend
npm install
npm start
```

The API defaults to port 8787. The Vite client defaults to port 5173. Set `C_TRADER_ALLOWED_ORIGINS` to the exact web client origin.

## Android

Build the web client, then from the repository root:

```sh
cd frontend-web && npm install && npm run build
cd ../mobile-app && npm install && npx cap add android && npx cap sync android
```

The CI workflow builds a debug APK artifact. Debug APKs are for testing and are not Play Store-signed releases.

## Trading safety

Demo trading is simulated. The new backend serves public market data only and reports live trading as disabled. Real trading requires a secured backend with user authentication, authorization, server-side API key storage, strict order validation, audit logs and rate limits. Never embed exchange secrets in frontend code or Android APKs.
