import { Router } from 'express';
import { exchangeIds } from '../config/exchanges.js';
import { getTicker } from '../controllers/marketController.js';
import { postLiveOrder } from '../controllers/orderController.js';

const router = Router();
router.get('/health', (_req, res) => res.json({ ok: true, service: 'C Trader API', liveTrading: process.env.LIVE_TRADING_ENABLED === 'true' && Boolean(process.env.C_TRADER_LIVE_TOKEN) }));
router.get('/exchanges', (_req, res) => res.json({ exchanges: exchangeIds }));
router.get('/markets/:exchange/:symbol/ticker', getTicker);
router.post('/order', postLiveOrder);
export default router;
