# C Trader

C Trader is a mobile-friendly cryptocurrency market dashboard with a Capacitor Android wrapper, demo/paper trading, and an optional server-side CCXT spot-order API.

## Features

- Responsive web app and Android APK build through GitHub Actions.
- Public market prices via CoinGecko, with clearly labelled fallback sample prices if the feed is unavailable.
- Exchange selector for Binance, Kraken, Coinbase, OKX, Bybit, KuCoin, Bitget and Gate.io.
- Virtual USD balance, buy/sell paper trades, estimated fees, holdings and recent activity.
- Optional live spot market orders through a separate Node.js backend. Exchange credentials stay on the server; the browser never receives exchange API secrets.

## Run the web app

Requires Node.js 20+.

```sh
cd c-trader
npm install
npm run dev
```

## Android build

The GitHub Actions workflow generates the Capacitor Android project during CI, builds a debug APK and uploads it as an Actions artifact. The APK is a test build, not a Play Store-signed release.

## Enable live trading (optional, high risk)

Run the API server on a trusted HTTPS host. Configure environment variables on the server only:

- `C_TRADER_ACCESS_TOKEN`: long random private token used by the app to authenticate to this single-user prototype API.
- `C_TRADER_ALLOWED_ORIGINS`: comma-separated exact web origins allowed by CORS.
- Exchange credentials: `C_TRADER_BINANCE_API_KEY`, `C_TRADER_BINANCE_SECRET`, or equivalent `C_TRADER_<EXCHANGE>_API_KEY` and `C_TRADER_<EXCHANGE>_SECRET`. Some exchanges may also require `C_TRADER_<EXCHANGE>_PASSWORD`.
- `C_TRADER_MAX_ORDER_USD`: maximum order amount in quote-currency units (default 100).

Then run `npm run server`. The server exposes `GET /api/health` and `POST /api/order`. In the app, choose Demo trading → connect backend, and enter the HTTPS API URL and access token. The token is held in memory only for the current page session.

**Security requirements:** use exchange API keys with trading permission only; disable withdrawals and transfers; restrict API keys by IP when supported; start with tiny amounts; keep the backend private; use a strong token; configure exact CORS origins; never commit credentials or put exchange secrets in the app. This is a minimal single-operator prototype, not a multi-user production service. Add proper user authentication, per-user authorization, audit logs, rate limiting, monitoring, and exchange-specific order validation before public deployment.

Live order sizes are estimated from the latest ticker and can differ due to slippage, fees, precision and market movement. This app does not custody funds and does not provide investment advice.
