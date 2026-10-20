# C Trader live trading

C Trader can submit spot market orders through the server-side CCXT adapter when the operator deliberately enables live trading. This is not enabled by default.

## Required server configuration

1. Deploy the backend behind HTTPS. Do not expose it on an untrusted public URL without proper user authentication, authorization, monitoring and rate limits.
2. Copy `backend/.env.example` into the deployment's secret/environment configuration. Do not commit the real file.
3. Generate a long random `C_TRADER_LIVE_TOKEN`; configure it only in the backend secret store and enter it in the app's live connection dialog.
4. Add exchange API credentials for the chosen exchange on the backend only. Use a dedicated API key with **spot trading only**, no withdrawal permission, and IP allowlisting when supported.
5. Start with `LIVE_TRADING_ENABLED=false`. After verifying the HTTPS deployment, credentials, account permissions, market symbols and order limits, deliberately set it to `true`.
6. Keep `LIVE_MAX_ORDER_USD` low while testing. The endpoint enforces a minimum order of $5 and a configurable maximum (default $100). Exchange minimums/precision may still reject an order.

## Current behavior and limits

- `GET /api/markets/:exchange/:symbol/ticker` fetches public exchange ticker data.
- `POST /api/order` requires a bearer token and submits a spot market order using server-side credentials.
- The order amount is an approximate USD-denominated notional converted to base-asset quantity using the latest ticker. It is not a guaranteed fill price or exact quote cost.
- The response is a submission result, not a guarantee that an order fully filled. Verify status, fill amount and fees directly with the exchange.
- The current access token is a single-operator gate, **not a multi-user account system**. Do not use this configuration as a public production trading service for multiple customers.
- There is no durable order database, user account system, encrypted per-user API-key vault, WebSocket market stream, advanced order types, or production audit/reconciliation service yet.
- Demo trades remain local simulated trades and are not exchange orders.

Never put exchange API secrets in the web bundle, mobile app, Git repository, issue, or chat. Crypto trading can lose money; use demo mode first.
