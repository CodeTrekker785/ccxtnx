import express from 'express';
import ccxt from 'ccxt';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
const port = Number(process.env.PORT || 8787);
const origins = new Set((process.env.C_TRADER_ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(x => x.trim()).filter(Boolean));
const exchangeIds = ['binance', 'kraken', 'coinbase', 'okx', 'bybit', 'kucoin', 'bitget', 'gateio'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'C Trader API', liveTrading: false }));
app.get('/api/exchanges', (_req, res) => res.json({ exchanges: exchangeIds }));

app.get('/api/markets/:exchange/:symbol/ticker', async (req, res) => {
  const { exchange, symbol } = req.params;
  if (!exchangeIds.includes(exchange)) return res.status(400).json({ error: 'Unsupported exchange.' });
  if (!/^[A-Z0-9]{2,15}-[A-Z0-9]{2,15}$/.test(symbol)) return res.status(400).json({ error: 'Use a symbol such as BTC-USDT.' });
  let client;
  try {
    const Adapter = ccxt[exchange];
    if (!Adapter) return res.status(400).json({ error: 'Exchange adapter unavailable.' });
    client = new Adapter({ enableRateLimit: true, timeout: 12000 });
    const ticker = await client.fetchTicker(symbol.replace('-', '/'));
    res.setHeader('Cache-Control', 'public, max-age=5');
    return res.json({ exchange, symbol, last: ticker.last, bid: ticker.bid, ask: ticker.ask, percentage: ticker.percentage, timestamp: ticker.timestamp });
  } catch (error) {
    return res.status(502).json({ error: 'Market data provider unavailable.', detail: String(error.message || '').slice(0, 160) });
  } finally {
    if (client?.close) await client.close().catch(() => {});
  }
});
app.use((_req, res) => res.status(404).json({ error: 'Not found.' }));
app.listen(port, '0.0.0.0', () => console.log(`C Trader API listening on ${port}`));
