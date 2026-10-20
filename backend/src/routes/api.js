import { Router } from 'express';
import { exchangeIds } from '../config/exchanges.js';
import { getTicker } from '../controllers/marketController.js';

const router = Router();
router.get('/health', (_req, res) => res.json({ ok: true, service: 'C Trader API', liveTrading: false }));
router.get('/exchanges', (_req, res) => res.json({ exchanges: exchangeIds }));
router.get('/markets/:exchange/:symbol/ticker', getTicker);
export default router;
