import express from 'express';
import ccxt from 'ccxt';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
const port = Number(process.env.PORT || 8787);
const accessToken = process.env.C_TRADER_ACCESS_TOKEN || '';
const allowedOrigins = (process.env.C_TRADER_ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
const supported = new Set(['binance','kraken','coinbase','okx','bybit','kucoin','bitget','gateio']);
app.use((req,res,next)=>{
  const origin=req.headers.origin;
  if(origin && allowedOrigins.includes(origin)) { res.setHeader('Access-Control-Allow-Origin',origin); res.setHeader('Vary','Origin'); }
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  if(req.method==='OPTIONS') return res.sendStatus(204);
  next();
});
function requireToken(req,res,next) {
  if(!accessToken) return res.status(503).json({error:'Live trading is disabled: configure C_TRADER_ACCESS_TOKEN on the server.'});
  const supplied=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  if(supplied.length!==accessToken.length || !safeEqual(supplied,accessToken)) return res.status(401).json({error:'Unauthorized'});
  next();
}
function safeEqual(a,b) {
  // Constant-time comparison without external dependencies.
  let mismatch=0; for(let i=0;i<Math.max(a.length,b.length);i++) mismatch|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0); return mismatch===0;
}
function makeExchange(id) {
  if(!supported.has(id)) throw new Error('Unsupported exchange.');
  const Exchange=ccxt[id];
  if(!Exchange) throw new Error('Exchange adapter unavailable.');
  const prefix=id.toUpperCase().replace(/[^A-Z0-9]/g,'_');
  const apiKey=process.env[`C_TRADER_${prefix}_API_KEY`]||'';
  const secret=process.env[`C_TRADER_${prefix}_SECRET`]||'';
  const password=process.env[`C_TRADER_${prefix}_PASSWORD']||'';
  if(!apiKey||!secret) throw new Error(`Server credentials are not configured for ${id}.`);
  return new Exchange({apiKey,secret,password:password||undefined,enableRateLimit:true,timeout:15000,options:{defaultType:'spot'}});
}
app.get('/api/health',(req,res)=>{
  if(!accessToken) return res.status(503).json({ok:false,error:'Live trading is not configured.'});
  return requireToken(req,res,()=>res.json({ok:true,service:'C Trader API',liveTrading:true}));
});
app.post('/api/order',requireToken,async(req,res)=>{
  const {exchange,symbol,side,amount}=req.body||{};
  if(!supported.has(exchange)) return res.status(400).json({error:'Unsupported exchange.'});
  if(!/^[A-Z0-9]{2,15}\/[A-Z0-9]{2,15}$/.test(String(symbol||''))) return res.status(400).json({error:'Invalid market symbol.'});
  if(!['buy','sell'].includes(side)) return res.status(400).json({error:'Side must be buy or sell.'});
  const cost=Number(amount);
  if(!Number.isFinite(cost)||cost<=0||cost>Number(process.env.C_TRADER_MAX_ORDER_USD||100)) return res.status(400).json({error:'Order amount is invalid or exceeds C_TRADER_MAX_ORDER_USD.'});
  let client;
  try {
    client=makeExchange(exchange);
    await client.loadMarkets();
    const market=client.market(symbol);
    if(!market || !market.spot || market.active===false) return res.status(400).json({error:'Spot market is unavailable.'});
    const ticker=await client.fetchTicker(symbol);
    const last=Number(ticker.last);
    if(!Number.isFinite(last)||last<=0) return res.status(502).json({error:'Exchange returned an invalid price.'});
    const quantity=Number(client.amountToPrecision(symbol,cost/last));
    if(!Number.isFinite(quantity)||quantity<=0) return res.status(400).json({error:'Order size is below the exchange minimum.'});
    // Live orders are deliberately limited to spot market orders. Withdrawal permissions are not needed.
    const order=await client.createOrder(symbol,'market',side,quantity);
    return res.status(201).json({id:order.id,status:order.status||'submitted',exchange,symbol,side,amount:cost,quantity:order.amount??quantity,submittedAt:new Date().toISOString()});
  } catch(error) {
    return res.status(400).json({error:String(error?.message||'Exchange order failed').slice(0,240)});
  } finally { if(client) await client.close?.().catch(()=>{}); }
});
app.listen(port,'0.0.0.0',()=>console.log(`C Trader API listening on ${port}`));
