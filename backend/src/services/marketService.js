import ccxt from 'ccxt';
import { exchangeIds, requestTimeoutMs } from '../config/exchanges.js';

export async function fetchPublicTicker(exchange, symbol) {
  if (!exchangeIds.includes(exchange)) {
    const error = new Error('Unsupported exchange.');
    error.status = 400;
    throw error;
  }
  const Adapter = ccxt[exchange];
  if (!Adapter) {
    const error = new Error('Exchange adapter unavailable.');
    error.status = 400;
    throw error;
  }
  const client = new Adapter({ enableRateLimit: true, timeout: requestTimeoutMs });
  try {
    const ticker = await client.fetchTicker(symbol.replace('-', '/'));
    return { exchange, symbol, last: ticker.last, bid: ticker.bid, ask: ticker.ask, percentage: ticker.percentage, timestamp: ticker.timestamp };
  } finally {
    if (client.close) await client.close().catch(() => {});
  }
}
