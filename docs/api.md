# C Trader API

Base URL: the backend origin.

- `GET /api/health` — health and capability status; `liveTrading` is currently false.
- `GET /api/exchanges` — supported exchange IDs.
- `GET /api/markets/:exchange/:symbol/ticker` — public ticker; use symbol format `BTC-USDT`.

Unsupported exchanges and malformed symbols return HTTP 400. Provider failures return HTTP 502. This API does not place orders or access private balances.
