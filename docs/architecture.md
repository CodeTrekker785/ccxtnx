# C Trader architecture

```text
Browser / Capacitor Android
          |
          v
frontend-web (Vite SPA) <---- mobile-app (Capacitor shell)
          |
          v
backend (Express + CCXT public market data)
          |
          v
Supported exchange public APIs

matching-engine: optional simulation-only service, isolated by Compose profile
```

- `frontend-web/`: canonical browser UI, shared with Android through Capacitor.
- `mobile-app/`: Android shell configuration; web UI is built separately and synced into it.
- `backend/`: Express API, exchange allowlist, public ticker endpoint and origin allowlist.
- `matching-engine/`: optional Go health endpoint for future simulation work, not a live matching service.
- `c-trader/`: original prototype retained during transition.
- `.github/workflows/c-trader-build.yml`: web build, Android debug APK build and artifact upload.

## Security boundary

The new backend exposes public market data only. It does not accept private exchange credentials or execute live orders. Do not expose exchange secrets in web/mobile builds. Before adding multi-user live trading, implement authentication, authorization, server-side secret management, order limits, idempotency, audit logging, monitoring and exchange-specific validation.
