import ccxt from 'ccxt';
import { exchangeIds, requestTimeoutMs } from '../config/exchanges.js';

const credentialEnv = {
  binance: ['BINANCE_API_KEY', 'BINANCE_API_SECRET'],
  kraken: ['KRAKEN_API_KEY', 'KRAKEN_API_SECRET'],
  coinbase: ['COINBASE_API_KEY', 'COINBASE_API_SECRET'],
  okx: ['OKX_API_KEY', 'OKX_API_SECRET'],
  bybit: ['BYBIT_API_KEY', 'BYBIT_API_SECRET'],
  kucoin: ['KUCOIN_API_KEY', 'KUCOIN_API_SECRET'],
  bitget: ['BITGET_API_KEY', 'BITGET_API_SECRET'],
  gateio: ['GATEIO_API_KEY', 'GATEIO_API_SECRET'],
};

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

export async function submitLiveMarketOrder({ exchange, symbol, side, amountUsd }) {
  if (process.env.LIVE_TRADING_ENABLED !== 'true') fail('Live trading is disabled by server configuration.', 403);
  if (!exchangeIds.includes(exchange)) fail('Unsupported exchange.');
  if (!/^[A-Z0-9]{2,15}\/[A-Z0-9]{2,15}$/.test(symbol)) fail('Invalid market symbol.');
  if (!['buy', 'sell'].includes(side)) fail('Side must be buy or sell.');
  if (!Number.isFinite(amountUsd) || amountUsd < 5 || amountUsd > Number(process.env.LIVE_MAX_ORDER_USD || 100)) {
    fail(`Order must be between $5 and $${Number(process.env.LIVE_MAX_ORDER_USD || 100)} USD.`);
  }
  const [keyName, secretName] = credentialEnv[exchange];
  const apiKey = process.env[keyName];
  const secret = process.env[secretName];
  if (!apiKey || !secret) fail(`Server-side API credentials are not configured for ${exchange}.`, 503);

  const Adapter = ccxt[exchange];
  if (!Adapter) fail('Exchange adapter unavailable.', 503);
  const client = new Adapter({
    apiKey,
    secret,
    password: process.env[`${exchange.toUpperCase()}_API_PASSWORD`] || undefined,
    enableRateLimit: true,
    timeout: requestTimeoutMs,
    options: { defaultType: 'spot' },
  });
  try {
    await client.loadMarkets();
    const market = client.market(symbol);
    if (!market || !market.active || !market.spot) fail('This active spot market is unavailable.');
    const ticker = await client.fetchTicker(symbol);
    if (!Number.isFinite(ticker.last) || ticker.last <= 0) fail('Exchange did not return a valid market price.', 502);
    const quantity = amountUsd / ticker.last;
    const roundedQuantity = Number(client.amountToPrecision(symbol, quantity));
    if (!Number.isFinite(roundedQuantity) || roundedQuantity <= 0) fail('Order quantity is below exchange precision.');
    const notional = roundedQuantity * ticker.last;
    if (market.limits?.cost?.min && notional < market.limits.cost.min) fail('Order is below this market minimum.');
    if (market.limits?.amount?.min && roundedQuantity < market.limits.amount.min) fail('Order quantity is below this market minimum.');
    if (market.limits?.amount?.max && roundedQuantity > market.limits.amount.max) fail('Order quantity exceeds this market maximum.');
    const order = await client.createOrder(symbol, 'market', side, roundedQuantity);
    return {
      id: order.id,
      exchange,
      symbol,
      side,
      type: 'market',
      requestedUsd: amountUsd,
      amount: order.amount ?? roundedQuantity,
      filled: order.filled ?? null,
      average: order.average ?? null,
      status: order.status ?? 'submitted',
      timestamp: order.timestamp ?? Date.now(),
    };
  } finally {
    if (client.close) await client.close().catch(() => {});
  }
}
