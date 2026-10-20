import './style.css';

const state = {
  mode: 'demo',
  exchange: 'binance',
  currency: 'usd',
  markets: [],
  query: '',
  selected: 'bitcoin',
  balance: 10000,
  initialBalance: 10000,
  holdings: {},
  trades: [],
  lastUpdated: null,
  loading: true,
};
const symbols = {
  bitcoin: ['BTC', 'Bitcoin', '₿'],
  ethereum: ['ETH', 'Ethereum', '◆'],
  solana: ['SOL', 'Solana', '◎'],
  binancecoin: ['BNB', 'BNB', '◆'],
  ripple: ['XRP', 'XRP', '✕'],
  dogecoin: ['DOGE', 'Dogecoin', 'Ð'],
  cardano: ['ADA', 'Cardano', '₳'],
  avalanche: ['AVAX', 'Avalanche', '▲'],
};
const money = (n, digits = 2) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number(n) || 0);
const compact = n => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(Number(n) || 0);
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fallbackMarkets = [
  {id:'bitcoin',symbol:'BTC',name:'Bitcoin',current_price:67240.18,price_change_percentage_24h:2.84,market_cap:1320000000000,total_volume:28000000000,sparkline_in_7d:{price:[64000,64600,64100,65500,65000,66300,67240]}},
  {id:'ethereum',symbol:'ETH',name:'Ethereum',current_price:3528.71,price_change_percentage_24h:1.72,market_cap:423000000000,total_volume:12000000000,sparkline_in_7d:{price:[3380,3410,3390,3450,3480,3500,3528]}},
  {id:'solana',symbol:'SOL',name:'Solana',current_price:164.92,price_change_percentage_24h:-0.83,market_cap:76000000000,total_volume:2400000000,sparkline_in_7d:{price:[171,169,167,170,165,163,164]}},
  {id:'binancecoin',symbol:'BNB',name:'BNB',current_price:598.44,price_change_percentage_24h:0.61,market_cap:88000000000,total_volume:1200000000,sparkline_in_7d:{price:[585,590,587,594,591,596,598]}},
  {id:'ripple',symbol:'XRP',name:'XRP',current_price:0.6128,price_change_percentage_24h:3.24,market_cap:34000000000,total_volume:980000000,sparkline_in_7d:{price:[.58,.59,.585,.60,.596,.608,.613]}},
  {id:'dogecoin',symbol:'DOGE',name:'Dogecoin',current_price:0.1641,price_change_percentage_24h:-1.15,market_cap:23000000000,total_volume:620000000,sparkline_in_7d:{price:[.17,.168,.166,.169,.165,.163,.164]}},
  {id:'cardano',symbol:'ADA',name:'Cardano',current_price:0.4521,price_change_percentage_24h:0.45,market_cap:16000000000,total_volume:290000000,sparkline_in_7d:{price:[.44,.445,.442,.449,.447,.45,.452]}},
  {id:'avalanche-2',symbol:'AVAX',name:'Avalanche',current_price:36.42,price_change_percentage_24h:2.11,market_cap:14000000000,total_volume:310000000,sparkline_in_7d:{price:[34,34.5,35,34.8,35.5,36,36.42]}},
];

