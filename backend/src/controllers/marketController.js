import { fetchPublicTicker } from '../services/marketService.js';
import { isMarketSymbol } from '../utils/validation.js';

export async function getTicker(req, res) {
  const { exchange, symbol } = req.params;
  if (!isMarketSymbol(symbol)) return res.status(400).json({ error: 'Use a symbol such as BTC-USDT.' });
  try {
    const ticker = await fetchPublicTicker(exchange, symbol);
    res.setHeader('Cache-Control', 'public, max-age=5');
    return res.json(ticker);
  } catch (error) {
    const status = Number(error.status) || 502;
    return res.status(status).json({ error: status === 502 ? 'Market data provider unavailable.' : error.message, detail: status === 502 ? String(error.message || '').slice(0, 160) : undefined });
  }
}
