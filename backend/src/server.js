import express from 'express';
import apiRouter from './routes/api.js';
import { notFound } from './middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));

const port = Number(process.env.PORT || 8787);
const origins = new Set((process.env.C_TRADER_ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(x => x.trim()).filter(Boolean));

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

app.use('/api', apiRouter);
app.use(notFound);
app.listen(port, '0.0.0.0', () => console.log(`C Trader API listening on ${port}`));