function appShell() {
  document.querySelector('#app').innerHTML = `
    <aside class="sidebar">
      <a class="brand" href="#" aria-label="C Trader home"><span class="brand-mark">C</span><span>C<span class="brand-light">Trader</span><small>CRYPTO TERMINAL</small></span></a>
      <div class="side-label">WORKSPACE</div>
      <button class="nav active" data-tab="markets"><span>▦</span> Markets</button>
      <button class="nav" data-tab="portfolio"><span>◒</span> Portfolio</button>
      <button class="nav" data-tab="orders"><span>↕</span> Trade history</button>
      <div class="side-label exchange-label">EXCHANGES</div>
      <label class="exchange-select"><span class="exchange-dot"></span><select id="exchange">
        <option value="binance">Binance</option><option value="kraken">Kraken</option><option value="coinbase">Coinbase</option><option value="okx">OKX</option><option value="bybit">Bybit</option><option value="kucoin">KuCoin</option><option value="bitget">Bitget</option><option value="gateio">Gate.io</option>
      </select><span>⌄</span></label>
      <div class="side-bottom"><div class="secure-icon">⌁</div><strong>Trade with care</strong><p>Crypto assets are volatile. Review every order before confirming.</p><span class="build-label">C TRADER · v1.0</span></div>
    </aside>
    <main class="main">
      <header class="topbar"><div class="mobile-brand"><span class="brand-mark">C</span> C Trader</div><div class="crumb">Workspace <span>/</span> <b id="crumb-current">Markets</b></div><div class="top-actions"><span class="connection"><i></i> <span id="connection-label">Public market data</span></span><button class="mode-toggle" id="mode-toggle"><span class="mode-dot"></span><span id="mode-label">Demo trading</span><span class="chevron">⌄</span></button><button class="avatar" title="C Trader">CT</button></div></header>
      <div class="page">
        <section class="welcome"><div><div class="eyebrow"><span class="live-pip"></span> MARKET OVERVIEW</div><h1>Trade smarter.<br/><span>See the whole market.</span></h1><p>Track crypto markets across your favorite exchanges in one workspace.</p></div><div class="welcome-art"><div class="orbit orbit-a"></div><div class="orbit orbit-b"></div><div class="coin coin-back">Ξ</div><div class="coin coin-front">₿</div><div class="art-spark">✦</div></div></section>
        <section class="stats-grid">
          <article class="stat-card"><div class="stat-head"><span>Total paper balance</span><span class="stat-icon">◈</span></div><div class="stat-value" id="balance-value">$10,000.00</div><div class="stat-foot"><span class="positive">●</span> Demo wallet · USD</div></article>
          <article class="stat-card"><div class="stat-head"><span>Portfolio value</span><span class="stat-icon">▥</span></div><div class="stat-value" id="portfolio-value">$10,000.00</div><div class="stat-foot"><span id="portfolio-note">No assets held yet</span></div></article>
          <article class="stat-card"><div class="stat-head"><span>Tracked markets</span><span class="stat-icon">↗</span></div><div class="stat-value" id="tracked-value">8</div><div class="stat-foot"><span class="positive">●</span> Live public prices</div></article>
        </section>
        <section class="content-grid">
          <article class="panel markets-panel" id="markets-panel"><div class="panel-head"><div><h2>Market watch</h2><p>Popular assets · USD</p></div><label class="search-box"><span>⌕</span><input id="search" placeholder="Search assets..." autocomplete="off"/></label></div><div class="table-scroll"><table><thead><tr><th>ASSET</th><th>PRICE</th><th>24H CHANGE</th><th>MARKET CAP</th><th>7D TREND</th><th></th></tr></thead><tbody id="market-rows"><tr><td colspan="6" class="loading-cell">Loading market data…</td></tr></tbody></table></div><div class="table-footer"><span id="market-status">Connecting to public market data…</span><button class="text-button" id="refresh">↻ Refresh prices</button></div></article>
          <article class="panel trade-panel"><div class="panel-head"><div><h2>Quick trade</h2><p id="trade-subtitle">Practice with virtual funds</p></div><span class="demo-badge" id="trade-badge">DEMO</span></div><div class="asset-picker"><div class="asset-icon" id="trade-asset-icon">₿</div><div class="asset-name"><strong id="trade-asset-name">Bitcoin</strong><small id="trade-asset-symbol">BTC / USD</small></div><div class="asset-price"><strong id="trade-asset-price">$67,240.18</strong><small id="trade-asset-change">+2.84%</small></div></div><div class="side-switch"><button class="side-btn buy selected" data-side="buy">Buy</button><button class="side-btn sell" data-side="sell">Sell</button></div><label class="field-label">Order amount (USD)</label><div class="amount-input"><span>$</span><input id="amount" type="number" min="1" step="1" value="100" inputmode="decimal"/><button id="max-amount">MAX</button></div><div class="trade-details"><div><span>Estimated quantity</span><b id="estimated-qty">0.001487 BTC</b></div><div><span>Order type</span><b>Market</b></div><div><span>Exchange</span><b id="trade-exchange">Binance</b></div><div><span>Estimated fee (0.1%)</span><b id="fee-value">$0.10</b></div></div><button class="primary-trade" id="submit-trade">Buy BTC <span>→</span></button><p class="risk-note"><span>ⓘ</span><span id="risk-copy">Demo mode uses virtual funds. No real order is sent.</span></p><div class="trade-error" id="trade-error" role="status"></div></article>
        </section>
        <section class="bottom-grid"><article class="panel holdings-panel"><div class="panel-head"><div><h2>Your holdings</h2><p>Assets in your current wallet</p></div><button class="text-button" data-tab="portfolio">View portfolio →</button></div><div id="holdings-list" class="holdings-list"><div class="empty-state"><span>◒</span><b>Your portfolio starts here</b><p>Place a demo trade to see your assets appear.</p></div></div></article><article class="panel activity-panel"><div class="panel-head"><div><h2>Recent activity</h2><p>Your latest orders</p></div><button class="text-button" data-tab="orders">View all →</button></div><div id="activity-list" class="activity-list"><div class="empty-state compact-empty">No trades yet</div></div></article></section>
        <footer><span>© 2026 C Trader</span><span>Market prices are informational only · Not financial advice</span><span class="footer-status"><i></i> <span id="updated-time">Initializing</span></span></footer>
      </div>
    </main>
    <div class="toast" id="toast" role="status"></div>
    <dialog id="live-dialog"><form method="dialog" class="dialog-card"><button class="dialog-close" value="cancel" aria-label="Close">×</button><div class="dialog-icon">⌁</div><div class="eyebrow">LIVE TRADING</div><h2>Connect your secure backend</h2><p>Real orders require a separately deployed C Trader API server, exchange API credentials stored on that server, and a private access token. Never paste exchange secret keys into this app.</p><label class="field-label" for="api-url">Backend URL</label><input id="api-url" class="dialog-input" type="url" placeholder="https://your-api.example.com" autocomplete="url"/><label class="field-label" for="api-token">Backend access token</label><input id="api-token" class="dialog-input" type="password" placeholder="Session-only token" autocomplete="off"/><div class="dialog-actions"><button class="secondary-button" value="cancel">Cancel</button><button class="primary-button" id="connect-live" value="connect">Test connection</button></div><p class="dialog-hint">Token remains in memory for this session only. Configure C_TRADER_ACCESS_TOKEN and exchange credentials on the backend.</p></form></dialog>
  `;
}

