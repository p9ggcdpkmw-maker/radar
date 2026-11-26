/* RADAR market worker v10 — Haremaltın tüm çeşitleri + tablo formatı */
const TTL = { fx: 20000, metal: 30000, st: 30000, idx: 30000 };
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36' };
const IDX_NAMES = { 'BIST:XU100': 'BIST 100', 'SP:SPX': 'S&P 500', 'DJ:DJI': 'Dow Jones', 'NASDAQ:NDX': 'Nasdaq 100' };
let C = {}, YC = { t: 0, map: {} };
const YSYM = {
  bist: [['BIST 100','XU100.IS'],['THY','THYAO.IS'],['Aselsan','ASELS.IS'],['Garanti BBVA','GARAN.IS'],['BİM','BIMAS.IS'],['Koç Holding','KCHOL.IS'],['SASA','SASA.IS'],['Petkim','PETKM.IS'],['Ereğli Demir','EREGL.IS'],['Tüpraş','TUPRS.IS'],['Akbank','AKBNK.IS'],['Yapı Kredi','YKBNK.IS'],['İş Bankası C','ISCTR.IS'],['Ford Otosan','FROTO.IS'],['Turkcell','TCELL.IS']],
  us: [['S&P 500','^GSPC'],['Nasdaq','^IXIC'],['Dow Jones','^DJI'],['Apple','AAPL'],['Microsoft','MSFT'],['Nvidia','NVDA'],['Tesla','TSLA'],['Amazon','AMZN'],['Google','GOOGL'],['Meta','META'],['AMD','AMD'],['Intel','INTC']]
};
async function j(u, opt) { const r = await fetch(u, Object.assign({ headers: UA }, opt || {})); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
async function yahoo(sym) {
  const hosts = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com']; let last = null;
  for (const h of hosts) { try {
    const d = await j(h + '/v8/finance/chart/' + encodeURIComponent(sym) + '?range=1d&interval=5m');
    const res = d && d.chart && d.chart.result && d.chart.result[0]; if (!res) throw 0;
    const m = res.meta || {}; const q = (res.indicators && res.indicators.quote && res.indicators.quote[0]) || {};
    let pts = (q.close || []).filter(v => typeof v === 'number' && isFinite(v));
    if (pts.length > 44) { const st = Math.ceil(pts.length / 44); pts = pts.filter((_, i) => i % st === 0); }
    const prev = m.chartPreviousClose || m.previousClose; const v = m.regularMarketPrice || pts[pts.length - 1] || prev;
    if (!isFinite(v) || v <= 0) throw 0;
    return { v: v, p: prev ? ((v - prev) / prev * 100) : null, s: pts, src: 'yahoo' };
  } catch (e) { last = e; } }
  throw last || new Error('yahoo yok');
}
async function yahooAll() {
  if (YC.map && Object.keys(YC.map).length && Date.now() - YC.t < 60000) return YC.map;
  const all = [].concat(YSYM.bist.map(x => ({ n: x[0], s: x[1], g: 'bist' })), YSYM.us.map(x => ({ n: x[0], s: x[1], g: 'us' })));
  const res = await Promise.allSettled(all.map(a => yahoo(a.s).then(r => ({ a: a, r: r }))));
  const map = {}; res.forEach(x => { if (x.status === 'fulfilled') { const a = x.value.a, r = x.value.r; map[a.g + ':' + a.n] = { k: a.n, n: a.n, v: r.v, p: r.p, s: r.s, grp: a.g, src: 'yahoo', vol: 0, mcap: 0 }; } });
  YC = { t: Date.now(), map: map }; return map;
}
async function tvScan(market) { const body = { columns: ['name','description','close','change','volume','market_cap_basic'], sort: { sortBy: 'volume', sortOrder: 'desc' }, range: [0, 50], filter: [{ left: 'type', operation: 'equal', right: 'stock' }] }; const d = await j('https://scanner.tradingview.com/' + market + '/scan', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, UA), body: JSON.stringify(body) }); return (d && d.data) || []; }
async function tvIndices() { const body = { symbols: { tickers: Object.keys(IDX_NAMES), query: { types: [] } }, columns: ['name','description','close','change','volume'] }; const d = await j('https://scanner.tradingview.com/global/scan', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, UA), body: JSON.stringify(body) }); return (d && d.data) || []; }
function mapTv(rows, grp) { return rows.map(r => { const sym = String(r.s || '').split(':').pop(); const d = r.d || []; return { k: sym, n: String(d[1] || d[0] || sym), v: +d[2], p: +d[3], vol: +d[4] || 0, mcap: +d[5] || 0, grp: grp, src: 'tv', s: [] }; }).filter(x => isFinite(x.v) && x.v > 0); }
async function gSt() {
  const [tv, ym] = await Promise.allSettled([(async () => { const tr = await tvScan('turkey'); const us = await tvScan('america'); return mapTv(tr, 'bist').concat(mapTv(us, 'us')); })(), yahooAll()]);
  let rows = (tv.status === 'fulfilled' && tv.value.length >= 10) ? tv.value : [];
  const ymap = ym.status === 'fulfilled' ? ym.value : {}; const have = {}; rows.forEach(r => { have[r.grp + ':' + r.n] = 1; });
  Object.keys(ymap).forEach(k => { if (!have[k]) rows.push(ymap[k]); });
  if (!rows.length) throw new Error('hisse yok'); return rows;
}
async function gIdx() {
  const [tv, ym] = await Promise.allSettled([tvIndices(), yahooAll()]); let rows = [];
  if (tv.status === 'fulfilled' && tv.value.length) { rows = tv.value.map(r => { const nm = IDX_NAMES[r.s] || String(r.s || '').split(':').pop(); const d = r.d || []; return { k: nm, n: nm, v: +d[2], p: +d[3], vol: +d[4] || 0, mcap: 0, grp: 'idx', src: 'tv', s: [] }; }).filter(x => isFinite(x.v) && x.v > 0); }
  if (!rows.length && ym.status === 'fulfilled') { const m = ym.value; rows = ['bist:BIST 100','us:S&P 500','us:Dow Jones','us:Nasdaq'].map(k => m[k]).filter(Boolean).map(q => ({ k: q.k, n: q.k, v: q.v, p: q.p, grp: 'idx', src: 'yahoo', s: q.s, vol: 0, mcap: 0 })); }
  if (!rows.length) throw new Error('endeks yok'); return rows;
}
// gold-api ara sıra yanıt vermiyor: son başarılı değer 6 saate kadar kullanılır.
let LASTG = { t: 0, out: [] };
async function gMetal() {
  const [g, s] = await Promise.allSettled([j('https://api.gold-api.com/price/XAU'), j('https://api.gold-api.com/price/XAG')]); const out = [];
  if (g.status === 'fulfilled' && isFinite(g.value.price)) out.push({ k: 'Ons Altın', n: 'Ons Altın', v: g.value.price, p: null, grp: 'metal', src: 'gold', s: [] });
  if (s.status === 'fulfilled' && isFinite(s.value.price)) out.push({ k: 'Ons Gümüş', n: 'Ons Gümüş', v: s.value.price, p: null, grp: 'metal', src: 'gold', s: [] });
  if (out.length === 2) LASTG = { t: Date.now(), out: out };
  else if (Date.now() - LASTG.t < 6 * 3600 * 1000) LASTG.out.forEach(x => { if (!out.some(o => o.k === x.k)) out.push(x); });
  if (!out.length) throw new Error('metal yok'); return out;
}
async function gFx() {
  const L = { 'TRY=X': 'USD/TRY', 'EURTRY=X': 'EUR/TRY', 'GBPTRY=X': 'GBP/TRY', 'CHFTRY=X': 'CHF/TRY', 'JPYTRY=X': 'JPY/TRY' };
  const res = await Promise.allSettled(Object.keys(L).map(s => yahoo(s).then(r => Object.assign(r, { k: L[s], n: L[s], grp: 'fx' }))));
  const ok = res.filter(x => x.status === 'fulfilled').map(x => x.value); if (ok.length) return ok;
  const d = await j('https://open.er-api.com/v6/latest/USD'); const r = d.rates || {}; const t = r.TRY; const list = [];
  const mk = (k, v) => ({ k: k, n: k, v: v, p: null, grp: 'fx', src: 'er', s: [] });
  if (t) list.push(mk('USD/TRY', t)); if (t && r.EUR) list.push(mk('EUR/TRY', t / r.EUR)); if (t && r.GBP) list.push(mk('GBP/TRY', t / r.GBP)); if (t && r.CHF) list.push(mk('CHF/TRY', t / r.CHF)); if (t && r.JPY) list.push(mk('JPY/TRY', t / r.JPY));
  if (!list.length) throw new Error('fx yok'); return list;
}
/* ---- HAREMALTIN TÜM ÇEŞİTLER ---- */
const HA_MAP = [
  ['HAS ALTIN','Has Altın'],['ONS','Ons Altın'],['USD/KG','USD/KG'],['EUR/KG','EUR/KG'],
  ['22 AYAR','22 Ayar'],['GRAM ALTIN','Gram Altın'],['ALTIN GÜMÜŞ','Altın Gümüş'],
  ['ÇEYREK','Çeyrek Altın'],['YARIM','Yarım Altın'],['TAM','Tam Altın'],
  ['CUMHURİYET','Cumhuriyet Altını'],['ATA','Ata Altın'],['GÜMÜŞ','Gram Gümüş']
];
function haNorm(s){return s.replace(/İ/g,'i').replace(/I/g,'i').replace(/ı/g,'i').replace(/Ş/g,'s').replace(/ş/g,'s').replace(/Ğ/g,'g').replace(/ğ/g,'g').replace(/Ü/g,'u').replace(/ü/g,'u').replace(/Ö/g,'o').replace(/ö/g,'o').replace(/Ç/g,'c').replace(/ç/g,'c').toLowerCase()}
function haNum(t){t=String(t).trim();if(t.indexOf(',')>=0)t=t.replace(/\./g,'').replace(',','.');return parseFloat(t)}
function haOpen(){var w=new Date(Date.now()+3*3600*1000).getUTCDay();return w>0&&w<6}
function haPct(seg){var m=String(seg).match(/%\s*(-?\d+[.,]\d+)/);return m?parseFloat(m[1].replace(',','.')):null}
async function gTruncgil(){
  const d = await j('https://finans.truncgil.com/v4/today.json');
  const out = [];
  Object.keys(d).forEach(function(k){
    const row = d[k];
    if (!row || !/altin|gold/i.test(String(row.Type||''))) return;
    const num = t => { t=String(t).replace(/[₺$]/g,'').trim(); return t.indexOf(',')>=0 ? parseFloat(t.replace(/\./g,'').replace(',','.')) : parseFloat(t); };
    const alis = num(row.Buying), satis = num(row.Selling);
    if (!(alis>0 && satis>0)) return;
    const pct = row.Change ? parseFloat(String(row.Change).replace('%','').replace(',','.')) : 0;
    const ALIAS = { GRA:'Gram Altın', HAS:'Has Altın', GUMUS:'Gram Gümüş', ONS:'Ons Altın', YIA:'22 Ayar Bilezik' };
    const nm = ALIAS[k] || k;
    out.push({ k:nm, n:nm, v:satis, p:pct, alis:alis, satis:satis, spread:satis-alis, spreadPct:((satis-alis)/alis*100), grp:'metal', src:'truncgil', s:[] });
  });
  if (out.length < 3) throw new Error('truncgil parse ' + out.length);
  return out;
}
async function group(g) {
  if (g === 'metal') {
    const open = haOpen();
    const ttl = open ? 30000 : 6 * 3600 * 1000;
    if (C[g] && C[g].open === open && Date.now() - C[g].t < ttl) return C[g].body;
    let q, src = 'haremaltin', debug = '';
    try { q = await gTruncgil(); src = 'truncgil'; debug = 'truncgil';
      // Ons Gümüş truncgil'de yok: gold-api'den eksik olanları ekle.
      try { const have = new Set(q.map(x => x.k)); (await gMetal()).forEach(x => { if (!have.has(x.k)) q.push(x); }); } catch (e3) { debug += ' | gold:' + e3.message; }
    }
    catch (e) { debug = 'tg:' + e.message;
      try { q = await gMetal(); src = 'gold'; debug += ' | gold'; } catch (e2) { debug += ' | gold:' + e2.message; q = []; }
    }
    const at = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(11, 16);
    const body = { t: Date.now(), quotes: q, ha: { open: open, at: at, src: src, debug: debug } };
    C[g] = { t: Date.now(), body: body, open: open };
    return body;
  }
  const ttl = TTL[g] || 20000;
  if (C[g] && Date.now() - C[g].t < ttl) return C[g].body;
  let q; if (g === 'st') q = await gSt(); else if (g === 'idx') q = await gIdx(); else q = await gFx();
  const body = { t: Date.now(), quotes: q }; C[g] = { t: Date.now(), body: body }; return body;
}
addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.pathname !== '/market' && u.pathname !== '/market/') return e.respondWith(new Response('RADAR market worker v10 · GET /market?g=fx,metal,st,idx', { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' } }));
  e.respondWith((async () => {
    if (e.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': '*' } });
    const gs = (u.searchParams.get('g') || 'fx,metal,st,idx').split(',').filter(g => TTL[g]);
    const parts = await Promise.allSettled(gs.map(g => group(g)));
    const quotes = []; let ha = null;
    parts.forEach(p => { if (p.status === 'fulfilled') { quotes.push.apply(quotes, p.value.quotes); if (p.value.ha) ha = p.value.ha; } });
    return new Response(JSON.stringify({ as_of: Date.now(), quotes: quotes, ha: ha }), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
  })());
});