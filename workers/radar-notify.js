/* RADAR radar-notify v1 — Binding: RADAR_KV · Secret: TG_TOKEN */
function json(o,s){return new Response(JSON.stringify(o),{status:s||200,headers:{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","cache-control":"no-store"}})}
function cors(){return{"access-control-allow-origin":"*","access-control-allow-methods":"POST,GET,OPTIONS","access-control-allow-headers":"*"}}
const SITE="https://p9ggcdpkmw-maker.github.io/radar/";
const SCURL="https://radar-scores.69sygknn4y.workers.dev/scores";
// Aynı hesaptaki worker'a workers.dev üzerinden fetch engelli (Cloudflare 1042): Service binding (MARKET, SCORES) varsa onu kullan.
async function gj(u,env){try{const b=env&&(u.indexOf("radar-market")>=0?env.MARKET:u.indexOf("radar-scores")>=0?env.SCORES:null);
const r=await (b?b.fetch(u,{headers:{"user-agent":"RADAR"}}):fetch(u,{headers:{"user-agent":"RADAR"}}));
if(!r.ok){console.log("gj HTTP",r.status,u.split("?")[0]);return null}return await r.json()}catch(e){console.log("gj hata",u.split("?")[0],String(e));return null}}
// KV list de günde 1000 ile sınırlı: sayıyı isolate belleğinde 60 sn tut.
let PRES={t:0,n:0};
async function presN(env){if(Date.now()-PRES.t<60000)return PRES.n;const l=await env.RADAR_KV.list({prefix:"pres:"});PRES={t:Date.now(),n:(l.keys||[]).length};return PRES.n}
// Özet: üst sınır içinde son cümle sonunda kes; cümle sonu yoksa kelimede kes.
function cutSent(s,n){s=String(s||"").replace(/\s+/g," ").trim();if(s.length<=n)return s;
const part=s.slice(0,n),re=/[.!?…](\s|$)/g;let end=-1,m;while((m=re.exec(part)))end=m.index+1;
return end>=60?part.slice(0,end):part.replace(/\s+\S*$/,"")+"…"}
// Buton etiketi: emoji + kısa başlık, toplam ≤28 karakter.
function btnLabel(em,t){t=String(t||"").replace(/\s+/g," ").trim();const max=28-em.length-1;
return em+" "+(t.length>max?t.slice(0,max-1).trim()+"…":t)}
function trlow(s){return String(s||"").toLocaleLowerCase("tr")}
// ---- Faz F: fiyat alarmları (truncgil/radar-market verisi) ----
const MKT="https://radar-market.69sygknn4y.workers.dev/market?g=fx,metal,idx";
// Komuttaki kısa ad → [worker quote anahtarı, görünen ad, birim]
const ASSETS={gram:["Gram Altın","Gram Altın","₺"],ceyrek:["CEYREKALTIN","Çeyrek Altın","₺"],yarim:["YARIMALTIN","Yarım Altın","₺"],
tam:["TAMALTIN","Tam Altın","₺"],cumhuriyet:["CUMHURIYETALTINI","Cumhuriyet Altını","₺"],ata:["ATAALTIN","Ata Altın","₺"],
bilezik:["22 Ayar Bilezik","22 Ayar Bilezik","₺"],has:["Has Altın","Has Altın","₺"],gumus:["Gram Gümüş","Gram Gümüş","₺"],
ons:["Ons Altın","Ons Altın","$"],dolar:["USD/TRY","Dolar","₺"],usd:["USD/TRY","Dolar","₺"],euro:["EUR/TRY","Euro","₺"],eur:["EUR/TRY","Euro","₺"],
sterlin:["GBP/TRY","Sterlin","₺"],gbp:["GBP/TRY","Sterlin","₺"],bist:["BIST 100","BIST 100",""]};
function ascii(s){return trlow(s).replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u")}
// "6000", "6.000", "6.000,50", "50,7" → sayı
function trNum(t){t=String(t||"").trim();if(t.indexOf(",")>=0)t=t.replace(/\./g,"").replace(",",".");else if(/^\d{1,3}(\.\d{3})+$/.test(t))t=t.replace(/\./g,"");const v=parseFloat(t);return isFinite(v)&&v>0?v:null}
function fmtN(v){return Number(v).toLocaleString("tr-TR",{maximumFractionDigits:v<100?2:0})}
async function quotes(env){const d=await gj(MKT,env);const m={};((d&&d.quotes)||[]).forEach(q=>{if(q&&q.k&&isFinite(q.v)&&q.v>0)m[q.k]=q.v});return m}
async function getAlarms(KV,chat){try{return JSON.parse(await KV.get("alarm:"+chat)||"[]")}catch(e){return[]}}
async function scan(env){
const KV=env.RADAR_KV;
const rawN=await KV.get("seen:news"),rawS=await KV.get("seen:sc");
const firstN=!rawN,firstS=!rawS;
const news=await gj(SITE+"news.json?t="+Date.now());
const today=new Date().toISOString().slice(0,10).replace(/-/g,"");
const scF=await gj(SCURL+"?sport=football&date="+today,env);
const scB=await gj(SCURL+"?sport=basketball&date="+today,env);
const scV=await gj(SCURL+"?sport=volleyball&date="+today,env);
let seenN=[];try{seenN=JSON.parse(rawN||"[]")}catch(e){}
const seenSet=new Set(seenN);
const newItems=firstN?[]:(((news&&news.items)||[]).filter(it=>it&&it.link&&!seenSet.has(it.link)));
let seenS={};try{seenS=JSON.parse(rawS||"{}")}catch(e){}
const events=[];
const proc=(d,sport)=>{((d&&d.leagues)||[]).forEach(l=>(l.matches||[]).forEach(m=>{
const sig=m.state+":"+(m.hs==null?"-":m.hs)+":"+(m.as==null?"-":m.as);
const old=seenS[m.id];
if(!firstS&&old&&old!==sig){
if(m.state==="in"&&old.indexOf("pre")===0)events.push({k:"start",m,l,sport});
else if(m.state==="in"&&old.indexOf("in")===0)events.push({k:"goal",m,l,sport});
else if(m.state==="post"&&old.indexOf("in")===0)events.push({k:"end",m,l,sport});}
seenS[m.id]=sig;}))};
proc(scF,"football");proc(scB,"basketball");proc(scV,"volleyball");
const list=await KV.list({prefix:"chat:"});
const chats=(list.keys||[]).map(k=>k.name.slice(5));
const hour=new Date(Date.now()+3*3600*1000).getUTCHours();
let Q=null; // piyasa verisi: yalnız bekleyen alarm varsa, turda bir kez çekilir
for(const chat of chats){
let favs=[];try{favs=JSON.parse(await KV.get("favs:"+chat)||"[]")}catch(e){}
let set={};try{set=JSON.parse(await KV.get("set:"+chat)||"{}")}catch(e){}
if(set.off)continue;
const quiet=set.quiet&&(hour>=23||hour<8);
const alarms=await getAlarms(KV,chat);
if(alarms.some(a=>!a.fired)&&!quiet){if(!Q)Q=await quotes(env);
const hits=alarms.filter(a=>!a.fired&&Q[a.k]!=null&&(a.op===">"?Q[a.k]>=a.v:Q[a.k]<=a.v));
if(hits.length){hits.forEach(a=>{a.fired=Date.now();a.at=Q[a.k]});
// Tek bildirim: tetiklenen alarm işaretlenir, bir daha gönderilmez (KV yazma yalnız tetiklenince).
await KV.put("alarm:"+chat,JSON.stringify(alarms));
const t="🔔 Fiyat alarmı\n"+hits.map(a=>"• "+a.n+" "+fmtN(a.at)+" "+a.u+" → "+(a.op===">"?"▲ ":"▼ ")+fmtN(a.v)+" "+a.u+(a.op===">"?" üstüne çıktı":" altına indi")).join("\n")+"\n\nYeni alarm: /alarm gram 6000 · liste: /alarmlar";
await fetch("https://api.telegram.org/bot"+env.TG_TOKEN+"/sendMessage",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chat,text:t,disable_web_page_preview:true,reply_markup:{inline_keyboard:[[{text:"📈 Nabız'da aç",url:SITE+"?v=market"}]]}})});}}
const matched=[];
newItems.forEach(it=>{const hay=trlow(it.title+" "+(it.summary||""));
if(favs.some(f=>(f.t==="src"&&f.id===it.source)||(f.t==="kw"&&hay.indexOf(trlow(f.id))>=0)))
matched.push({text:"📰 "+(it.source||"")+" · "+it.title+"\n"+cutSent(it.summary,320),url:SITE+"?v=feed&news="+encodeURIComponent(it.nid||it.link),btn:btnLabel("📰",it.title),all:SITE+"?v=feed",nid:it.nid||null});});
events.forEach(e=>{const m=e.m;
if(!favs.some(f=>f.t==="team"&&(f.id===m.home||f.id===m.away)))return;
const score=(m.hs==null?"-":m.hs)+"-"+(m.as==null?"-":m.as);
const url=SITE+"?v=scores&match="+encodeURIComponent(m.id)+"&sport="+e.sport+"&date="+today;
const all=SITE+"?v=scores";
if(e.k==="start")matched.push({text:"🔴 Başladı: "+m.home+" – "+m.away,url,all,btn:btnLabel("🔴",m.home+" – "+m.away)});
else if(e.k==="goal")matched.push({text:"⚽ GOL! "+m.home+" "+score+" "+m.away+(m.clock?" ("+m.clock+")":""),url,all,btn:btnLabel("⚽",m.home+" "+score+" "+m.away)});
else matched.push({text:"🏁 Bitti: "+m.home+" "+score+" "+m.away,url,all,btn:btnLabel("🏁",m.home+" "+score+" "+m.away)});});
if(!matched.length)continue;
let q=[];try{q=JSON.parse(await KV.get("queue:"+chat)||"[]")}catch(e){}
q=q.concat(matched).slice(-20);
await KV.put("queue:"+chat,JSON.stringify(q));
if(quiet)continue;
let since=+(await KV.get("qsince:"+chat)||0);
if(!since){since=Date.now();await KV.put("qsince:"+chat,String(since))}
const due=set.digest?(Date.now()-since>=30*60*1000):true;
if(!due)continue;
const batch=q.slice(0,5);
const text=batch.map(b=>b.text).join("\n\n").slice(0,3800);
// ≤3 öğe: her birine ayrı buton. >3: tek "Tümünü aç" (hepsi aynı türdeyse o sekmeye).
let allU=batch.every(b=>b.all&&b.all===batch[0].all)?batch[0].all:SITE;
// Hepsi haberse ve kimlikleri varsa: tam o haberlerin listesini aç.
if(batch.every(b=>b.nid))allU=SITE+"?v=feed&news="+batch.map(b=>b.nid).join(",");
const kb={inline_keyboard:batch.length>3?[[{text:"📡 Tümünü RADAR'da aç",url:allU}]]:batch.map(b=>[{text:b.btn||"📡 RADAR'da aç",url:b.url}])};
await fetch("https://api.telegram.org/bot"+env.TG_TOKEN+"/sendMessage",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chat,text,disable_web_page_preview:true,reply_markup:kb})});
await KV.put("queue:"+chat,JSON.stringify(q.slice(batch.length)));
await KV.delete("qsince:"+chat);}
// KV free tier: günde 1000 yazma. Sadece değişince yaz. İlk çalıştırmada mevcut haberlerle tohumla (yoksa sonraki tur hepsini "yeni" sayar).
const addN=firstN?((news&&news.items)||[]).filter(it=>it&&it.link):newItems;
if(addN.length)await KV.put("seen:news",JSON.stringify(seenN.concat(addN.map(i=>i.link)).slice(-400)));
const ks=Object.keys(seenS);if(ks.length>400){const t={};ks.slice(-400).forEach(k=>t[k]=seenS[k]);seenS=t}
const outS=JSON.stringify(seenS);if(outS!==rawS)await KV.put("seen:sc",outS);}
export default{async scheduled(ev,env,ctx){ctx.waitUntil(scan(env))},async fetch(req,env){
const url=new URL(req.url);
if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors()});
const KV=env.RADAR_KV;
if(url.pathname==="/presence"&&req.method==="POST"){const d=await req.json().catch(()=>null);
if(!d||!d.id)return json({error:"id yok"},400);
// TTL, istemci aralığının (300 sn) 2 katından fazla: bir kaçan beat kullanıcıyı düşürmez.
await env.RADAR_KV.put("pres:"+String(d.id).slice(0,40),"1",{expirationTtl:660});return json({ok:true,n:await presN(env)})}
if(url.pathname==="/presence")return json({n:await presN(env)});
if(url.pathname==="/scan"){await scan(env);return json({ok:true,scanned:true})}
if(url.pathname==="/pair"&&req.method==="POST"){
const d=await req.json().catch(()=>null);
if(!d||!d.code)return json({error:"code gerekli"},400);
await KV.put("pend:"+d.code,JSON.stringify({favs:Array.isArray(d.favs)?d.favs:[],ts:Date.now()}),{expirationTtl:900});
return json({ok:true});}
if(url.pathname==="/fav"&&req.method==="POST"){
const d=await req.json().catch(()=>null);if(!d)return json({error:"body yok"},400);
let chat=d.chat||"";
if(!chat&&d.code)chat=(await KV.get("chatof:"+d.code))||"";
if(!chat)return json({error:"eslesme yok - once Telegram'da /start"},404);
await KV.put("favs:"+chat,JSON.stringify(Array.isArray(d.favs)?d.favs:[]));
return json({ok:true});}
if(url.pathname==="/tg"){
const up=await req.json().catch(()=>null);
if(!up||!up.message)return new Response("ok");
const msg=up.message,chat=String(msg.chat.id),text=String(msg.text||"");
const send=t=>fetch("https://api.telegram.org/bot"+env.TG_TOKEN+"/sendMessage",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chat,text:t,disable_web_page_preview:true})});
if(text.indexOf("/start")===0){
const code=(text.split(" ")[1]||"").trim();
const pend=code?await KV.get("pend:"+code):null;
if(pend){const p=JSON.parse(pend);
await KV.put("favs:"+chat,JSON.stringify(p.favs||[]));
await KV.put("chat:"+chat,"1");
await KV.put("chatof:"+code,chat);
await KV.delete("pend:"+code);
await send("✅ RADAR'a bağlandın · "+(p.favs||[]).length+" favorin takipte.\nKomutlar: /favoriler /ozet /sessiz /durdur /devam /kopar /sil");
}else await send("🔗 Kod geçersiz veya süresi dolmuş (15 dk). Sitede Kasa → 📲 Telegram'a bağla ile yeni kod üret.");
return new Response("ok");}
if(text.indexOf("/alarmlar")===0){const L=await getAlarms(KV,chat);
await send(L.length?"🔔 Alarmların:\n"+L.map((a,i)=>(i+1)+". "+a.n+" "+(a.op===">"?"▲ ":"▼ ")+fmtN(a.v)+" "+a.u+(a.fired?" · ✅ tetiklendi ("+fmtN(a.at)+")":" · bekliyor")).join("\n")+"\n\nSilmek: /alarmsil 2 · hepsi: /alarmsil hepsi":"Alarm yok. Örnek: /alarm gram 6000");return new Response("ok")}
if(text.indexOf("/alarmsil")===0){const L=await getAlarms(KV,chat),arg=trlow(text.split(/\s+/)[1]||"");
if(arg==="hepsi"){await KV.delete("alarm:"+chat);await send("🗑 Tüm alarmlar silindi.");return new Response("ok")}
const i=parseInt(arg,10)-1;if(!(i>=0&&i<L.length)){await send("Numara geçersiz. Liste: /alarmlar");return new Response("ok")}
const g=L.splice(i,1)[0];if(L.length)await KV.put("alarm:"+chat,JSON.stringify(L));else await KV.delete("alarm:"+chat);
await send("🗑 Silindi: "+g.n+" "+fmtN(g.v)+" "+g.u);return new Response("ok")}
if(text.indexOf("/alarm")===0){const parts=text.trim().split(/\s+/),key=ascii(parts[1]||""),A=ASSETS[key],v=trNum(parts[2]);
if(!A||!v){await send("Kullanım: /alarm <varlık> <fiyat>\nÖrnek: /alarm gram 6000 · /alarm dolar 52 · /alarm ceyrek 9500\nVarlıklar: gram, ceyrek, yarim, tam, cumhuriyet, ata, bilezik, has, gumus, ons, dolar, euro, sterlin, bist");return new Response("ok")}
const L=await getAlarms(KV,chat);if(L.filter(a=>!a.fired).length>=10){await send("En fazla 10 bekleyen alarm. Liste: /alarmlar");return new Response("ok")}
const Q=await quotes(env),now=Q[A[0]];if(now==null){await send("⚠️ "+A[1]+" fiyatı şu an alınamadı, birazdan tekrar dene.");return new Response("ok")}
const op=v>now?">":"<";L.push({k:A[0],n:A[1],u:A[2],op,v,ts:Date.now()});
await KV.put("alarm:"+chat,JSON.stringify(L));await KV.put("chat:"+chat,"1"); // site eşleşmesi olmadan da taransın
await send("✅ Alarm kuruldu: "+A[1]+" şu an "+fmtN(now)+" "+A[2]+". "+fmtN(v)+" "+A[2]+(op===">"?" üstüne çıkınca":" altına inince")+" bir kez haber vereceğim (5 dk'da bir kontrol, truncgil verisi).");return new Response("ok")}
if(text==="/favoriler"){const f=JSON.parse((await KV.get("favs:"+chat))||"[]");
await send(f.length?"⭐ Favorilerin:\n"+f.map(x=>"• "+(x.label||x.id)).join("\n"):"Henüz favori yok. Sitede ★ ekle, sonra Kasa → 📲 Telegram'a bağla.");return new Response("ok")}
// Sadece off alanı değişir; sessiz saat / özet ayarları korunur.
if(text==="/durdur"||text==="/devam"){const s=JSON.parse((await KV.get("set:"+chat))||"{}");s.off=text==="/durdur";await KV.put("set:"+chat,JSON.stringify(s));
await send(s.off?"⏸ Bildirimler durduruldu. Açmak için: /devam":"▶ Bildirimler açık.");return new Response("ok")}
if(text==="/ozet"){const s=JSON.parse((await KV.get("set:"+chat))||"{}");s.digest=!s.digest;await KV.put("set:"+chat,JSON.stringify(s));
await send(s.digest?"📬 Özet modu AÇIK: bildirimler 30 dk'da bir toplu gelir.":"⚡ Anında mod: olay olunca hemen gelir.");return new Response("ok")}
if(text==="/sessiz"){const s=JSON.parse((await KV.get("set:"+chat))||"{}");s.quiet=!s.quiet;await KV.put("set:"+chat,JSON.stringify(s));
await send(s.quiet?"🌙 Sessiz saat AÇIK: 23:00-08:00 arası bildirim yok.":"🔔 Sessiz saat kapalı.");return new Response("ok")}
if(text==="/kopar"||text==="/sil"){if(text==="/sil")await KV.delete("alarm:"+chat);await KV.delete("favs:"+chat);await KV.delete("chat:"+chat);await KV.delete("set:"+chat);
await send(text==="/sil"?"🗑 Tüm RADAR verilerin silindi.":"🔌 Bağlantı koparıldı; bildirim gelmeyecek.");return new Response("ok")}
if(text==="/yardim"||text==="/help"){await send("🤖 RADAR komutları:\n⭐ /favoriler · takip listemi göster\n📬 /ozet · anında ↔ 30 dk toplu\n🌙 /sessiz · 23:00-08:00 sustur/aç\n⏸️ /durdur · bildirimleri durdur\n▶️ /devam · bildirimleri aç\n🔌 /kopar · bağlantıyı kes\n🗑️ /sil · tüm RADAR verimi sil\n🔔 /alarm gram 6000 · fiyat alarmı kur\n📋 /alarmlar · alarmları göster · /alarmsil 2\n📲 /start KOD · siteden yeni kodla bağlan");return new Response("ok")}
if(text==="/test"){await fetch("https://api.telegram.org/bot"+env.TG_TOKEN+"/sendMessage",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chat,text:"🧪 RADAR test bildirimi: bağlantı, KV ve butonlar çalışıyor.",reply_markup:{inline_keyboard:[[{text:"📡 RADAR'ı aç",url:SITE}]]}})});return new Response("ok")}
await send("Bilmiyorum 🤖 /yardim yaz.");return new Response("ok");}
return json({error:"endpoint yok"},404);
}}