function getMarket(id) { return state.markets.find(m => m.id === id) || state.markets[0] || fallbackMarkets[0]; }
function iconFor(m) { return symbols[m.id]?.[2] || (m.symbol || '?').slice(0,1).toUpperCase(); }
function price(n) { if (n < 0.01) return '$' + n.toFixed(6); if (n < 1) return '$' + n.toFixed(4); return money(n); }
function sparkline(values, change) {
  const arr = (values || []).slice(-18); if (arr.length < 2) return '<span class="spark-empty">—</span>';
  const min = Math.min(...arr), max = Math.max(...arr), span = max-min || 1;
  const pts = arr.map((v,i)=>`${(i/(arr.length-1))*100},${26-((v-min)/span)*23}`).join(' ');
  return `<svg class="spark ${change >= 0 ? 'up' : 'down'}" viewBox="0 0 100 28" preserveAspectRatio="none" aria-label="7 day trend"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
function filteredMarkets() { return state.markets.filter(m => `${m.name} ${m.symbol}`.toLowerCase().includes(state.query.toLowerCase())); }
function renderMarkets() {
  const rows = filteredMarkets().map(m => {
    const change = Number(m.price_change_percentage_24h || 0), selected = m.id === state.selected;
    return `<tr class="${selected ? 'selected-row' : ''}" data-asset="${escapeHtml(m.id)}"><td><div class="market-asset"><span class="asset-mini">${escapeHtml(iconFor(m))}</span><span><b>${escapeHtml(m.name)}</b><small>${escapeHtml(m.symbol.toUpperCase())}</small></span></div></td><td class="price-cell">${price(Number(m.current_price))}</td><td><span class="change-pill ${change >= 0 ? 'positive-bg' : 'negative-bg'}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span></td><td class="muted-cell">${money(Number(m.market_cap || 0),0)}</td><td>${sparkline(m.sparkline_in_7d?.price, change)}</td><td><button class="trade-row-btn" data-trade-asset="${escapeHtml(m.id)}">Trade</button></td></tr>`;
  }).join('');
  document.querySelector('#market-rows').innerHTML = rows || '<tr><td colspan="6" class="loading-cell">No matching assets found.</td></tr>';
  document.querySelector('#tracked-value').textContent = state.markets.length;
  document.querySelector('#market-status').textContent = state.lastUpdated ? `Updated ${state.lastUpdated.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · Public prices` : 'Showing fallback sample prices';
}
function renderTrade() {
  const m = getMarket(state.selected), sym = m.symbol.toUpperCase(), change = Number(m.price_change_percentage_24h || 0);
  document.querySelector('#trade-asset-icon').textContent = iconFor(m);
  document.querySelector('#trade-asset-name').textContent = m.name;
  document.querySelector('#trade-asset-symbol').textContent = `${sym} / USD`;
  document.querySelector('#trade-asset-price').textContent = price(Number(m.current_price));
  document.querySelector('#trade-asset-change').textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  document.querySelector('#trade-asset-change').className = change >= 0 ? 'positive-text' : 'negative-text';
  document.querySelector('#trade-exchange').textContent = exchangeName();
  document.querySelector('#trade-badge').textContent = state.mode === 'demo' ? 'DEMO' : 'LIVE';
  document.querySelector('#trade-badge').className = state.mode === 'demo' ? 'demo-badge' : 'live-badge';
  document.querySelector('#trade-subtitle').textContent = state.mode === 'demo' ? 'Practice with virtual funds' : 'Protected exchange connection';
  document.querySelector('#risk-copy').textContent = state.mode === 'demo' ? 'Demo mode uses virtual funds. No real order is sent.' : 'Live orders can move real funds. Confirm the exchange and amount carefully.';
  document.querySelector('#submit-trade').innerHTML = `${document.querySelector('.side-btn.selected')?.dataset.side === 'sell' ? 'Sell' : 'Buy'} ${sym} <span>→</span>`;
  updateEstimate();
}
function exchangeName() { return ({binance:'Binance',kraken:'Kraken',coinbase:'Coinbase',okx:'OKX',bybit:'Bybit',kucoin:'KuCoin',bitget:'Bitget',gateio:'Gate.io'})[state.exchange] || state.exchange; }
function updateEstimate() {
  const m = getMarket(state.selected), amount = Math.max(0, Number(document.querySelector('#amount')?.value || 0)), side = document.querySelector('.side-btn.selected')?.dataset.side || 'buy';
  document.querySelector('#estimated-qty').textContent = `${(amount / Number(m.current_price || 1)).toLocaleString('en-US',{maximumSignificantDigits:7})} ${m.symbol.toUpperCase()}`;
  document.querySelector('#fee-value').textContent = money(amount * .001);
  document.querySelector('#submit-trade').innerHTML = `${side === 'sell' ? 'Sell' : 'Buy'} ${m.symbol.toUpperCase()} <span>→</span>`;
}
function portfolioValue() { return Object.entries(state.holdings).reduce((sum,[id,qty])=>sum + qty * Number(getMarket(id).current_price || 0), 0); }
function renderPortfolio() {
  const total = portfolioValue();
  document.querySelector('#balance-value').textContent = money(state.balance);
  document.querySelector('#portfolio-value').textContent = money(state.balance + total);
  document.querySelector('#portfolio-note').textContent = total ? `${money(total)} in crypto assets` : 'No assets held yet';
  const entries = Object.entries(state.holdings).filter(([,q])=>q > 0.00000001);
  document.querySelector('#holdings-list').innerHTML = entries.length ? entries.map(([id,qty])=>{const m=getMarket(id),value=qty*Number(m.current_price||0);return `<div class="holding-row"><span class="asset-mini">${escapeHtml(iconFor(m))}</span><div class="holding-title"><b>${escapeHtml(m.name)}</b><small>${qty.toLocaleString('en-US',{maximumSignificantDigits:8})} ${m.symbol.toUpperCase()}</small></div><div class="holding-value"><b>${money(value)}</b><small>${((value/Math.max(total,1))*100).toFixed(1)}% of holdings</small></div></div>`}).join('') : '<div class="empty-state"><span>◒</span><b>Your portfolio starts here</b><p>Place a demo trade to see your assets appear.</p></div>';
  const activity = state.trades.slice(0,4);
  document.querySelector('#activity-list').innerHTML = activity.length ? activity.map(t=>`<div class="activity-row"><span class="activity-icon ${t.side}">${t.side==='buy'?'↙':'↗'}</span><div class="activity-title"><b>${t.side==='buy'?'Bought':'Sold'} ${t.symbol}</b><small>${t.time}</small></div><div class="activity-value"><b>${money(t.amount)}</b><small class="${t.side==='buy'?'positive-text':'negative-text'}">${t.side.toUpperCase()}</small></div></div>`).join('') : '<div class="empty-state compact-empty">No trades yet</div>';
}
function showToast(message) { const el=document.querySelector('#toast'); el.textContent=message; el.classList.add('visible'); setTimeout(()=>el.classList.remove('visible'),3000); }
async function loadMarkets() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,ripple,dogecoin,cardano,avalanche-2&order=market_cap_desc&per_page=8&page=1&sparkline=true&price_change_percentage=24h', {headers:{accept:'application/json'}});
    if (!response.ok) throw new Error('Market feed unavailable');
    const data = await response.json();
    if (Array.isArray(data) && data.length) state.markets = data;
  } catch (e) {
    if (!state.markets.length) state.markets = fallbackMarkets;
    document.querySelector('#connection-label').textContent = 'Sample data / feed offline';
  }
  state.loading = false; state.lastUpdated = new Date();
  if (!state.markets.some(m=>m.id===state.selected)) state.selected = state.markets[0].id;
  renderMarkets(); renderTrade(); renderPortfolio();
  document.querySelector('#updated-time').textContent = 'Updated ' + state.lastUpdated.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
}
function paperTrade() {
  const m=getMarket(state.selected), side=document.querySelector('.side-btn.selected')?.dataset.side || 'buy', amount=Number(document.querySelector('#amount').value), fee=amount*.001, priceNow=Number(m.current_price);
  const error=document.querySelector('#trade-error'); error.textContent='';
  if (!Number.isFinite(amount)||amount<=0) {error.textContent='Enter a valid amount greater than zero.';return;}
  const qty=amount/priceNow;
  if (side==='buy') {
    if (amount+fee>state.balance) {error.textContent='Insufficient demo USD balance for this order.';return;}
    state.balance-=amount+fee; state.holdings[m.id]=(state.holdings[m.id]||0)+qty;
  } else {
    if ((state.holdings[m.id]||0)<qty) {error.textContent='Not enough of this asset in your demo wallet to sell that USD value.';return;}
    state.holdings[m.id]-=qty; state.balance+=amount-fee;
  }
  state.trades.unshift({side,symbol:m.symbol.toUpperCase(),amount,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});
  renderPortfolio(); renderTrade(); showToast(`Demo ${side} order complete · ${qty.toLocaleString('en-US',{maximumSignificantDigits:6})} ${m.symbol.toUpperCase()}`);
}
function switchTab(tab) {
  document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.querySelector('#crumb-current').textContent=({markets:'Markets',portfolio:'Portfolio',orders:'Trade history'})[tab]||'Markets';
  if(tab==='portfolio') document.querySelector('#holdings-list').scrollIntoView({behavior:'smooth',block:'center'});
  if(tab==='orders') document.querySelector('#activity-list').scrollIntoView({behavior:'smooth',block:'center'});
  if(tab==='markets') document.querySelector('#markets-panel').scrollIntoView({behavior:'smooth',block:'start'});
}
function bindEvents() {
  document.addEventListener('click', e=>{
    const nav=e.target.closest('[data-tab]'); if(nav){switchTab(nav.dataset.tab);return;}
    const trade=e.target.closest('[data-trade-asset]'); if(trade){state.selected=trade.dataset.tradeAsset;renderMarkets();renderTrade();document.querySelector('.trade-panel').scrollIntoView({behavior:'smooth',block:'center'});return;}
    const row=e.target.closest('tr[data-asset]'); if(row){state.selected=row.dataset.asset;renderMarkets();renderTrade();}
    const side=e.target.closest('[data-side]'); if(side){document.querySelectorAll('.side-btn').forEach(b=>b.classList.toggle('selected',b===side));renderTrade();}
  });
  document.querySelector('#search').addEventListener('input',e=>{state.query=e.target.value;renderMarkets();});
  document.querySelector('#amount').addEventListener('input',updateEstimate);
  document.querySelector('#exchange').addEventListener('change',e=>{state.exchange=e.target.value;document.querySelector('#trade-exchange').textContent=exchangeName();showToast(`Selected ${exchangeName()} connector`);});
  document.querySelector('#refresh').addEventListener('click',loadMarkets);
  document.querySelector('#submit-trade').addEventListener('click',()=>state.mode==='demo'?paperTrade():liveTrade());
  document.querySelector('#max-amount').addEventListener('click',()=>{document.querySelector('#amount').value=Math.max(0,Math.floor(state.balance));updateEstimate();});
  document.querySelector('#mode-toggle').addEventListener('click',()=>{if(state.mode==='demo'){document.querySelector('#live-dialog').showModal();}else{state.mode='demo';document.querySelector('#mode-label').textContent='Demo trading';renderTrade();showToast('Switched to demo trading.');}});
  document.querySelector('#connect-live').addEventListener('click',async e=>{
    e.preventDefault(); const url=document.querySelector('#api-url').value.trim().replace(/\/$/,''); const token=document.querySelector('#api-token').value.trim();
    if(!url||!token){showToast('Enter the backend URL and access token.');return;}
    try {const r=await fetch(url+'/api/health',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw new Error('Connection rejected');const data=await r.json();if(!data.ok)throw new Error('Backend not ready');window.__cTraderLive={url,token};state.mode='live';document.querySelector('#live-dialog').close();document.querySelector('#mode-label').textContent='Live trading';document.querySelector('#connection-label').textContent='Backend connected';renderTrade();showToast('Backend connected. Review live orders carefully.');}
    catch(err){showToast('Could not verify backend. Check URL, token and CORS.');}
  });
}
async function liveTrade() {
  const m=getMarket(state.selected),side=document.querySelector('.side-btn.selected')?.dataset.side||'buy',amount=Number(document.querySelector('#amount').value);
  if(!window.__cTraderLive){document.querySelector('#live-dialog').showModal();return;}
  if(!Number.isFinite(amount)||amount<=0){document.querySelector('#trade-error').textContent='Enter a valid order amount.';return;}
  if(!confirm(`Send REAL ${side.toUpperCase()} market order on ${exchangeName()} for approximately ${money(amount)} of ${m.symbol.toUpperCase()}? Crypto orders may lose money.`))return;
  try {
    const r=await fetch(window.__cTraderLive.url+'/api/order',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.__cTraderLive.token},body:JSON.stringify({exchange:state.exchange,symbol:m.symbol.toUpperCase()+'/USDT',side,amount})});
    const data=await r.json();if(!r.ok)throw new Error(data.error||'Order rejected');
    state.trades.unshift({side,symbol:m.symbol.toUpperCase(),amount,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});renderPortfolio();showToast('Live order submitted. Check your exchange for final status.');
  } catch(err){document.querySelector('#trade-error').textContent='Live order failed: '+err.message;}
}
appShell(); bindEvents(); state.markets=fallbackMarkets; renderMarkets(); renderTrade(); renderPortfolio(); loadMarkets(); setInterval(loadMarkets,60000);
