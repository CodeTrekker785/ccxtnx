import { timingSafeEqual } from 'node:crypto';
import { submitLiveMarketOrder } from '../services/orderService.js';

function authorized(req) {
  const expected = process.env.C_TRADER_LIVE_TOKEN || '';
  const header = req.headers.authorization || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function postLiveOrder(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: 'Valid live-trading access token required.' });
  const { exchange, symbol, side, amount } = req.body || {};
  if (typeof exchange !== 'string' || typeof symbol !== 'string' || typeof side !== 'string' || typeof amount !== 'number') {
    return res.status(400).json({ error: 'Provide exchange, symbol, side, and numeric USD amount.' });
  }
  try {
    const order = await submitLiveMarketOrder({ exchange, symbol, side, amountUsd: amount });
    return res.status(201).json({ ok: true, order, warning: 'Order submitted to the exchange. Verify its final fill and fees in your exchange account.' });
  } catch (error) {
    const status = Number(error.status) || 502;
    return res.status(status).json({ error: status >= 500 ? 'Live order could not be completed.' : error.message });
  }
}
