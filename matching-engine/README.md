# Matching engine (optional)

The initial matching-engine module is reserved for **paper trading only**. It must not be connected to exchange accounts or real funds. A production internal matching engine would need price-time priority, durable order state, idempotency, audit trails, reconciliation, and extensive tests.

The current demo trading flow is client-side simulation. The public market API in `backend/src/server.js` fetches public ticker data through CCXT; it does not match or execute live orders.
