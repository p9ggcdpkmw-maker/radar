(function(){
"use strict";
var MKT_URL='https://radar-market.69sygknn4y.workers.dev/market';
var PROXY='https://radar-hls-proxy.69sygknn4y.workers.dev/?url=';
var SCORES_URL='https://radar-scores.69sygknn4y.workers.dev/scores';
var CLEAN_URL='https://radar-scores.69sygknn4y.workers.dev/clean';
var NOTIFY_URL='https://radar-notify.69sygknn4y.workers.dev';
var TG_BOT_USER='Radarhaber_bot';
var LAT=41.1601,LON=27.8055,TZ='Europe/Istanbul';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})};
var clamp=function(v,a,b){return v<a?a:v>b?b:v};
var LS={g:function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},
s:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},
raw:function(k){try{return localStorage.getItem(k)}catch(e){return null}},
set:function(k,v){try{localStorage.setItem(k,String(v))}catch(e){}},
d:function(k){try{localStorage.removeItem(k)}catch(e){}}};
var nf=function(v,d){var n=Number(v||0);return n.toLocaleString('tr-TR',{minimumFractionDigits:d==null?2:d,maximumFractionDigits:d==null?2:d})};
var price=function(v){var n=Number(v||0);return nf(n,n>=1000?0:n>=100?2:n>=1?3:4)};
var fmtC=function(v){var n=Number(v||0);if(!isFinite(n))return'—';if(n>=1000)return nf(n,0);if(n>=1)return nf(n,2);if(n>=0.01)return nf(n,4);return nf(n,6)};
var vol=function(v){try{return Number(v||0).toLocaleString('tr-TR',{notation:'compact',maximumFractionDigits:1})}catch(e){return nf(v,0)}};
var pct=function(v){var n=Number(v||0);return (n>0.001?'+':n<-0.001?'−':'')+Math.abs(n).toFixed(2).replace('.',',')+'%'};
var cls=function(v){return Number(v||0)>0.001?'up':Number(v||0)<-0.001?'dn':'fl'};
var arw=function(v){return Number(v||0)>0.001?'▲':Number(v||0)<-0.001?'▼':'●'};
var safeUrl=function(u){return /^https?:\/\//i.test(String(u||'').trim())?String(u).trim():'#'};
var ago=function(d){var t=new Date(d).getTime();if(isNaN(t))return'—';var m=(Date.now()-t)/6e4;if(m<0)return'az önce';if(m<60)return Math.round(m)+' dk';if(m<1440)return Math.round(m/60)+' sa';return Math.round(m/1440)+' gün'};
var hhmm=function(d){var t=new Date(d);return isNaN(t.getTime())?'--:--':t.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})};
var normK=function(s){return String(s||'').toLowerCase().replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9]/g,'').toUpperCase()};
var CATS={gundem:{l:'Gündem',c:'#64748B'},ekonomi:{l:'Ekonomi',c:'#F5A524'},teknoloji:{l:'Teknoloji',c:'#3B82F6'},bilim:{l:'Bilim',c:'#16C784'},dunya:{l:'Dünya',c:'#8B5CF6'},oyun:{l:'Ücretsiz Oyun',c:'#EC4899'},yasam:{l:'Yaşam',c:'#14B8A6'},sanat:{l:'Sanat',c:'#F97316'},doga:{l:'Doğa',c:'#84CC16'}};
var ORDER=['all','gundem','ekonomi','teknoloji','bilim','dunya','yasam','oyun'];
var WC={0:['Açık','☀️'],1:['Az bulutlu','🌤️'],2:['Parçalı bulutlu','⛅'],3:['Kapalı','☁️'],45:['Sisli','🌫️'],48:['Kırağı','🌫️'],51:['Hafif çisenti','🌦️'],53:['Çisenti','🌦️'],55:['Yoğun çisenti','🌧️'],61:['Hafif yağmur','🌦️'],63:['Yağmur','🌧️'],65:['Şiddetli yağmur','⛈️'],66:['Dondurucu yağmur','🌧️'],67:['Dondurucu yağmur','🌧️'],71:['Hafif kar','🌨️'],73:['Kar','🌨️'],75:['Yoğun kar','❄️'],77:['Kar taneleri','❄️'],80:['Sağanak','🌦️'],81:['Sağanak','🌧️'],82:['Şiddetli sağanak','⛈️'],85:['Kar sağanağı','🌨️'],86:['Kar sağanağı','🌨️'],95:['Gök gürültülü','⛈️'],96:['Dolu','⛈️'],99:['Şiddetli dolu','⛈️']};
var wx=function(c){return WC[c]||['Bilinmiyor','🌡️']};
var GOLD=[['Gram Altın',1,'24 ayar · 1 g','calc'],['Çeyrek Altın',1.603,'22 ayar · saf karşılığı','calc'],['Yarım Altın',3.206,'22 ayar · saf karşılığı','calc'],['Tam Altın',6.412,'22 ayar · saf karşılığı','calc'],['Cumhuriyet Altını',6.611,'22 ayar · saf karşılığı','calc'],['Ata Altın',6.611,'22 ayar · saf karşılığı','calc'],['Ons Altın',31.1035,'31,1035 g · saf','ons'],['Ons Gümüş',0,'ons · saf','silver'],['22 Ayar Bilezik',0.916,'1 g · 22 ayar','calc']];
var LANGS=[['auto','Otomatik'],['tr','Türkçe'],['en','İngilizce'],['de','Almanca'],['fr','Fransızca'],['es','İspanyolca'],['ar','Arapça'],['ru','Rusça']];
var BIST_SET=new Set('THYAO ASELS GARAN BIMAS KCHOL SASA PETKM EREGL TUPRS AKBNK YKBNK ISCTR FROTO TCELL HALKB VAKBN KOZAL KOZAA IPEKE EKGYO ARCLK TOASO SAHOL SISE ENKAI TAVHL PGSUS DOHOL ULKER MGROS CCOLA AEFES OTKAR KORDS ALARK GLYHO TKFEN ZOREN ODAS ENJSA AKSEN AYDEM GWIND SMRTG KONTR ASTOR ALFAS EUPWR HEKTS GUBRF BAGFS KLSER CANTE BERA DOAS MAVI TTRAK AKSA CIMSA BRISA ANHYT SOKE'.split(' '));
var US_SET=new Set('AAPL MSFT NVDA TSLA AMZN GOOGL GOOG META AMD INTC NFLX AVGO ORCL CRM ADBE QCOM TXN IBM GE BA JPM V MA WMT DIS PFE KO PEP XOM CVX PLTR COIN UBER ABNB SHOP SQ PYPL BABA NKE MCD CSCO T MU LRCX AMAT ASML TSM ARM SMCI DELL HPQ GS MS BAC WFC C BLK SCHW UNH JNJ LLY MRK ABBV COST HD LOW SBUX CAT DE MMM HON VZ TMUS CMCSA PDD JD NIO RIVN LCID SOFI HOOD MARA RIOT MSTR'.split(' '));
var BASE=[
{n:'Kafa Radyo',d:'Alternatif ve eğlenceli',g:'Alternatif',urls:['https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8']},
{n:'Kral Türk FM',d:'Türkü ve halk müziği',g:'Halk',urls:['https://live.radyositesihazir.com/8032/stream']},
{n:'Süper FM',d:'Türkçe pop',g:'Pop',urls:['https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM.mp3']},
{n:'Metro FM',d:'Yabancı hitler',g:'Yabancı',urls:['https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM.mp3']},
{n:'Joy Türk',d:'Türkçe slow pop',g:'Slow',urls:['https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK.mp3']},
{n:'PowerTürk',d:'Türkçe pop',g:'Pop',urls:['https://live.powerapp.com.tr/powerturk/mpeg/icecast.audio']},
{n:'Best FM',d:'Türkçe pop',g:'Pop',urls:['https://bestfm.radyotvonline.net/bestfm/playlist.m3u8','https://radyo.duhnet.tv/bestfm']}];
var legacy=LS.raw('radar_theme');
var S={view:LS.g('radar_view','feed'),cat:'all',tone:'all',q:'',saved:false,arch:'',
theme:LS.g('radar_theme_mode',legacy==='dark'?'dark':legacy==='light'?'light':'auto'),
dens:LS.g('radar_dens','comf'),fs:Number(LS.g('radar_fs',100)),
noimg:LS.raw('radar_hide_images')==='true',nomotion:LS.g('radar_nomotion',false),
h12:LS.raw('radar_age_12h')==='true',biasOff:LS.raw('radar_bias_filter')==='true',
prefs:LS.g('radar_prefs',null),alert:LS.g('radar_alert_on',false),th:Number(LS.g('radar_alert_th',3)),
muted:LS.g('radar_muted',false),vol:Number(LS.raw('radar_radio_volume')||0.8),
read:new Set(LS.g('radar_read',[])),liked:new Set(LS.g('radar_liked',[])),savedSet:new Set(LS.g('radar_saved',[])),fav:new Set(LS.g('radar_fav',[])),
brief:'genel',limit:24};
if(['feed','market','radio','scores','saved','menu'].indexOf(S.view)<0)S.view='feed';
S.later=new Set(LS.g('radar_later',[]));
var GPRIM=Number(LS.g('radar_gold_prim',3));
var NEWS=[],META=null,BRIEF={},MK=null,CR=[],ST=[],ARCH=null,archLoading=null,HIST={},booting=true;
var cur=null,hls=null,sleepT=0,curSt=-1,mIdx=0,playTok=0,wd=0,attOk=null,attErr=null,radioBusy=false;
var palIdx=0,palRows=[],cfFn=null,FXR=null,CVR=null,wgDone=false,speaking=null,lastErrT=0,tightOn=false;
var STATIONS=[],OFF=new Set(LS.g('radar_radio_off',[])),EXTRA=[];
(function(){var ex=LS.g('radar_radio_extra',[]);if(Array.isArray(ex))ex.forEach(function(x){if(x&&x.n&&Array.isArray(x.urls)&&x.urls.length)EXTRA.push(x)})})();
var CITY=LS.g('radar_city',{n:'Çorlu',la:LAT,lo:LON});
try{localStorage.removeItem('radar_buttondown_token')}catch(e){}
var BD_USER='radarhaber';
var MT={tab:'genel',wk:{},wkOK:false,wkFail:0,wkAsOf:0,bin:[],binTS:0,binOK:false,binFail:0,ws:null,wsExtra:null,ticks:{},live:{},
cg:null,fng:null,cf:'TRY',cs:'vol',cq:'',clim:100,cfav:new Set(LS.g('radar_cfav',[])),
stq:'',stSort:'vol',stMkt:'all',stDir:'all',stfav:new Set(LS.g('radar_stfav',[])),
detail:null,detailKind:null,detailKey:null,alr:{},timer:0,rtest:{},playedOk:new Set(),toastOnce:{},radioAuto:false,testing:false};
window.onerror=function(msg){var n=Date.now();if(n-lastErrT>30000){lastErrT=n;try{toast('⚠️ Script hatası: '+esc(String(msg).slice(0,90)),'err')}catch(e){}}return false};
function toast(m,k){var t=document.createElement('div');t.className='toast'+(k?' '+k:'');t.innerHTML=m;$('#toasts').appendChild(t);
setTimeout(function(){t.style.transition='opacity .3s,transform .3s';t.style.opacity='0';t.style.transform='translateX(18px)';setTimeout(function(){t.remove()},320)},3000)}
function openM(id){$(id).classList.add('on');document.body.classList.add('lock')}
function closeM(){var coin=$('#mCoin').classList.contains('on');clearTimeout(window._rdT);if(window._rdDirty){window._rdDirty=false;setTimeout(renderFeed,0)}
$$('.modal.on').forEach(function(m){m.classList.remove('on')});document.body.classList.remove('lock');stopSpeak();hidePop();
if(coin){MT.detail=null;if(S.view==='market')wsSet(null)}}
function ask(t,x,fn){$('#cfTitle').textContent=t;$('#cfText').textContent=x;cfFn=fn;openM('#mConfirm')}
function biasBadge(it){var r=it&&it.bias_score;if(r==null||r==='')return'';var v=Number(r);if(!isFinite(v))return'';
var b=v>=7?['bhi','⚠️ Sansasyonel']:v>=4?['bmd','⚡ Hafif abartılı']:['blo','✅ Tarafsız dil'];
return '<span class="badge '+b[0]+'" title="AI dil analizi '+v+'/10 · kesin değildir">'+b[1]+'</span>'}
var mq=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function applyTheme(){var dark=S.theme==='dark'||(S.theme==='auto'&&!!(mq&&mq.matches));
var mode=S.theme==='sepia'?'sepia':(dark?'dark':'light');
document.documentElement.setAttribute('data-theme',mode);
var mt=$('meta[name=theme-color]');if(mt)mt.content=mode==='dark'?'#0B1020':mode==='sepia'?'#F3EAD3':'#FAF7F2';
document.body.classList.toggle('noimg',S.noimg);document.body.classList.toggle('compact',S.dens==='comp');
document.body.classList.toggle('nomotion',S.nomotion);
document.documentElement.style.setProperty('--fs',String(S.fs/100));
var g=mode==='dark'?'☀️':mode==='sepia'?'🌙':'📜';$('#btnTheme').textContent=g;$('#btnThemeM').textContent=g;
var m=S.muted?'🔇':'🔊';$('#btnMute').textContent=m;$('#btnMuteM').textContent=m;
$('#audio').muted=S.muted;syncCtl();redrawSparks()}
function syncCtl(){
$$('#themeSeg button,#themeSegSide button').forEach(function(b){b.classList.toggle('on',b.dataset.theme===S.theme)});
$$('#densSeg button,#densSegSide button').forEach(function(b){b.classList.toggle('on',b.dataset.d===S.dens)});
['fontRange','fontRange2'].forEach(function(id){var e=$('#'+id);if(e)e.value=S.fs});
$('#fsVal').textContent=S.fs+'%';$('#fsVal2').textContent=S.fs+'%';
var m={swImg:S.noimg,swImgSide:!S.noimg,swMotion:S.nomotion,swMotionSide:!S.nomotion,sw12:S.h12,swBias:S.biasOff,swAlert:S.alert};
Object.keys(m).forEach(function(id){var e=$('#'+id);if(e)e.classList.toggle('on',!!m[id])});
$('#thRange').value=S.th;$('#thVal').textContent='%'+S.th}
function setTheme(t){S.theme=t;LS.s('radar_theme_mode',t);applyTheme()}
function spark(cv,vals,color){if(!cv)return;var w=cv.clientWidth||84,h=cv.clientHeight||28,dpr=Math.min(2,window.devicePixelRatio||1);
cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);var x=cv.getContext('2d');if(!x)return;
x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
var v=(vals||[]).filter(function(n){return isFinite(n)});
if(v.length<2){x.strokeStyle='rgba(130,145,175,.35)';x.lineWidth=1;x.beginPath();x.moveTo(2,h-4);x.lineTo(w-2,h-4);x.stroke();return}
var mn=Math.min.apply(null,v),mx=Math.max.apply(null,v),rg=(mx-mn)||1,p=3;
var X=function(i){return 2+i*(w-4)/(v.length-1)},Y=function(n){return h-p-((n-mn)/rg)*(h-p*2)};
var cs=getComputedStyle(document.documentElement),c=(color||(v[v.length-1]>=v[0]?cs.getPropertyValue('--up'):cs.getPropertyValue('--dn'))).trim();
var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,c+'55');g.addColorStop(1,c+'00');
x.beginPath();x.moveTo(X(0),Y(v[0]));v.forEach(function(n,i){x.lineTo(X(i),Y(n))});x.lineTo(X(v.length-1),h);x.lineTo(X(0),h);x.closePath();x.fillStyle=g;x.fill();
x.beginPath();x.moveTo(X(0),Y(v[0]));v.forEach(function(n,i){x.lineTo(X(i),Y(n))});x.strokeStyle=c;x.lineWidth=1.7;x.lineJoin='round';x.stroke();
x.beginPath();x.arc(X(v.length-1),Y(v[v.length-1]),2.4,0,7);x.fillStyle=c;x.fill()}
function redrawSparks(){$$('canvas[data-spark]').forEach(function(cv){try{spark(cv,JSON.parse(cv.dataset.spark),cv.dataset.color||null)}catch(e){}})}
function jpost(u,body,opt){opt=opt||{};var c=new AbortController(),t=setTimeout(function(){c.abort()},opt.ms||10000);
return fetch(u,{method:'POST',signal:c.signal,cache:'no-store',headers:opt.headers||{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){clearTimeout(t);if(!r.ok)throw new Error('HTTP '+r.status);return r.json().catch(function(){return{}})}).catch(function(e){clearTimeout(t);throw e})}
function jget(u,ms){var c=new AbortController(),t=setTimeout(function(){c.abort()},ms||9000);
return fetch(u,{signal:c.signal,cache:'no-store'}).then(function(r){clearTimeout(t);if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).catch(function(e){clearTimeout(t);throw e})}
function rebuildHist(){HIST={};if(!ARCH)return;
ARCH.forEach(function(a){var d=a.data,push=function(k,v){if(v==null||!isFinite(v))return;(HIST[k]=HIST[k]||[]).push({t:a.date,v:Number(v)})};
if(d.market){push('USD/TRY',d.market.usdtry);push('EUR/TRY',d.market.eurtry);push('Gram Altın',d.market.gold_gram_try)}
(d.crypto||[]).forEach(function(c){push(c.label,c.price)});(d.stocks||[]).forEach(function(s){push(s.label,s.price)})})}
function hist(k){return (HIST[k]||[]).map(function(p){return p.v})}
var DL_DONE=false;
// Derin link parametreleri yüklemede yakalanır: syncUrl() veri gelmeden URL'den news/match/sym'i siliyordu.
var DL_Q=new URLSearchParams(location.search);
function deepLink(){if(DL_DONE)return;var p=DL_Q;
var nl=p.get('news'),mid=p.get('match'),sym=p.get('sym');
if(!nl&&!mid&&!sym)return;DL_DONE=true;
if(nl){setView('feed');
// Tek kimlik: haberi aç. Virgüllü (TG "Tümünü aç"): o haberlerin listesi.
var ids=nl.indexOf('http')===0?[nl]:nl.split(',').filter(Boolean);
dlResolve(ids).then(function(found){
if(!found.length){toast('Haber artık akışta yok','warn');return}
if(ids.length===1)openNews(found[0]);else openList(found,ids.length)})}
else if(mid){var sp=p.get('sport'),dt=p.get('date');
if(sp&&['football','basketball','volleyball'].indexOf(sp)>=0)SC.sport=sp;
if(dt&&/^\d{8}$/.test(dt))SC.date=dt;
setView('scores');scLoad(true).then(function(){scOpen(mid)})}
else if(sym){setView('market');setTimeout(function(){if(MT.bin.some(function(x){return x.sym===sym}))openCoin(sym);else openStock(sym)},2500)}
try{var u=new URL(location.href);u.searchParams.delete('news');u.searchParams.delete('match');u.searchParams.delete('sym');history.replaceState(null,'',u.toString())}catch(e){}}
// Kimlikleri (nid/link) önce akışta, bulunamayanları son 12 günün arşivinde arar; sırayı korur.
function dlResolve(ids){var res={},miss=[];
ids.forEach(function(id){var it=findNews(id);if(it)res[id]=it;else miss.push(id)});
var done=function(){return ids.map(function(id){return res[id]}).filter(Boolean)};
if(!miss.length)return Promise.resolve(done());
toast('Haber arşivde aranıyor…');
return loadArch(12).then(function(a){(a||[]).slice().reverse().forEach(function(x){((x.data&&x.data.items)||[]).forEach(function(n){
miss.forEach(function(id){if(!res[id]&&(n.nid===id||n.link===id))res[id]=n})})});return done()})}
function openList(items,asked){var L=$('#mListBody');DL_LIST=items;
$('#mListTitle').textContent='📲 Telegram\'dan gelen '+items.length+' haber';
L.innerHTML=items.map(function(n,i){return '<button class="lrow" data-li="'+i+'"><small>'+esc(n.source||'')+'</small><b>'+esc(n.title||'')+'</b></button>'}).join('')+
(items.length<asked?'<p class="hint">'+(asked-items.length)+' haber artık akışta ve arşivde yok.</p>':'');
openM('#mList')}
var DL_LIST=[];
// Tarayıcı ağ hataları İngilizce gelir ('Failed to fetch'): kullanıcıya Türkçe göster.
function errTR(e){var m=String((e&&e.message)||e||'');return /^HTTP \d+/.test(m)?'sunucu hatası ('+m+')':'bağlantı hatası'}
function loadData(path){var p=path||S.arch||'news.json';
return jget(p+'?t='+Date.now(),12000).then(function(d){
NEWS=Array.isArray(d.items)?d.items:[];META=d.meta||null;BRIEF=d.briefings||{};
MK=d.market||null;CR=Array.isArray(d.crypto)?d.crypto:[];ST=Array.isArray(d.stocks)?d.stocks:[];
rebuildHist();booting=false;S.limit=24;
renderCats();renderFeed();renderBrief();renderRail();renderMarket();renderSaved();renderLater();renderEvents();renderUsage();checkStale();renderAbout();
$('#sideMeta').textContent=(META&&META.model?String(META.model).split('/').pop():'—')+' · '+NEWS.length+' haber';
deepLink();
}).catch(function(e){booting=false;
$('#newsGrid').innerHTML='<div class="empty"><b>📡</b><p>Veri alınamadı: '+esc(errTR(e))+'. Bağlantını kontrol edip biraz sonra tekrar dene.</p></div>';
toast('Veri alınamadı','err')})}
function checkStale(){var n=$('#stale');if(S.arch){n.className='note';return}
var g=META&&META.generated_at;if(!g){n.className='note';return}
var m=(Date.now()-new Date(g).getTime())/6e4;if(!isFinite(m)){n.className='note';return}
var t=m<60?Math.round(m)+' dakika':m<1440?Math.round(m/60)+' saat':Math.round(m/1440)+' gün';
if(m>=180){n.className='note warn show';n.innerHTML='⚠️ <b>Veri '+t+' önce güncellendi.</b> Haber botu çalışmamış olabilir — Actions sekmesine bak.'}
else if(m>=20){n.className='note info show';n.innerHTML='🕒 Son güncelleme: '+t+' önce'}else n.className='note'}
function loadArch(n){if(ARCH)return Promise.resolve(ARCH);if(archLoading)return archLoading;
archLoading=jget('archive/index.json?t='+Date.now(),9000).then(function(ix){
var ds=(ix.dates||[]).slice().sort(function(a,b){return String(b.date).localeCompare(String(a.date))}).slice(0,n||12);
return Promise.allSettled(ds.map(function(d){return jget(d.path+'?t='+Date.now(),12000)})).then(function(res){
ARCH=[];res.forEach(function(r,i){if(r.status==='fulfilled'&&r.value)ARCH.push({date:ds[i].date,data:r.value})});
ARCH.sort(function(a,b){return String(a.date).localeCompare(String(b.date))});rebuildHist();return ARCH})
}).catch(function(){ARCH=[];return ARCH}).then(function(r){archLoading=null;return r});
return archLoading}
/* ================= AKIŞ ================= */
function findNews(l){for(var i=0;i<NEWS.length;i++)if(NEWS[i].nid===l||NEWS[i].link===l)return NEWS[i];return null}
function filtered(){var a=NEWS;
if(S.saved)a=a.filter(function(n){return S.savedSet.has(n.link)});
else if(S.cat==='all'){if(S.prefs&&S.prefs.length)a=a.filter(function(n){return S.prefs.indexOf(n.catId)>=0})}
else a=a.filter(function(n){return n.catId===S.cat});
if(S.tone!=='all')a=a.filter(function(n){return n.tone===S.tone});
if(S.biasOff)a=a.filter(function(n){return !(Number(n.bias_score)>=7)});
if(S.h12){var t=Date.now()-432e5;a=a.filter(function(n){return new Date(n.pubDate).getTime()>t})}
if(S.q){var q=S.q.toLocaleLowerCase('tr');a=a.filter(function(n){return [n.title,n.summary,n.source,n.cat].some(function(x){return x&&String(x).toLocaleLowerCase('tr').indexOf(q)>=0})})}
return a.slice().sort(function(x,y){return (S.read.has(x.link)-S.read.has(y.link))||(y.score||0)-(x.score||0)||new Date(y.pubDate)-new Date(x.pubDate)})}
function cardHTML(n,i){var c=CATS[n.catId]||{l:'Haber',c:'#64748B'},sc=n.score||5,scC=sc>=8?'var(--gold)':sc>=6?'var(--cy)':'var(--ink3)';
var sum=n.summary||'Özet yok — kaynaktan okuyabilirsin.',bad=sum.indexOf('ulaşılamadı')>=0;
var multi=n.other_sources&&n.other_sources.length?'<span class="multi">+'+n.other_sources.length+'</span>':'';
var img=n.image?'<img class="nci" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="'+esc(n.image)+'" alt="" onerror="this.remove()">':'';
return '<article class="nc'+(S.read.has(n.link)?' read':'')+'" style="--cc:'+c.c+';animation-delay:'+Math.min(i,12)*35+'ms" data-link="'+esc(n.link)+'" tabindex="0"><div class="ncb">'+
'<div class="nct"><span class="dot"></span><span class="src">'+esc(n.source||'Kaynak')+'</span>'+multi+
'<span class="score" style="color:'+scC+';border-color:'+scC+'">★ '+sc+'</span></div>'+
'<h3 class="nch">'+esc(n.title||'')+'</h3><p class="ncs'+(bad?' bad':'')+'">'+esc(sum)+'</p>'+
(n.why_important?'<div class="ncw">💡 '+esc(n.why_important)+'</div>':'')+
'<div class="ncf"><span>'+ago(n.pubDate)+'</span>'+(S.read.has(n.link)?'<span class="rdk" title="Okundu">✓<i> Okundu</i></span>':'')+(n.ai&&n.ai.model?'<span class="badge bai" data-ai role="button" tabindex="0">✦ AI</span>':'')+biasBadge(n)+
'<span class="acts"><span class="act lt'+(S.later.has(n.link)?' on':'')+'" role="button" tabindex="0" aria-label="Sonra oku">🕑</span><span class="act sv'+(S.savedSet.has(n.link)?' on':'')+'" role="button" tabindex="0" aria-label="Kaydet">📌</span><span class="act lk'+(S.liked.has(n.link)?' liked':'')+'" role="button" tabindex="0" aria-label="Beğen">'+(S.liked.has(n.link)?'♥':'♡')+'</span></span></div>'+
'</div>'+img+'</article>'}
function paintGrid(host,arr,limit){
if(!arr.length){host.innerHTML='<div class="empty"><b>🔍</b><p>Bu filtreyle haber yok. Kategoriyi ya da ton filtresini değiştirmeyi dene.</p></div>';return}
host.innerHTML=(limit?arr.slice(0,limit):arr).map(cardHTML).join('')}
function maybeMore(){requestAnimationFrame(function(){if(S.view!=='feed'||booting)return;
var a=filtered();if(a.length<=S.limit)return;
var r=$('#ioSentinel').getBoundingClientRect();
if(r.top<innerHeight+600){S.limit+=24;renderFeed()}})}
function renderFeed(){if(booting){$('#newsGrid').innerHTML=new Array(9).join('x').split('x').map(function(){return '<div class="sk"></div>'}).join('');return}
var a=filtered();paintGrid($('#newsGrid'),a,S.limit);$('#feedCount').textContent=a.length+' haber';
$('#more').classList.toggle('show',a.length>S.limit);$('#moreBtn').textContent='Daha fazla ('+(a.length-S.limit)+' kaldı)';
$('#brief').style.display=(S.cat==='all'&&!S.arch&&S.view==='feed')?'':'none';
renderFilterBar();syncUrl();maybeMore()}
function renderSaved(){var a=NEWS.filter(function(n){return S.savedSet.has(n.link)});
$('#savedSub').textContent=S.savedSet.size+' kayıt · '+a.length+' tanesi güncel akışta';
if(!S.savedSet.size){$('#savedGrid').innerHTML='<div class="empty"><b>📌</b><p>Henüz kayıt yok. Bir haberin altındaki 📌 düğmesine bas, burada birikir.</p></div>';return}
paintGrid($('#savedGrid'),a,0)}
function renderCats(){var co={};NEWS.forEach(function(n){co[n.catId]=(co[n.catId]||0)+1});
$('#cats').innerHTML=ORDER.map(function(k){var c=k==='all'?{l:'Senin İçin',c:'var(--pri)'}:CATS[k],n=k==='all'?NEWS.length:(co[k]||0);
return '<div class="cat'+(S.cat===k&&!S.saved?' on':'')+'" role="button" tabindex="0" data-cat="'+k+'"><i style="background:'+c.c+'"></i>'+c.l+'<b>'+n+'</b></div>'}).join('');
requestAnimationFrame(catArrows)}
// Yatay şeritlerde (kategoriler, canlı maçlar) taşma varsa ‹ › okları göster.
function rowArrows(id){var w=$('#'+id);if(!w)return;var over=!w.hidden&&w.scrollWidth-w.clientWidth>6;
$('#'+id+'L').classList.toggle('show',over&&w.scrollLeft>4);
$('#'+id+'R').classList.toggle('show',over&&w.scrollLeft<w.scrollWidth-w.clientWidth-4)}
function catArrows(){rowArrows('cats');rowArrows('liveRow')}
function renderBrief(){$('#briefText').textContent=BRIEF[S.brief]||'Analiz hazırlanamadı.';
$$('#briefTabs button').forEach(function(b){b.classList.toggle('on',b.dataset.b===S.brief)})}
function fchip(label,val,key){return '<span class="fchip">'+label+': <b>'+esc(val)+'</b><span data-fc="'+key+'" role="button" tabindex="0" title="Bu filtreyi kaldır">✕</span></span>'}
function renderFilterBar(){var b=$('#filterBar'),c=$('#filterChips');if(!b||!c)return;var p=[];
if(S.q)p.push(fchip('Arama',S.q,'q'));
if(S.tone!=='all')p.push(fchip('Ton',S.tone,'tone'));
if(S.saved)p.push(fchip('Görünüm','Kaydedilenler','saved'));
else if(S.cat!=='all')p.push(fchip('Kategori',(CATS[S.cat]||{l:S.cat}).l,'cat'));
if(S.h12)p.push(fchip('Zaman','Son 12 saat','h12'));
if(S.biasOff)p.push(fchip('Gizlenen','Sansasyonel','bias'));
c.innerHTML=p.join('');b.classList.toggle('show',p.length>0)}
function clearFilters(k){
if(k==='q'){S.q='';$('#paIn').value=''}
else if(k==='tone'){S.tone='all';$$('#toneSeg button').forEach(function(x){x.classList.toggle('on',x.dataset.tone==='all')})}
else if(k==='cat'){S.cat='all';renderCats()}
else if(k==='saved'){S.saved=false}
else if(k==='h12'){S.h12=false;LS.set('radar_age_12h',false)}
else if(k==='bias'){S.biasOff=false;LS.set('radar_bias_filter',false)}
else if(k==='all'){S.q='';S.tone='all';S.cat='all';S.saved=false;S.h12=false;S.biasOff=false;
LS.set('radar_age_12h',false);LS.set('radar_bias_filter',false);$('#paIn').value='';
$$('#toneSeg button').forEach(function(x){x.classList.toggle('on',x.dataset.tone==='all')});renderCats()}
syncCtl();S.limit=24;renderFeed()}
function toggleSave(l){trackUsage('Kaydet');S.savedSet.has(l)?S.savedSet.delete(l):S.savedSet.add(l);LS.s('radar_saved',Array.from(S.savedSet));renderSaved();renderUsage()}
function toggleLater(l){trackUsage('Sonra oku');S.later.has(l)?S.later.delete(l):S.later.add(l);LS.s('radar_later',Array.from(S.later));renderLater();renderUsage()}
function trackUsage(action){var u=LS.g('radar_usage',{});u[action]=(u[action]||0)+1;LS.s('radar_usage',u)}
function renderUsage(){var u=LS.g('radar_usage',{}),box=$('#usageBox');if(!box)return;
if(!Object.keys(u).length){box.innerHTML='<p class="hint">Kullanım verisi yok.</p>';return}
box.innerHTML=Object.entries(u).sort(function(a,b){return b[1]-a[1]}).map(function(e){
return '<div class="kv"><span>'+esc(e[0])+'</span><b>'+e[1]+' kez</b></div>'}).join('')}
var EVKEY=['festival','konser','fuar','sergi','tiyatro','maç','turnuva','vizyon','etkinlik','sahne','prömiyer','bienal','karnaval'];
function renderEvents(){var box=$('#eventsGrid');if(!box)return;
var now=Date.now(),week=7*864e5;
var events=NEWS.filter(function(n){var t=new Date(n.pubDate).getTime();if(!(t>now-week&&t<now+week))return false;
var s=(n.title+' '+(n.summary||'')).toLocaleLowerCase('tr');return EVKEY.some(function(k){return s.indexOf(k)>=0})}).slice(0,6);
if(!events.length){box.innerHTML='<div class="empty"><b>📅</b><p>Bu hafta etkinlik haberi yok.</p></div>';return}
box.innerHTML=events.map(function(n){var d=new Date(n.pubDate);
return '<div class="nc" data-link="'+esc(n.link)+'"><div class="ncb"><div class="nct"><span class="dot" style="background:var(--warn)"></span><span class="src">Etkinlik</span></div><h3 class="nch">'+esc(n.title)+'</h3><div class="ncf"><span>'+d.toLocaleDateString('tr-TR',{day:'2-digit',month:'long'})+' · '+ago(n.pubDate)+'</span></div></div></div>'}).join('')}
function renderLater(){var a=NEWS.filter(function(n){return S.later.has(n.link)});
var lc=$('#laterCount');if(lc)lc.textContent=a.length+' haber';
if(!S.later.size){$('#laterGrid').innerHTML='<div class="empty"><b>🕑</b><p>Listen boş. Haber kartındaki 🕑 simgesine bas, burada birikir.</p></div>';return}
paintGrid($('#laterGrid'),a,0)}
function toggleLike(l,el){var on=!S.liked.has(l);on?S.liked.add(l):S.liked.delete(l);
LS.s('radar_liked',Array.from(S.liked));if(el){el.classList.toggle('liked',on);el.textContent=on?'♥':'♡'}}
/* ================= SAĞ RAY ================= */
function renderRail(){var rows=[];
var u=findFx('USDTRY');rows.push(['USD/TRY',u?u.v:(MK&&MK.usdtry),u?u.p:null,null]);
var gbr=gramBase();rows.push(['Gram Altın',gbr.v,gbr.p,gbr.ha?gbr.ha.alis:null]);
var b=MT.live.BTCTRY||MT.bin.filter(function(x){return x.sym==='BTCTRY'})[0];rows.push(['Bitcoin',b?b.v:(CR[0]&&CR[0].price),b?b.p:(CR[0]&&CR[0].change_pct),null]);
var e=MT.live.ETHTRY||MT.bin.filter(function(x){return x.sym==='ETHTRY'})[0];rows.push(['Ethereum',e?e.v:(CR[1]&&CR[1].price),e?e.p:(CR[1]&&CR[1].change_pct),null]);
$('#railMk').innerHTML=rows.map(function(r){return '<div class="kv"><span>'+r[0]+'</span><b>'+(r[3]!=null?fmtC(r[3])+' / ':'')+(r[1]!=null?fmtC(r[1]):'—')+(r[2]!=null?' <i class="'+cls(r[2])+'" style="font-style:normal;font-size:11px">'+pct(r[2])+'</i>':'')+'</b></div>'}).join('')}
function favList(){var out=[];
MT.bin.forEach(function(x){if(MT.cfav.has(x.sym))out.push({kind:'coin',r:x})});
stPool().forEach(function(q){if(MT.stfav.has(q.k))out.push({kind:'stk',r:q})});
return out}
function renderFav(){var body=$('#favBody');if(!body)return;var L=favList();
if(!L.length){body.innerHTML='<p class="hint">Henüz favori yok. Kripto veya hisse tablosunda ★ simgesine dokun.</p>';return}
body.innerHTML=L.slice(0,10).map(function(x){var r=x.r,live=x.kind==='coin'&&MT.live[r.sym];
var v=live?live.v:r.v,p=live?live.p:r.p;
var cs=x.kind==='coin'?(r.quote==='TRY'?' ₺':' $'):(r.grp==='bist'?' ₺':' $');
return '<div class="kv" data-favrow="'+x.kind+'|'+esc(x.kind==='coin'?r.sym:r.k)+'" role="button" tabindex="0"><span>'+esc(x.kind==='coin'?r.base:r.disp)+'</span><b>'+price(v)+cs+' <i class="'+cls(p)+'" style="font-style:normal">'+pct(p)+'</i></b></div>'}).join('')}
function sentiment(){var box=$('#sentBody');box.innerHTML='<div class="skb"></div>';
loadArch(10).then(function(arch){
var seen=new Map(),add=function(it){(it||[]).forEach(function(x){if(x&&x.link&&x.pubDate&&!seen.has(x.link))seen.set(x.link,x)})};
add(NEWS);arch.forEach(function(a){add(a.data.items)});
var days=[],i,d;for(i=6;i>=0;i--){d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);
days.push({k:d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2),l:d.toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'}),p:0,n:0,g:0,t:0})}
var idx={};days.forEach(function(x){idx[x.k]=x});
seen.forEach(function(x){var t=new Date(x.pubDate);if(isNaN(t.getTime()))return;
var k=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2),dd=idx[k];if(!dd)return;
dd.t++;if(x.tone==='pozitif')dd.p++;else if(x.tone==='negatif')dd.g++;else dd.n++});
var has=days.filter(function(x){return x.t});
if(!has.length){box.innerHTML='<p class="hint">Arşivde yeterli veri yok. Bot birkaç gün çalışınca dolar.</p>';return}
var tp=0,tg=0,tt=0;has.forEach(function(x){tp+=x.p;tg+=x.g;tt+=x.t});
var h='<div style="font:800 12.5px var(--sans);margin-bottom:10px">'+(tg>tp?'Ton olumsuza yakın':tp>tg?'Ton olumluya yakın':'Ton dengeli')+' · '+tt+' haber</div>';
days.forEach(function(x){h+='<div class="sr"><span class="srd">'+x.l+'</span><div class="srb">'+
(x.t?'<i style="width:'+(x.p/x.t*100)+'%;background:var(--up)"></i><i style="width:'+(x.n/x.t*100)+'%;background:var(--ink3)"></i><i style="width:'+(x.g/x.t*100)+'%;background:var(--dn)"></i>':'')+
'</div><span class="srn">'+x.t+'</span></div>'});
h+='<div class="slg"><span>🟩 olumlu</span><span>⬜ nötr</span><span>🟥 olumsuz</span></div><p class="hint">Arşiv anlıktır; aynı haber tek sayılır. Ton etiketi AI tahminidir.</p>';
box.innerHTML=h;$('#sentGo').textContent='↻ Yeniden hesapla'})}
/* ================= PİYASA MOTORU ================= */
function wkAll(){return Object.keys(MT.wk).map(function(k){return MT.wk[k]})}
function findFx(n){var r=null;wkAll().forEach(function(q){if(q.grp==='fx'&&normK(q.k)===n)r=q});return r}
function findMetal(cands){var r=null;wkAll().forEach(function(q){if(q.grp==='metal'&&cands.indexOf(normK(q.k))>=0)r=q});return r}
function gramBase(){var g=findMetal(['GRAMALTIN','GRAMALTINTL','XAUTRY']),o=findMetal(['ONSALTIN','XAUUSD','XAU','GOLD','ALTINONS']),u=findFx('USDTRY');
var ha=(g&&g.alis!=null)?g:((MK&&MK.gram_altin&&MK.gram_altin.satis)?{alis:MK.gram_altin.alis,satis:MK.gram_altin.satis,p:MK.gram_altin.change_pct}:null);
var usd=u?u.v:(MK&&MK.usdtry);
var v=g?g.v:(ha?ha.satis:(o&&usd?o.v/31.1035*usd:(MK&&MK.gold_gram_try)));
var p=g?g.p:(ha?ha.p:(o&&u?(o.p||0)+(u.p||0):null));
return{v:v,p:p,ons:o,usd:u,usdV:usd,direct:!!g,ha:ha}}
function dispSym(k){var s=String(k||''),i=s.indexOf(':');if(i>=0)s=s.slice(i+1);return s.replace(/\.IS$/i,'')}
function stClassify(q){var g=q.grp;if(g==='bist'||g==='us')return g;
var k=String(q.k||''),i=k.indexOf(':'),pfx=i>=0?k.slice(0,i).toUpperCase():'',b=dispSym(k).toUpperCase();
if(pfx==='BIST')return'bist';if(pfx)return'us';if(/\.IS$/i.test(k))return'bist';
if(US_SET.has(b))return'us';if(BIST_SET.has(b))return'bist';
if(/[ÇĞİÖŞÜçğıöşü]/.test(String(q.n||'')))return'bist';
return /^[A-Z]{5}$/.test(b)?'bist':'us'}
function stPool(){var w=wkAll().filter(function(q){return (q.grp==='st'||q.grp==='bist'||q.grp==='us')&&isFinite(q.v)&&q.v>0});
if(w.length)return w.map(function(q){return{k:q.k,disp:dispSym(q.k),n:q.n||dispSym(q.k),v:q.v,p:q.p,vol:q.vol||0,mcap:q.mcap||0,grp:stClassify(q),src:q.src||'tv',s:Array.isArray(q.s)?q.s:[]}});
var bn=['BIST 100','THY','Aselsan','Garanti BBVA','BİM'];
return ST.map(function(s){return{k:s.label,disp:s.label,n:s.label,v:s.price,p:s.change_pct,vol:0,mcap:0,grp:bn.indexOf(s.label)>=0?'bist':'us',src:'bot',s:hist(s.label)}})}
function idxRows(){return wkAll().filter(function(q){return q.grp==='idx'&&isFinite(q.v)&&q.v>0})}
function wkLoad(){return jget(MKT_URL+'?g=fx,metal,st,idx',10000).then(function(d){
MT.wk={};(d.quotes||[]).forEach(function(q){if(q&&q.k&&isFinite(q.v)&&q.v>0)MT.wk[(q.grp||'?')+':'+q.k]=q});
MT.wkOK=true;MT.wkFail=0;MT.wkAsOf=typeof d.as_of==='number'?d.as_of:(Date.parse(d.as_of)||Date.now());MT.ha=d.ha||null;
}).catch(function(){MT.wkFail++;if(MT.wkFail>=3)MT.wkOK=false})}
function binLoad(){return jget('https://api.binance.com/api/v3/ticker/24hr',15000).then(function(d){
var ok=['TRY','USDT','FDUSD','USDC'];
MT.bin=(Array.isArray(d)?d:[]).filter(function(x){return ok.indexOf((x.symbol||'').slice(-4))>=0||ok.indexOf((x.symbol||'').slice(-3))>=0})
.filter(function(x){return +x.lastPrice>0&&+x.quoteVolume>0})
.map(function(x){var q='TRY';['USDT','FDUSD','USDC'].forEach(function(s){if(x.symbol.slice(-s.length)===s)q=s});
if(x.symbol.slice(-3)==='TRY')q='TRY';
return{sym:x.symbol,base:x.symbol.slice(0,x.symbol.length-q.length),quote:q,v:+x.lastPrice,p:+x.priceChangePercent,
vol:+x.quoteVolume,hi:+x.highPrice,lo:+x.lowPrice,tr:+x.count}});
MT.binTS=Date.now();MT.binOK=true;MT.binFail=0;
}).catch(function(){MT.binFail++;if(MT.binFail>=3)MT.binOK=false})}
function pctS(v){return v==null||!isFinite(v)?'—':pct(v)}
function cgMktLoad(){return jget('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=250&page=1&price_change_percentage=1h%2C24h%2C7d%2C30d',12000).then(function(d){
MT.cgm={};(Array.isArray(d)?d:[]).forEach(function(c){if(c&&c.symbol)MT.cgm[String(c.symbol).toUpperCase()]={h1:c.price_change_percentage_1h_in_currency,d7:c.price_change_percentage_7d_in_currency,d30:c.price_change_percentage_30d_in_currency}});
MT.cgmTS=Date.now();}).catch(function(){})}
function cgLoad(){return jget('https://api.coingecko.com/api/v3/global',10000).then(function(d){MT.cg=d.data||null}).catch(function(){})}
function fngLoad(){return jget('https://api.alternative.me/fng/?limit=1',8000).then(function(d){MT.fng=(d.data||[])[0]||null}).catch(function(){})}
function setBinChip(live){var c=$('#mkBin');if(!c)return;
c.className='srcc'+(live?' live':'');
c.innerHTML='<span class="pd"></span>kripto: '+(live?'CANLI · tik':MT.binOK?'60 sn':'bot')}
function wsSet(extra){MT.wsExtra=extra||null;
try{if(MT.ws){MT.ws.onclose=null;MT.ws.close()}}catch(e){}
var streams=['btctry@miniTicker','ethtry@miniTicker'];if(extra&&streams.indexOf(extra)<0)streams.push(extra);
var ws;try{ws=new WebSocket('wss://stream.binance.com:9443/stream?streams='+streams.join('/'))}catch(e){setBinChip(false);return}
MT.ws=ws;
ws.onopen=function(){setBinChip(true)};
ws.onmessage=function(e){try{var d=JSON.parse(e.data),t=d.data;if(t)onTick(t)}catch(err){}};
ws.onclose=function(){setBinChip(false);if(S.view==='market'&&!document.hidden)setTimeout(function(){if(S.view==='market')wsSet(MT.wsExtra)},3000)};
ws.onerror=function(){setBinChip(false)}}
function onTick(t){var sym=t.s,v=+t.c,o=+t.o;if(!isFinite(v))return;
var p=o?((v-o)/o*100):null,prev=MT.live[sym]?MT.live[sym].v:null;
MT.live[sym]={v:v,p:p,t:Date.now()};
(MT.ticks[sym]=MT.ticks[sym]||[]).push(v);if(MT.ticks[sym].length>140)MT.ticks[sym].shift();
var row=document.querySelector('tr[data-sym="'+sym+'"]');
if(row){var pc=row.querySelector('.cv'),pp=row.querySelector('.cp');
if(pc){pc.textContent=fmtC(v)+(sym.slice(-3)==='TRY'?' ₺':' $');if(prev!=null&&v!==prev){row.classList.remove('fu','fd');void row.offsetWidth;row.classList.add(v>prev?'fu':'fd')}}
if(pp&&p!=null){pp.className='cp '+cls(p);pp.textContent=arw(p)+' '+pct(p)}}
var hero=document.querySelector('[data-hero="'+sym+'"] .hv');
if(hero){hero.textContent=fmtC(v)+' ₺';if(prev!=null&&v!==prev){hero.parentNode.classList.remove('fu','fd');void hero.parentNode.offsetWidth;hero.parentNode.classList.add(v>prev?'fu':'fd')}}
var hp=document.querySelector('[data-hero="'+sym+'"] .pill');
if(hp&&p!=null){hp.className='pill '+cls(p);hp.textContent=arw(p)+' '+pct(p)}
if(MT.detail===sym){$('#cPrice').textContent=fmtC(v)+(sym.slice(-3)==='TRY'?' ₺':' $');
var cc=$('#cChg');if(cc&&p!=null)cc.innerHTML='<span class="pill '+cls(p)+'">'+arw(p)+' '+pct(p)+'</span> <span style="color:var(--ink3)">24 saat</span>';
spark($('#cSpark'),MT.ticks[sym])}
if(S.alert&&p!=null&&Math.abs(p)>=S.th){var key=sym+Math.sign(p);if(!MT.alr[key]){MT.alr[key]=1;notify({n:sym,p:p,v:v})}}}
function notify(r){toast('🔔 '+esc(r.n)+' '+pct(r.p)+' · '+fmtC(r.v),'warn');
try{if('Notification'in window&&Notification.permission==='granted')new Notification('RADAR · '+r.n,{body:pct(r.p),icon:'icon-192.png'})}catch(e){}}
function hlBar(v,lo,hi){if(!isFinite(lo)||!isFinite(hi)||hi<=lo)return'';
var p=clamp((v-lo)/(hi-lo)*100,0,100);
return '<span class="hlb" title="Gün içi aralık"><i style="left:calc('+p.toFixed(1)+'% - 1px)"></i></span>'}
function binRows(){var q=MT.cf==='all'?MT.bin:MT.bin.filter(function(x){return x.quote===MT.cf});
if(MT.cq){var s=MT.cq.toLocaleUpperCase('tr');q=q.filter(function(x){return x.base.indexOf(s)>=0||x.sym.indexOf(s)>=0})}
q=q.slice();q.sort(function(a,b){
var fa=MT.cfav.has(a.sym)?0:1,fb=MT.cfav.has(b.sym)?0:1;if(fa!==fb)return fa-fb;
if(MT.cs==='chg')return b.p-a.p;if(MT.cs==='price')return b.v-a.v;return b.vol-a.vol});
return q}
function coinRow(x){var live=MT.live[x.sym],v=live?live.v:x.v,p=live?live.p:x.p,cm=MT.cgm[x.base.toUpperCase()]||{};
return '<tr data-sym="'+x.sym+'"><td class="l"><span class="cn"><i style="background:'+(x.quote==='TRY'?'var(--gold)':'var(--cy)')+'"></i>'+esc(x.base)+
'<span style="color:var(--ink3);font:700 10px var(--mono)">/'+x.quote+'</span></span></td>'+
'<td class="cv">'+fmtC(v)+(x.quote==='TRY'?' ₺':' $')+'</td>'+
'<td class="cp '+cls(p)+'">'+arw(p)+' '+pct(p)+'</td>'+
'<td class="'+cls(cm.h1)+'">'+pctS(cm.h1)+'</td><td class="'+cls(cm.d7)+'">'+pctS(cm.d7)+'</td><td class="'+cls(cm.d30)+'">'+pctS(cm.d30)+'</td>'+
'<td>'+vol(x.vol)+(x.quote==='TRY'?' ₺':' $')+'</td>'+
'<td>'+hlBar(v,x.lo,x.hi)+'</td>'+
'<td><span class="stx'+(MT.cfav.has(x.sym)?' on':'')+'" role="button" tabindex="0" data-fav="'+x.sym+'">'+(MT.cfav.has(x.sym)?'★':'☆')+'</span></td></tr>'}
function gauge(v){var a=clamp(Number(v||0),0,100),ang=a/100*180-90;
var col=a<25?'var(--dn)':a<45?'var(--warn)':a<55?'var(--ink3)':a<75?'#84CC16':'var(--up)';
return '<div class="gauge"><svg width="120" height="70" viewBox="0 0 120 70">'+
'<path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="var(--ln2)" stroke-width="9" stroke-linecap="round"/>'+
'<path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="'+col+'" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+(a/100*157).toFixed(0)+' 200"/>'+
'<line x1="60" y1="62" x2="60" y2="24" stroke="'+col+'" stroke-width="3" stroke-linecap="round" transform="rotate('+ang.toFixed(1)+' 60 62)"/>'+
'<circle cx="60" cy="62" r="5" fill="'+col+'"/></svg>'+
'<div><b style="color:'+col+'">'+Math.round(a)+'/100</b><br><span>'+esc((MT.fng&&MT.fng.value_classification)||'—')+'</span></div></div>'}
function hero(n,v,p,tag,series){return '<div class="hero" data-hero="'+(n==='Bitcoin'?'BTCTRY':'')+'"><div class="hhh">'+esc(n)+
'<span class="tg'+(tag&&tag.indexOf('CANLI')===0?' live':'')+'">'+esc(tag||'BOT')+'</span></div>'+
'<div class="hv '+cls(p)+'">'+(v!=null?fmtC(v):'—')+'</div>'+
'<div class="hd">'+(p!=null?'<span class="pill '+cls(p)+'">'+arw(p)+' '+pct(p)+'</span>':'<span class="pill fl">—</span>')+'</div>'+
'<canvas class="spark" data-spark=\''+JSON.stringify(series||[])+'\'></canvas></div>'}
function mGen(){var h=[],gb=gramBase(),usd=gb.usdV,usdP=gb.usd?gb.usd.p:null;
var btc=MT.live.BTCTRY?{v:MT.live.BTCTRY.v,p:MT.live.BTCTRY.p,live:1}:(MT.bin.filter(function(x){return x.sym==='BTCTRY'})[0]||(CR[0]&&CR[0].label==='Bitcoin'?{v:CR[0].price,p:CR[0].change_pct}:null));
h.push(hero('USD/TRY',usd,usdP,MT.wkOK?'CANLI':'BOT',hist('USD/TRY')));
h.push(hero('Gram Altın',gb.v,gb.p,MT.wkOK?'CANLI':'BOT',hist('Gram Altın')));
h.push(hero('Bitcoin',btc&&btc.v,btc&&btc.p,btc&&btc.live?'CANLI · tik':MT.binOK?'60 sn':'BOT',MT.ticks.BTCTRY&&MT.ticks.BTCTRY.length>2?MT.ticks.BTCTRY:hist('Bitcoin')));
var strip='';
if(MT.cg){var mc=MT.cg.total_market_cap&&MT.cg.total_market_cap.usd,dom=MT.cg.market_cap_percentage&&MT.cg.market_cap_percentage.btc,ch=MT.cg.market_cap_change_percentage_24h_usd;
strip+='<div class="scard"><b>Küresel piyasa</b><span>$'+vol(mc)+'</span><i>24s '+pct(ch)+'</i></div>';
strip+='<div class="scard"><b>BTC hakimiyeti</b><span>%'+nf(dom,1)+'</span><i>ETH %'+nf(MT.cg.market_cap_percentage&&MT.cg.market_cap_percentage.eth,1)+'</i></div>'}
if(MT.fng)strip+='<div class="scard"><b>Korku &amp; Açgözlülük</b><span>'+esc(MT.fng.value)+'</span><i>'+esc(MT.fng.value_classification||'')+'</i></div>';
var ix=idxRows().slice(0,4);
if(!ix.length){var b100=ST.filter(function(s){return s.label==='BIST 100'})[0];if(b100)ix=[{n:'BIST 100',v:b100.price,p:b100.change_pct}]}
var idx=ix.map(function(q){return '<div class="scard"><b>'+esc(q.n||q.k)+'</b><span>'+price(q.v)+'</span><i class="'+cls(q.p)+'">'+pct(q.p)+'</i></div>'}).join('');
return '<div class="heroes">'+h.join('')+'</div>'+(strip?'<div class="strip">'+strip+'</div>':'')+
(MT.fng?'<div class="mkb" style="padding:14px 16px;margin-bottom:12px;border-top:1px solid var(--ln);border-radius:var(--r3)">'+gauge(MT.fng.value)+'</div>':'')+
(idx?'<div class="strip">'+idx+'</div>':'')}
function mCrypto(){var rows=binRows(),show=rows.slice(0,MT.clim);
var head='<div class="strip">'+
(MT.cg?'<div class="scard"><b>Küresel kapitalizasyon</b><span>$'+vol(MT.cg.total_market_cap&&MT.cg.total_market_cap.usd)+'</span><i>24s '+pct(MT.cg.market_cap_change_percentage_24h_usd)+'</i></div>':'')+
(MT.cg?'<div class="scard"><b>BTC payı</b><span>%'+nf(MT.cg.market_cap_percentage&&MT.cg.market_cap_percentage.btc,1)+'</span><i>ETH %'+nf(MT.cg.market_cap_percentage&&MT.cg.market_cap_percentage.eth,1)+'</i></div>':'')+
(MT.fng?'<div class="scard"><b>Korku &amp; Açgözlülük</b><span>'+esc(MT.fng.value)+'</span><i>'+esc(MT.fng.value_classification||'')+'</i></div>':'')+
'<div class="scard"><b>Listelenen çift</b><span>'+MT.bin.length+'</span><i>Binance 24s</i></div></div>';
var tbl='<div class="tblwrap"><table class="tbl st9"><thead><tr><th class="l">Coin</th><th data-s="price">Fiyat ⇅</th><th data-s="chg">%24s ⇅</th><th>1s</th><th>7g</th><th>30g</th><th data-s="vol">Hacim(24s) ⇅</th><th class="l">Gün aralığı</th><th>★</th></tr></thead><tbody>'+
show.map(coinRow).join('')+'</tbody></table></div>'+
'<p class="hint">Fiyatlar Binance\'ten gelir. TRY çiftleri ₺, diğerleri $ gösterilir. ★ favoriler üste çıkar. Satır tıkla → detay.</p>';
return head+tbl}
function cap2(v,grp){if(!isFinite(v)||v<=0)return'—';var s=grp==='bist'?' ₺':' $',n=Number(v);
if(n>=1e12)return nf(n/1e12,2)+' Tn'+s;if(n>=1e9)return nf(n/1e9,1)+' Mr'+s;if(n>=1e6)return nf(n/1e6,1)+' Mn'+s;return nf(n,0)+s}
function mStocks(){var all=stPool(),rows=all.filter(function(r){return MT.stMkt==='all'||r.grp===MT.stMkt});
var q=(MT.stq||'').toLocaleUpperCase('tr');
if(q)rows=rows.filter(function(r){return (r.disp+' '+(r.n||'')).toLocaleUpperCase('tr').indexOf(q)>=0});
if(MT.stDir==='up')rows=rows.filter(function(r){return (r.p||0)>0});
if(MT.stDir==='dn')rows=rows.filter(function(r){return (r.p||0)<0});
rows.sort(function(a,b){var fa=MT.stfav.has(a.k)?0:1,fb=MT.stfav.has(b.k)?0:1;if(fa!==fb)return fa-fb;
if(MT.stSort==='chg')return (b.p||0)-(a.p||0);if(MT.stSort==='price')return (b.v||0)-(a.v||0);
if(MT.stSort==='name')return String(a.disp).localeCompare(String(b.disp),'tr');return (b.vol||0)-(a.vol||0)});
var ix=idxRows(),idx=ix.length?'<div class="strip">'+ix.map(function(r){return '<div class="scard"><b>'+esc(r.n||r.k)+'</b><span>'+price(r.v)+'</span><i class="'+cls(r.p)+'">'+pct(r.p)+'</i></div>'}).join('')+'</div>':'';
var stars='';var wp=all.filter(function(x){return x.p!=null});
if(wp.length>=6){var up=wp.slice().sort(function(a,b){return b.p-a.p}).slice(0,3),dn=wp.slice().sort(function(a,b){return a.p-b.p}).slice(0,3);
var sc=function(list,t){return '<div class="scard"><b>'+t+'</b>'+list.map(function(x){return '<div style="display:flex;justify-content:space-between;gap:10px;font:700 11.5px var(--mono);padding:2px 0"><span>'+esc(x.disp)+'</span><span class="'+cls(x.p)+'">'+pct(x.p)+'</span></div>'}).join('')+'</div>'};
stars='<div class="strip">'+sc(up,'🚀 En çok yükselen')+sc(dn,'🩸 En çok düşen')+'</div>'}
var tbl=rows.length?'<div class="tblwrap"><table class="tbl st7"><thead><tr><th class="l">Sembol</th><th class="l">Ad</th><th>Fiyat</th><th>%</th><th>Hacim</th><th>P. Değeri</th><th>★</th></tr></thead><tbody>'+
rows.map(function(r){var cs=r.grp==='bist'?' ₺':' $';
return '<tr data-stk="'+esc(r.k)+'"><td class="l"><b style="font:800 12.5px var(--mono)">'+esc(r.disp)+'</b></td>'+
'<td class="l"><span class="sn">'+esc(r.n||r.disp)+'<i> · '+(r.grp==='bist'?'BIST':'ABD')+'</i></span></td>'+
'<td>'+price(r.v)+cs+'</td><td class="'+cls(r.p)+'">'+(r.p!=null?arw(r.p)+' '+pct(r.p):'—')+'</td>'+
'<td>'+((r.vol||0)>0?vol(r.vol)+cs:'—')+'</td><td>'+cap2(r.mcap,r.grp)+'</td>'+
'<td><span class="stx'+(MT.stfav.has(r.k)?' on':'')+'" role="button" tabindex="0" data-stfav="'+esc(r.k)+'">'+(MT.stfav.has(r.k)?'★':'☆')+'</span></td></tr>'}).join('')+
'</tbody></table></div>':'<p class="hint" style="padding:14px">Filtreyle eşleşen hisse yok. Filtreleri gevşet.</p>';
return idx+stars+'<div class="gh2">Hisseler<span>'+rows.length+' / '+all.length+'</span></div><div class="mkb">'+tbl+'</div>'+
'<p class="hint">Liste işlem hacmine göre sıralıdır (TradingView ilk 50 + Yahoo + bot yedeği). BIST verisi ~15 dk gecikmeli olabilir. Satıra tıkla → detay. ★ favoriler üste çıkar.</p>'}
function rowHTML(r){var h=r.h&&r.h.length>1?r.h:[];var bd=r.liveNow?' <span class="up">CANLI</span>':'';
var al=(r.al!=null?r.al:r.alis);
var vr=(al!=null)?'<div class="mrv">'+price(al)+'<i style="font-style:normal;color:var(--ink3);font-size:11px"> / '+price(r.v)+'</i></div>':'<div class="mrv">'+price(r.v)+'</div>';
var spB=(r.spreadPct!=null)?'<span class="pill fl" title="Alış-satış makası">makas %'+r.spreadPct.toFixed(2).replace('.',',')+'</span>':'';
return '<div class="mr"'+histAttr(r.n)+'><div class="mrn"><b>'+esc(r.n)+'</b><span>'+esc(r.s||'')+bd+'</span></div>'+
'<canvas class="mrs" data-spark=\''+JSON.stringify(h)+'\'></canvas>'+vr+
'<div class="mrp">'+spB+(r.p!=null?'<span class="pill '+cls(r.p)+'">'+arw(r.p)+' '+pct(r.p)+'</span>':'<span class="pill fl">—</span>')+'</div></div>'}
function mFx(){var rows=[];
[['USDTRY','USD/TRY'],['EURTRY','EUR/TRY'],['GBPTRY','GBP/TRY'],['CHFTRY','CHF/TRY'],['JPYTRY','JPY/TRY']].forEach(function(p){
var q=findFx(p[0]);
if(q)rows.push({n:p[1],s:'worker · 30 sn',v:q.v,p:q.p,h:q.s&&q.s.length>1?q.s:hist(p[1]),liveNow:MT.wkOK});
else if(p[0]==='USDTRY'&&MK&&MK.usdtry)rows.push({n:p[1],s:'bot',v:MK.usdtry,p:null,h:hist(p[1])});
else if(p[0]==='EURTRY'&&MK&&MK.eurtry)rows.push({n:p[1],s:'bot',v:MK.eurtry,p:null,h:hist(p[1])})});
var gb=gramBase(),g=gb.v,sil=findMetal(['ONSGUMUS','XAGUSD','XAG','SILVER']);
var HAopen=!!(MT.ha&&MT.ha.open),HAat=(MT.ha&&MT.ha.at)||'';
var haByName={};wkAll().forEach(function(q){if(q.grp==='metal'&&q.alis!=null)haByName[normK(q.k)]=q});
var goldRows=GOLD.map(function(x){var v,pp,src,al=null,spr=null;
var hq=haByName[normK(x[0])];
if(hq){v=hq.satis;al=hq.alis;pp=hq.p;spr=hq.spreadPct;src='truncgil · '+(HAopen?'canlı '+HAat:'kapanış '+HAat)}
else if(x[3]==='silver'){if(!sil)return null;v=sil.v;pp=sil.p;src='ons · $ · spot'}
// Ons USD'dir: gold-api yoksa gram TL'den dolara çevir (eskiden TL×31 gösteriyordu).
else if(x[3]==='ons'){v=gb.ons?gb.ons.v:((g!=null&&gb.usdV)?g*31.1035/gb.usdV:null);pp=gb.ons?gb.ons.p:gb.p;src='ons · $ · '+(gb.ons?'spot':'hesaplanmış')}
else{if(g==null)return null;v=g*x[1];pp=gb.p;src='hesaplanmış'}
if(v==null)return null;
if(spr==null&&al>0&&v>=al)spr=(v-al)/al*100;
var sub=[];if(hq)sub.push('makas %'+spr.toFixed(2).replace('.',','));else if(x[3]==='calc')sub.push(src);if(x[3]==='ons'||x[3]==='silver')sub.push(src);var kuy=x[3]==='calc'?'kuyumcu ~'+nf(v*(1+GPRIM/100),0)+' ₺':'';
return{n:x[0],s:sub.join(' · '),kuy:kuy,v:v,al:al,p:pp,h:x[0]==='Gram Altın'?hist('Gram Altın'):[]}}).filter(Boolean);
return '<div class="gh2">Döviz<span>'+rows.length+' parite</span></div><div class="mkb">'+mrHead(false,['Fiyat','Değişim'])+rows.map(rowHTML).join('')+'</div>'+
'<div class="gh2" style="margin-top:14px">Altın &amp; Gümüş<span>'+goldRows.length+' çeşit</span></div><div class="mkb">'+mrHead(true,['Alış','Satış','Fark'])+goldRows.map(haRow).join('')+'</div>'+
'<p class="hint">Altın alış / satış fiyatları <b>truncgil</b>\'den gelir. Has ve gram altın uluslararası spot fiyattan hesaplanır; <b>Kapalıçarşı primi dahil değildir</b> (zaman zaman %5\'i aşar), bu yüzden Haremaltın gibi sitelerden düşük görünebilir. Ons altın ve gümüş spot fiyattır. Kuyumcu tahmini %'+GPRIM+' işçilik ile hesaplanır; gerçek kuyumcu fiyatı değildir.</p>'}
function mHeat(){var st=stPool().filter(function(r){return r.p!=null});
return '<div class="gh2">Kripto ısı haritası<span>hacim = boyut · %24s = renk</span></div>'+
'<div class="tree" id="treeBox"></div>'+
'<div class="gh2" style="margin-top:14px">Hisse ısı haritası<span>'+st.length+' enstrüman</span></div>'+
'<div class="heat">'+st.map(function(r){var p=clamp(r.p,-6,6),a=Math.abs(p)/6;
var col=p>=0?'color-mix(in srgb,var(--up) '+(20+a*70)+'%,var(--sf2))':'color-mix(in srgb,var(--dn) '+(20+a*70)+'%,var(--sf2))';
return '<div class="ht" role="button" tabindex="0" data-hk="'+esc(r.k)+'" style="background:'+col+'"><b>'+esc(r.disp)+'</b><i>'+pct(r.p)+'</i><span>'+price(r.v)+'</span></div>'}).join('')+'</div>'+
'<p class="hint">Kutu boyutu = işlem hacmi. Yeşil yükseliş, kırmızı düşüş; renk koyuluğu büyüklüğü gösterir. Kutuya tıkla → detay.</p>'}
function treemap(items){var box=$('#treeBox');if(!box)return;var W=box.clientWidth,H=box.clientHeight||340;
if(!items.length){box.innerHTML='<p class="hint" style="padding:14px">Binance verisi bekleniyor…</p>';return}
function layout(list,x,y,w,h,out){if(!list.length)return out;
if(list.length===1){out.push({it:list[0],x:x,y:y,w:w,h:h});return out}
var s=list.reduce(function(a,b){return a+b.vol},0),acc=0,i=0;
if(s<=0){i=Math.ceil(list.length/2);acc=s/2}else{while(i<list.length-1&&acc<s/2){acc+=list[i].vol;i++}}
var a=list.slice(0,i),b=list.slice(i),r=s>0?acc/s:i/list.length;
if(w>=h){var wa=w*r;layout(a,x,y,wa,h,out);layout(b,x+wa,y,w-wa,h,out)}
else{var ha=h*r;layout(a,x,y,w,ha,out);layout(b,x,y+ha,w,h-ha,out)}
return out}
var cells=layout(items.slice(),0,0,W,H,[]);
box.innerHTML=cells.map(function(c){var p=clamp(c.it.p,-8,8),mag=Math.abs(p)/8;
var col=p>=0?'rgba(22,199,132,'+(0.25+mag*0.6)+')':'rgba(255,77,77,'+(0.25+mag*0.6)+')';
var show=c.w>64&&c.h>44,show2=c.w>84&&c.h>64;
return '<div class="tc" role="button" tabindex="0" data-sym="'+c.it.sym+'" style="left:'+c.x.toFixed(1)+'px;top:'+c.y.toFixed(1)+'px;width:'+(c.w-2).toFixed(1)+'px;height:'+(c.h-2).toFixed(1)+'px;background:'+col+'">'+
(show?'<b>'+esc(c.it.base)+'</b><i>'+pct(c.it.p)+'</i>'+(show2?'<span>'+fmtC(c.it.v)+'</span>':''):'')+'</div>'}).join('')}
function heatCoins(){return MT.bin.filter(function(x){return x.quote==='USDT'}).sort(function(a,b){return b.vol-a.vol}).slice(0,40)}
function pfLoad(){return LS.g('radar_pf',[])}
function pfSave(a){LS.s('radar_pf',a)}
function pfPrice(kind,sym){
if(kind==='coin'){var l=MT.live[sym];if(l)return l.v;
var b=MT.bin.filter(function(x){return x.sym===sym})[0];return b?b.v:null}
var q=stPool().filter(function(x){return x.k===sym||x.disp===sym})[0];return q?q.v:null}
function renderPf(){var a=pfLoad(),body=$('#pfBody');if(!body)return;
if(!a.length){body.innerHTML='<p class="hint">Henüz kayıt yok. Coin/hisse, adet ve alış fiyatı ekle; güncel değer ve kâr/zarar burada görünür.</p>';return}
body.innerHTML=a.map(function(x,i){var v=pfPrice(x.kind,x.sym);var cur=v==null?null:v*x.amt;var cost=x.buy*x.amt;
var pl=cur!=null&&cost>0?((cur-cost)/cost*100):null;
return '<div class="kv"><span>'+esc(x.sym)+' <i style="font:700 10px var(--mono);color:var(--ink3);font-style:normal">'+nf(x.amt,4)+' adet · alış '+nf(x.buy,2)+'</i></span>'+
'<b>'+(cur!=null?fmtC(cur)+' '+(x.cur||'₺'):'—')+' <i class="'+cls(pl)+'" style="font-style:normal">'+(pl==null?'':pct(pl))+'</i> <span data-pfd="'+i+'" role="button" tabindex="0" style="color:var(--dn)" title="Sil">✕</span></b></div>'}).join('')}
function syncMarketBars(){
$('#mktBarCrypto').hidden=MT.tab!=='crypto';
$('#mktBarStocks').hidden=MT.tab!=='stocks';
$$('#cfSeg button').forEach(function(b){b.classList.toggle('on',b.dataset.f===MT.cf)});
$('#csSel').value=MT.cs;
$$('#stmSeg button').forEach(function(b){b.classList.toggle('on',b.dataset.m===MT.stMkt)});
$$('#stDirSeg button').forEach(function(b){b.classList.toggle('on',b.dataset.d===MT.stDir)});
$('#stSort').value=MT.stSort;
var cq=$('#cq'),stq=$('#stq');
if(cq.value!==MT.cq)cq.value=MT.cq;
if(stq.value!==MT.stq)stq.value=MT.stq;
var live=MT.wkOK&&wkAll().length>0,age='—';
if(MT.wkAsOf){var s=Math.round((Date.now()-MT.wkAsOf)/1000);age=s<5?'az önce':s<60?s+' sn önce':Math.round(s/60)+' dk önce'}
var el=$('#stLive');el.className='srcc'+(live?' live':'');
el.innerHTML='<span class="pd"></span>'+(live?'worker · '+age:'bot · 2 saat');
var rows=MT.tab==='crypto'?binRows():[];
var cm=$('#cMore');cm.hidden=!(MT.tab==='crypto'&&rows.length>MT.clim);
if(!cm.hidden)cm.textContent='Tümünü göster ('+rows.length+')'}
function renderMarket(){var pane=$('#mkPane');if(!pane)return;
var ses=sessions(),wrap=$('.tblwrap',pane),sl=wrap?wrap.scrollLeft:0;
$('#mkStatus').textContent='BIST '+(ses.bist.open?'açık':'kapalı')+' · ABD '+(ses.us.open?'açık':'kapalı')+' · kripto 7/24';
var sc=$('#mkSrc'),hs=MT.ha&&MT.ha.src;
sc.className='srcc'+(hs==='truncgil'&&MT.ha.open?' live':'');
sc.innerHTML='<span class="pd"></span>'+(hs==='truncgil'?('altın: truncgil · '+(MT.ha.open?'canlı '+MT.ha.at:'kapanış '+MT.ha.at)):hs==='gold'?'altın: spot':hs==='hesap'?'altın: hesaplanmış':(MT.wkOK?'worker 30 sn':'bot'));
sc.title=(MT.ha&&MT.ha.debug)||'';
setBinChip(!!(MT.ws&&MT.ws.readyState===1));
syncMarketBars();
if(MT.tab==='genel')pane.innerHTML=mGen();
else if(MT.tab==='crypto')pane.innerHTML=MT.bin.length?mCrypto():'<div class="empty"><b>🪙</b><p>Binance verisi bekleniyor…</p></div>';
else if(MT.tab==='stocks')pane.innerHTML=mStocks();
else if(MT.tab==='fx')pane.innerHTML=mFx();
else pane.innerHTML=mHeat();
var w2=$('.tblwrap',pane);if(w2&&sl)w2.scrollLeft=sl;
$('#mkHours').innerHTML=[['BIST',ses.bist],['ABD',ses.us],['Döviz',ses.fx],['Kripto',ses.crypto]].map(function(x){
return '<div class="hc'+(x[1].open?' open':'')+'"><b>'+x[0]+' · '+(x[1].open?'AÇIK':'KAPALI')+'</b><span>'+x[1].hours+' · '+x[1].label+'</span></div>'}).join('');
$$('#mkTabs button').forEach(function(b){b.classList.toggle('on',b.dataset.m===MT.tab)});
if(MT.tab==='heat')requestAnimationFrame(function(){treemap(heatCoins())});
redrawSparks();renderFav();renderRail()}
// Arşivde ≥2 günlük kaydı olan satır (USD/TRY, EUR/TRY, Gram Altın) tıklanınca geçmiş grafiği açılır.
function histAttr(k){return HIST[k]&&HIST[k].length>1?' data-hist="'+esc(k)+'" role="button" tabindex="0" title="Geçmişi göster"':''}
function openHist(k){var H=HIST[k]||[];if(H.length<2)return;MT.detail=null;MT.detailKind=null;MT.detailKey=null;
var a=H[0],z=H[H.length-1],ch=(z.v-a.v)/a.v*100,dm=function(t){var p=String(t).split('-');return p[2]+'.'+p[1]};
$('#cKick').textContent='GEÇMİŞ · SON '+H.length+' GÜN';$('#cName').textContent=k;$('#cPrice').textContent=price(z.v)+' ₺';
$('#cChg').innerHTML='<span class="pill '+cls(ch)+'">'+arw(ch)+' '+pct(ch)+'</span> <span style="color:var(--ink3)">'+dm(a.t)+' → '+dm(z.t)+'</span>';
var cv=$('#cSpark');cv.style.display='block';$('#cFav').hidden=true;
$('#cStats').innerHTML=H.slice().reverse().map(function(p){return '<div class="kv"><span>'+dm(p.t)+'</span><b>'+price(p.v)+' ₺</b></div>'}).join('')+
'<div class="kv"><span>Kaynak</span><b style="font:600 10.5px/1.4 var(--sans);text-align:right;max-width:62%">Günlük arşiv (her gün botun son kaydı)</b></div>';
openM('#mCoin');requestAnimationFrame(function(){spark(cv,H.map(function(p){return p.v}))})}
function fillDetail(r,kind){var isCoin=kind==='coin';$('#cFav').hidden=false;
var cs=isCoin?(r.quote==='TRY'?' ₺':' $'):(r.grp==='bist'?' ₺':' $');
var live=isCoin?MT.live[r.sym]:null,v=live?live.v:r.v,p=live?live.p:r.p;
$('#cKick').textContent=isCoin?('KRİPTO · '+r.quote):((r.grp==='bist'?'BORSA İSTANBUL':'ABD')+' · '+(r.src==='tv'?'TradingView':r.src==='yahoo'?'Yahoo':'bot'));
$('#cName').textContent=isCoin?(r.base+' / '+r.quote):(r.n||r.disp);
$('#cPrice').textContent=(isCoin?fmtC(v):price(v))+cs;
$('#cChg').innerHTML=(p!=null?'<span class="pill '+cls(p)+'">'+arw(p)+' '+pct(p)+'</span>':'')+' <span style="color:var(--ink3)">'+(isCoin?'24 saat':'günlük değişim')+'</span>';
var cv=$('#cSpark'),series=isCoin?(MT.ticks[r.sym]||[]):(r.s||[]);
if(series.length>2){cv.style.display='block';spark(cv,series)}else{cv.style.display='none'}
var cm2=MT.cgm[(r.base||'').toUpperCase()]||{},st;
if(isCoin){st='<div class="kv"><span>24s en yüksek</span><b>'+fmtC(r.hi)+'</b></div>'+
'<div class="kv"><span>24s en düşük</span><b>'+fmtC(r.lo)+'</b></div>'+
'<div class="kv"><span>Gün aralığı</span><b>'+hlBar(v,r.lo,r.hi)+'</b></div>'+
'<div class="kv"><span>24s hacim</span><b>'+vol(r.vol)+' '+r.quote+'</b></div>'+
'<div class="kv"><span>24s işlem sayısı</span><b>'+vol(r.tr)+'</b></div>'+
'<div class="kv"><span>1s / 7g / 30g</span><b>'+pctS(cm2.h1)+' · '+pctS(cm2.d7)+' · '+pctS(cm2.d30)+'</b></div>'+
'<div class="kv"><span>Kaynak</span><b>Binance · '+(live?'canlı':'60 sn')+'</b></div>'}
else{st='<div class="kv"><span>Hacim</span><b>'+((r.vol||0)>0?vol(r.vol)+cs:'—')+'</b></div>'+
'<div class="kv"><span>Piyasa değeri</span><b>'+cap2(r.mcap,r.grp)+'</b></div>'+
'<div class="kv"><span>Sembol</span><b>'+esc(r.disp)+'</b></div>'+
'<div class="kv"><span>Gecikme</span><b>'+(r.src==='tv'?'~15 dk olabilir':r.src==='yahoo'?'~1 dk':'2 saat (bot)')+'</b></div>'}
st+='<div class="kv"><span>Not</span><b style="font:600 10.5px/1.4 var(--sans);text-align:right;max-width:62%">'+
(isCoin?'Binance son işlem fiyatı; aracı uygulamalar makas/USDT farkı nedeniyle ±%0,5 sapabilir.':'Ücretsiz kaynaklar BIST için ~15 dk gecikmeli olabilir; kapanış sonrası son değer korunur.')+'</b></div>';
$('#cStats').innerHTML=st;
var key=isCoin?r.sym:r.k,set=isCoin?MT.cfav:MT.stfav;
$('#cFav').textContent=set.has(key)?'★ Favorilerde':'★ Favorilere ekle'}
function openCoin(sym){var x=MT.bin.filter(function(b){return b.sym===sym})[0];if(!x)return;
MT.detail=sym;MT.detailKind='coin';MT.detailKey=sym;
wsSet(sym.toLowerCase()+'@miniTicker');
fillDetail(x,'coin');openM('#mCoin')}
function openStock(k){var q=stPool().filter(function(x){return x.k===k})[0];if(!q)return;
MT.detail=null;MT.detailKind='stk';MT.detailKey=k;
fillDetail(q,'stk');openM('#mCoin')}
function mkTickers(){if(S.view!=='market'||document.hidden)return;
var age=Date.now()-MT.binTS;
Promise.all([age>60000?binLoad():Promise.resolve(),wkLoad(),(Date.now()-(MT.cgmTS||0))>600000?cgMktLoad():Promise.resolve()]).then(renderMarket)}
function mkEnter(){renderMarket();
loadArch(12).then(function(){renderMarket()});
if(!wgDone){wgDone=true;widgets()}
Promise.all([binLoad(),wkLoad(),cgLoad(),fngLoad(),cgMktLoad()]).then(renderMarket);
wsSet(null);
clearInterval(MT.timer);MT.timer=setInterval(mkTickers,10000)}
function mkLeave(){clearInterval(MT.timer);MT.timer=0;MT.detail=null;
try{if(MT.ws){MT.ws.onclose=null;MT.ws.close();MT.ws=null}}catch(e){}
setBinChip(false)}
function zparts(tz){try{var f=new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit',weekday:'short',hour12:false}),p={};
f.formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
return{h:(+p.hour)%24,m:+p.minute,w:['Mon','Tue','Wed','Thu','Fri'].indexOf(p.weekday)>=0}}catch(e){var d=new Date();return{h:d.getHours(),m:d.getMinutes(),w:d.getDay()>0&&d.getDay()<6}}}
function sess(tz,oh,om,ch,cm){var z=zparts(tz),now=z.h*60+z.m,o=oh*60+om,c=ch*60+cm;
return{open:z.w&&now>=o&&now<c,label:z.w?(now<o?'açılışa '+(o-now)+' dk':now<c?'kapanışa '+(c-now)+' dk':'kapandı'):'hafta sonu',
hours:('0'+oh).slice(-2)+':'+('0'+om).slice(-2)+'–'+('0'+ch).slice(-2)+':'+('0'+cm).slice(-2)}}
function sessions(){var z=zparts(TZ);return{bist:sess(TZ,10,0,18,0),us:sess('America/New_York',9,30,16,0),
fx:{open:z.w,label:z.w?'24 saat · hafta içi':'hafta sonu',hours:'Pzt–Cum'},crypto:{open:true,label:'kesintisiz',hours:'7/24'}}}
/* ================= EVRENSEL FAVORİ ================= */
var FV={all:function(){return LS.g('radar_fav_univ',[])},
save:function(a){LS.s('radar_fav_univ',a)},
has:function(t,id){return FV.all().some(function(x){return x.t===t&&x.id===id})},
toggle:function(t,id,label){var a=FV.all(),i=-1;
a.forEach(function(x,k){if(x.t===t&&x.id===id)i=k});
if(i>=0){a.splice(i,1);toast('☆ Takipten çıkıldı: '+esc(label))}
else{a.push({t:t,id:id,label:label||id});toast('★ Takibe alındı: '+esc(label))}
FV.save(a);renderFavUniv();fvQueueSync();return i<0},
del:function(t,id){FV.save(FV.all().filter(function(x){return !(x.t===t&&x.id===id)}));renderFavUniv();fvQueueSync()}};
function fvSyncTeam(team,added){var a=FV.all(),i=-1;a.forEach(function(x,k){if(x.t==='team'&&x.id===team)i=k});
if(added&&i<0)a.push({t:'team',id:team,label:team});
if(!added&&i>=0)a.splice(i,1);
FV.save(a);renderFavUniv()}
var fvSyncT=0;
function fvPush(silent){var code=LS.g('radar_tg_code','');if(!code)return;
jpost(NOTIFY_URL+'/fav',{code:code,favs:FV.all()}).then(function(){if(!silent)toast('🔄 Favoriler Telegram\'a itildi')}).catch(function(){if(!silent)toast('Senkron başarısız — worker/KV açık mı?','warn')})}
function fvQueueSync(){if(!LS.g('radar_tg_code',''))return;clearTimeout(fvSyncT);fvSyncT=setTimeout(function(){fvPush(true)},4000)}
function fvBind(){var code=Math.random().toString(36).slice(2,8).toLocaleUpperCase('tr');
LS.s('radar_tg_code',code);
jpost(NOTIFY_URL+'/pair',{code:code,favs:FV.all()}).then(function(){
window.open('https://t.me/'+TG_BOT_USER+'?start='+code,'_blank');
toast('📲 Kod: '+code+' — Telegram\'da /start\'a bas');renderFavUniv();
}).catch(function(){toast('Pairing başarısız — worker + KV binding kontrol','err')})}
function renderFavUniv(){var box=$('#favUnivBox');if(!box)return;
var a=FV.all(),T={team:'🏟️ Takım',src:'📰 Kaynak',kw:'🔑 Kelime',coin:'🪙 Coin',hisse:'📈 Hisse',radyo:'📻 Radyo'};
var h='<div class="cph">⭐ Takip edilenler <em>'+a.length+'</em></div>';
if(!a.length)h+='<p class="hint">Henüz takip yok. Haber modalında "★ Kaynağı takip et", Saha\'da takım yıldızı, ya da aşağıya kelime ekle.</p>';
else h+=a.map(function(x){return '<div class="kv"><span>'+(T[x.t]||x.t)+' · '+esc(x.label)+'</span><b><span data-fvdel="'+esc(x.t)+'|'+esc(x.id)+'" role="button" tabindex="0" style="color:var(--dn);cursor:pointer">✕</span></b></div>'}).join('');
h+='<div class="cvr" style="margin-top:10px"><input id="fvKw" placeholder="Kelime ekle (ör. faiz)"><button class="btn gh" id="fvKwAdd">🔑 Ekle</button></div>';
h+='<div class="cvr" style="margin-top:8px"><button class="btn pri" id="fvTgBind">📲 Telegram\'a bağla</button><button class="btn gh" id="fvTgSync">🔄 Favorileri senkronla</button></div>';
h+='<p class="hint" id="fvTgState">'+(LS.g('radar_tg_code','')?'Kod: <b>'+esc(LS.g('radar_tg_code',''))+'</b> · Telegram\'da /start\'a bastıysan bağlısın. Favori değişince 🔄 ile it (4 sn içinde otomatik da gider).':'Bağlı değil. Butona bas → Telegram açılır → /start ile onayla.')+'</p>';
box.innerHTML=h}
/* ================= SKORLAR ================= */
var SC={sport:LS.g('radar_sc_sport','football'),date:'',status:'all',q:'',league:'all',favOnly:false,data:null,dataKey:'',ts:0,loading:false,err:null,fav:new Set(LS.g('radar_sc_fav',[])),collapsed:{},flash:{},prev:{},detail:null};
function scPad(n){return (n<10?'0':'')+n}
function scKey(d){return ''+d.getFullYear()+scPad(d.getMonth()+1)+scPad(d.getDate())}
function scToInput(k){return k.slice(0,4)+'-'+k.slice(4,6)+'-'+k.slice(6,8)}
function scFromInput(v){var p=String(v||'').split('-');return p.length===3?p[0]+p[1]+p[2]:scKey(new Date())}
function scShift(dn){var k=SC.date,d=new Date(+k.slice(0,4),+k.slice(4,6)-1,+k.slice(6,8));d.setDate(d.getDate()+dn);SC.date=scKey(d);scLoad(true)}
function scTot(sig){var a=String(sig).split(':');return (+a[0]||0)+(+a[1]||0)}
function scFlash(d){var prev=SC.prev;SC.prev={};(d.leagues||[]).forEach(function(l){(l.matches||[]).forEach(function(m){var sig=(m.hs==null?'-':m.hs)+':'+(m.as==null?'-':m.as);SC.prev[m.id]=sig;var old=prev[m.id];if(old&&old!==sig&&m.state==='in')SC.flash[m.id]=scTot(sig)>scTot(old)?'fu':'fd'})});setTimeout(function(){SC.flash={}},900)}
function scMatches(){var out=[];if(!SC.data||!SC.data.leagues)return out;
SC.data.leagues.forEach(function(l){if(SC.league!=='all'&&l.id!==SC.league)return;(l.matches||[]).forEach(function(m){
if(SC.status!=='all'&&m.state!==SC.status)return;
if(SC.favOnly&&!(SC.fav.has(m.home)||SC.fav.has(m.away)))return;
if(SC.q){var q=SC.q.toLocaleLowerCase('tr');if((m.home+' '+m.away+' '+l.name).toLocaleLowerCase('tr').indexOf(q)<0)return}
out.push({l:l,m:m})})});return out}
function scRow(m){var st=m.state==='in'?scClock(m):m.state==='post'?'MS':(hhmm(m.start)+(cdTxt(m.start)?' · '+cdTxt(m.start):''));
var fH=SC.fav.has(m.home),fA=SC.fav.has(m.away);
return '<div class="scm'+(SC.flash[m.id]?' '+SC.flash[m.id]:'')+'" data-scm="'+esc(m.id)+'" role="button" tabindex="0">'+
'<span class="scst '+m.state+'">'+esc(st)+'</span>'+
'<span class="scteams"><b>'+esc(m.home)+'<span class="scfav'+(fH?' on':'')+'" data-scf="'+esc(m.home)+'" role="button" tabindex="0" aria-label="Favori">'+(fH?'★':'☆')+'</span></b>'+
'<b>'+esc(m.away)+'<span class="scfav'+(fA?' on':'')+'" data-scf="'+esc(m.away)+'" role="button" tabindex="0" aria-label="Favori">'+(fA?'★':'☆')+'</span></b>'+
(scMicroRaw(m)?'<span class="scmicro">'+scMicroRaw(m)+'</span>':'')+'</span>'+
'<span class="scscore">'+(m.state==='pre'?'–':(m.hs==null?'–':m.hs))+'<i>:</i>'+(m.state==='pre'?'–':(m.as==null?'–':m.as))+'</span></div>'}
function cdTxt(t){var d=new Date(t).getTime()-Date.now();if(!(d>0))return'';var h=Math.floor(d/36e5),m=Math.floor((d%36e5)/6e4);return h>0?(h+' sa '+m+' dk'):(m+' dk')}
function scMicroRaw(m){var mi=m.micro;if(!mi)return'';
var L=[],R=[];
(mi.hg||[]).forEach(function(g){L.push('⚽ '+g)});
if(mi.hy||mi.hr)L.push((mi.hy?'🟨'+mi.hy:'')+(mi.hr?'🟥'+mi.hr:''));
(mi.ag||[]).forEach(function(g){R.push('⚽ '+g)});
if(mi.ay||mi.ar)R.push((mi.ay?'🟨'+mi.ay:'')+(mi.ar?'🟥'+mi.ar:''));
var l=L.join(', '),r=R.join(', ');
if(!l&&!r)return'';
return (l||'—')+' │ '+(r||'—')}
function scWeight(l,m){var LW={'uefa.champions':10,'tur.1':9,'eng.1':9,'esp.1':9,'nba':9,'ita.1':8,'ger.1':8,'euroleague':8,'uefa.europa':8,'fra.1':7,'uefa.europa.conf':7,'tur.cup':6,'tur.2':5};
var w=LW[l.id]||4;
if(m.state==='in')w+=6;else if(m.state==='pre'){var d=new Date(m.start).getTime()-Date.now();w+=(d>0&&d<6*36e5)?4:2}else w+=1;
if(SC.fav.has(m.home)||SC.fav.has(m.away))w+=3;
return w}
function renderScHero(){var box=$('#scHero');if(!box)return;
if(!SC.data||SC.err){box.innerHTML='';return}
var best=null,bw=-1;
(SC.data.leagues||[]).forEach(function(l){(l.matches||[]).forEach(function(m){var w=scWeight(l,m);if(w>bw){bw=w;best={l:l,m:m}}})});
if(!best){box.innerHTML='';return}
var m=best.m,l=best.l;
var state=m.state==='in'?'<span class="pill dn">'+esc(scClock(m))+'</span>':m.state==='post'?'<span class="pill fl">MS</span>':'<span class="pill up">'+hhmm(m.start)+(cdTxt(m.start)?' · '+cdTxt(m.start):'')+'</span>';
box.innerHTML='<div class="schero" data-scm="'+esc(m.id)+'" role="button" tabindex="0">'+
'<div class="schk">'+esc(l.flag)+' '+esc(l.name)+' · Günün Maçı</div>'+
'<div class="scht">'+esc(m.home)+' <b>'+(m.state==='pre'?'–':(m.hs==null?'–':m.hs))+' : '+(m.state==='pre'?'–':(m.as==null?'–':m.as))+'</b> '+esc(m.away)+'</div>'+
'<div class="schs">'+state+(m.venue?'<span style="color:var(--ink3)">· '+esc(m.venue)+'</span>':'')+'<span style="margin-left:auto;color:var(--pri)">Detay ›</span></div>'+
(scMicroRaw(m)?'<span class="scmicro" style="margin-top:6px">'+scMicroRaw(m)+'</span>':'')+
'</div>'}
function renderScSum(){var box=$('#scSum');if(!box)return;
if(!SC.data||SC.err){box.innerHTML='';return}
var live=0,pre=0,post=0;(SC.data.leagues||[]).forEach(function(l){(l.matches||[]).forEach(function(m){if(m.state==='in')live++;else if(m.state==='pre')pre++;else post++})});
box.innerHTML='<div class="scard"><b>🔴 Canlı</b><span>'+live+'</span></div>'+
'<div class="scard"><b>⏳ Başlamadı</b><span>'+pre+'</span></div>'+
'<div class="scard"><b>✅ Bitti</b><span>'+post+'</span></div>'}
function renderScores(){var box=$('#scList');if(!box)return;
var di=$('#scDate');if(di&&di.value!==scToInput(SC.date))di.value=scToInput(SC.date);
$$('#scSport button').forEach(function(b){b.classList.toggle('on',b.dataset.s===SC.sport)});
$$('#scStatusSeg button').forEach(function(b){b.classList.toggle('on',b.dataset.t===SC.status)});
var fo=$('#scFavOnly');if(fo)fo.classList.toggle('pri',SC.favOnly);
var sel=$('#scLeague');if(sel){var opts='<option value="all">Lig: Tümü</option>'+((SC.data&&SC.data.leagues)||[]).map(function(l){return '<option value="'+esc(l.id)+'">'+esc(l.flag+' '+l.name)+'</option>'}).join('');if(sel.innerHTML!==opts)sel.innerHTML=opts;sel.value=SC.league}
var src=$('#scSrc');if(src){var age=SC.ts?Math.round((Date.now()-SC.ts)/1000):null;src.className='srcc'+(SC.data&&!SC.err?' live':'');src.innerHTML='<span class="pd"></span>'+(SC.err?'hata':SC.data?(age<5?'az önce':age+' sn önce'):'—')}
var rows=scMatches();renderScHero();renderScSum();var vbN=$('#scVbNote');if(vbN)vbN.hidden=SC.sport!=='volleyball'; var sh=$('#scHint');if(sh)sh.textContent=SC.sport==='volleyball'?'Voleybol TheSportsDB\'den gelir; canlı dakika ve diziliş yok, skorlar maç sonunda düşer. ★ ile takım favorile. Geçmiş tarih = sonuç arşivi.':'Skorlar ESPN\'den gelir; canlı maçlar ~45 sn\'de bir yenilenir. ★ ile takım favorile, "Takımlarım" sadece onları gösterir. Geçmiş tarih = sonuç arşivi.';var st=$('#scStatus');if(st)st.textContent=(SC.data?((SC.data.leagues||[]).length+' lig · '+rows.length+' maç'):'—')+(SC.err?' · veri alınamadı':'');
if(SC.loading&&!SC.data){box.innerHTML=new Array(7).join('x').split('x').map(function(){return '<div class="skb" style="margin-bottom:8px"></div>'}).join('');return}
if(SC.err&&!SC.data){box.innerHTML='<div class="empty"><b>📡</b><p>Skor verisi alınamadı: '+esc(SC.err)+'</p><button class="btn gh" data-scretry style="margin-top:10px">↻ Tekrar dene</button></div>';return}
if(!rows.length){box.innerHTML='<div class="empty"><b>🏟️</b><p>'+(SC.status==='in'?'Şu an canlı maç yok.':SC.favOnly?'Favori takımlarının maçı yok.':'Bu günde bu filtreyle maç yok.')+'</p></div>';return}
var html='',curL=null;
rows.forEach(function(r){if(r.l.id!==curL){if(curL!==null)html+='</div>';curL=r.l.id;var col=SC.collapsed[curL];
html+='<div class="scgh" data-lc="'+esc(curL)+'" role="button" tabindex="0">'+esc(r.l.flag)+' '+esc(r.l.name)+'<span>'+r.l.matches.length+' maç</span><i>'+(col?'˄':'˅')+'</i></div><div class="scgrp"'+(col?' hidden':'')+'>'}
html+=scRow(r.m)});
if(curL!==null)html+='</div>';
box.innerHTML=html}
function renderLiveRow(){var box=$('#liveRow');if(!box)return;requestAnimationFrame(function(){rowArrows('liveRow')});
if(!SC.data||SC.err){box.hidden=true;box.innerHTML='';return}
var live=[],tot=0;(SC.data.leagues||[]).forEach(function(l){(l.matches||[]).forEach(function(m){tot++;if(m.state==='in')live.push(m)})});
if(!live.length){if(!tot){box.hidden=true;box.innerHTML='';return}
box.hidden=false;box.innerHTML='<div class="trend" data-gotoscores role="button" tabindex="0">🏟️ Bugün '+tot+' maç · sonuçlar ›</div>';return}
box.hidden=false;box.innerHTML='<span style="font:900 10px var(--sans);letter-spacing:1.2px;color:var(--dn);align-self:center">🔴 CANLI</span>'+live.map(function(m){return '<div class="trend live" data-live="'+esc(m.id)+'" role="button" tabindex="0">'+esc(m.home)+' <b>'+m.hs+'–'+m.as+'</b> '+esc(m.away)+' <b>'+esc(scClock(m))+'</b></div>'}).join('')}
function scOpen(id){var found=null;((SC.data&&SC.data.leagues)||[]).forEach(function(l){(l.matches||[]).forEach(function(m){if(m.id===id)found={l:l,m:m}})});if(!found)return;SC.detail=found;
$('#mtKick').textContent=found.l.flag+' '+found.l.name;
$('#mtName').textContent=found.m.home+' – '+found.m.away;
var pre=found.m.state==='pre';$('#mtScore').textContent=(pre||found.m.hs==null?'–':found.m.hs)+' : '+(pre||found.m.as==null?'–':found.m.as);
$('#mtState').innerHTML='<span class="pill '+(found.m.state==='in'?'dn':found.m.state==='post'?'fl':'up')+'">'+esc(found.m.state==='in'?scClock(found.m):found.m.state==='post'?'MS':hhmm(found.m.start))+'</span> <span style="color:var(--ink3)">'+esc(pre?'':scDet(found.m.detail))+'</span>';
$('#mtInfo').innerHTML='<div class="kv"><span>Başlangıç</span><b>'+new Date(found.m.start).toLocaleString('tr-TR')+'</b></div>'+(found.m.venue?'<div class="kv"><span>Stadyum</span><b>'+esc(found.m.venue)+'</b></div>':'')+'<div class="kv"><span>Lig</span><b>'+esc(found.l.name)+'</b></div>';
$('#mtFavH').textContent=(SC.fav.has(found.m.home)?'★ ':'☆ ')+found.m.home;
$('#mtFavA').textContent=(SC.fav.has(found.m.away)?'★ ':'☆ ')+found.m.away;
openM('#mMatch');scDetail()}
function scToggleFav(team){var added=!SC.fav.has(team);SC.fav.has(team)?SC.fav.delete(team):SC.fav.add(team);fvSyncTeam(team,added);LS.s('radar_sc_fav',Array.from(SC.fav));renderScores();renderLiveRow();
if(SC.detail){$('#mtFavH').textContent=(SC.fav.has(SC.detail.m.home)?'★ ':'☆ ')+SC.detail.m.home;$('#mtFavA').textContent=(SC.fav.has(SC.detail.m.away)?'★ ':'☆ ')+SC.detail.m.away}}
var MATCH_URL=SCORES_URL.replace('/scores','/match');
function mtLabel(side){if(!SC.detail)return'';return side==='home'?SC.detail.m.home:side==='away'?SC.detail.m.away:''}
function renderMtEvents(ev){var box=$('#mtEv');if(!box)return;
if(!ev||!ev.length){box.innerHTML='';return}
box.innerHTML='<div class="mth3">⚽ Olaylar</div>'+ev.map(function(e){var tag=e.kind==='goal'?'GOL':e.kind==='pen'?'PEN':e.kind==='og'?'K.KALE':e.kind==='yellow'?'🟨':e.kind==='red'?'🟥':'⇄';
return '<div class="mtev '+(e.side||'')+'"><span class="mn">'+esc(e.min||'—')+'</span><span class="mp">'+esc(e.player||'')+(e.assist?' <span style="color:var(--ink3)">· asist '+esc(e.assist)+'</span>':'')+'</span><span class="mt2">'+tag+'</span></div>'}).join('')}
function renderMtQ(q){var box=$('#mtQ');if(!box)return;
if(SC.sport!=='basketball'){box.innerHTML='';return}
var sumQ=function(a){return (a||[]).reduce(function(x,y){return x+y},0)};
if(!q||(!q.h.length&&!q.a.length)||(!sumQ(q.h)&&!sumQ(q.a))){box.innerHTML='';return}
var n=Math.max(q.h.length,q.a.length),head='<th></th>';for(var i=0;i<n;i++)head+='<th>Q'+(i+1)+'</th>';
box.innerHTML='<div class="mth3">🏀 Çeyrekler</div><table class="mtq"><tr>'+head+'<th>T</th></tr>'+
'<tr><td>'+esc(mtLabel('home'))+'</td>'+q.h.map(function(v){return '<td>'+v+'</td>'}).join('')+'<td><b>'+(SC.detail&&SC.detail.m.hs!=null?SC.detail.m.hs:'—')+'</b></td></tr>'+
'<tr><td>'+esc(mtLabel('away'))+'</td>'+q.a.map(function(v){return '<td>'+v+'</td>'}).join('')+'<td><b>'+(SC.detail&&SC.detail.m.as!=null?SC.detail.m.as:'—')+'</b></td></tr></table>'}
function renderMtLead(l){var box=$('#mtLead');if(!box)return;
if(!l||(!l.home.length&&!l.away.length)){box.innerHTML='';return}
var row=function(s){return l[s].map(function(x){return '<div class="mtl"><span>'+esc(x.n)+'</span><b>'+esc(x.c)+' '+esc(x.v)+'</b></div>'}).join('')};
box.innerHTML='<div class="mth3">⭐ '+esc(mtLabel('home'))+'</div>'+row('home')+'<div class="mth3">⭐ '+esc(mtLabel('away'))+'</div>'+row('away')}
function renderMtStats(st){var box=$('#mtStats');if(!box)return;
if(!st||!st.length){box.innerHTML='';return}
var NAME={possession:'Topla oynama %',possessionPct:'Topla oynama %',shots:'Şut',totalShots:'Şut',shotsOnTarget:'İsabetli şut',cornerKicks:'Korner',foulsCommitted:'Faul',offsides:'Ofsayt',yellowCards:'Sarı kart',saves:'Kurtarış',passes:'Pas'};
box.innerHTML='<div class="mth3">📊 İstatistik</div>'+st.map(function(s){var h=parseFloat(String(s.h).replace('%',''))||0,a=parseFloat(String(s.a).replace('%',''))||0,t=(h+a)||1;
return '<div class="mts"><div class="lb"><span>'+esc(s.h||'—')+'</span><span>'+esc(NAME[s.k]||s.k)+'</span><span>'+esc(s.a||'—')+'</span></div><div class="bb"><i class="h" style="width:'+(h/t*100).toFixed(0)+'%"></i><i class="a" style="width:'+(a/t*100).toFixed(0)+'%"></i></div></div>'}).join('')}
function pitchRows(formation){var rows=[1];String(formation||'').split('-').forEach(function(n){var k=parseInt(n,10);if(k>0)rows.push(k)});if(rows.reduce(function(a,b){return a+b},0)!==11)rows=[1,4,4,2];return rows}
function pitchDots(side,lu){var xi=(lu.xi||[]).slice().sort(function(a,b){return (a.fp||0)-(b.fp||0)}).slice(0,11);
var rows=pitchRows(lu.formation),out=[],i=0;
for(var r=0;r<rows.length&&i<xi.length;r++){var size=rows[r];
for(var c=0;c<size&&i<xi.length;c++,i++){var x=((c+1)/(size+1))*84+8;
var yb=5+(rows.length>1?(r/(rows.length-1))*36:0);
out.push({x:x,y:side==='away'?yb:95-yb,w:84/(size+1),p:xi[i]})}}
return out}
function renderMtLine(lu){var box=$('#mtLine');if(!box)return;
if(!lu||(!lu.home&&!lu.away)){box.innerHTML='<div class="mth3">📋 Kadro</div><p class="hint">Kadro verisi bu maç için yok veya henüz açıklanmadı.'+'</p>';return}
var html='<div class="mth3">📋 Kadro</div><div class="plg"><span><i class="home"></i>'+esc(mtLabel('home'))+'</span><span><i class="away"></i>'+esc(mtLabel('away'))+'</span></div><div class="pitch"><div class="half"></div><div class="circ"></div>';
['away','home'].forEach(function(sd){var L=lu[sd];if(!L)return;
pitchDots(sd,L).forEach(function(d){html+='<div class="pdot '+sd+'" style="left:'+d.x.toFixed(1)+'%;top:'+d.y.toFixed(1)+'%;width:'+d.w.toFixed(1)+'%"><i>'+esc(d.p.n||'')+'</i><b>'+esc(String(d.p.nm||'').split(' ').pop())+'</b></div>'})});
html+='</div>';
['home','away'].forEach(function(sd){var L=lu[sd];if(!L)return;
html+='<div style="margin-top:8px"><b style="font:800 12px var(--sans)">'+esc(mtLabel(sd))+'</b> <span class="chip">'+esc(L.formation||'—')+'</span>'+(L.coach?' <span class="hint" style="display:inline">· '+esc(L.coach)+'</span>':'');
if(L.subs&&L.subs.length)html+='<div class="lsub">'+L.subs.map(function(s){return '<span>'+esc(s.n||'')+' '+esc(s.nm||'')+'</span>'}).join('')+'</div>';
html+='</div>'});
box.innerHTML=html}
function formBadges(f){var s=String(f||'').toUpperCase().slice(0,5);if(!s)return'<span class="hint">—</span>';
return '<span class="formb">'+s.split('').map(function(ch){return (ch==='W'||ch==='D'||ch==='L')?'<i class="'+ch+'">'+ch+'</i>':''}).join('')+'</span>'}
function renderMtPre(pre){var box=$('#mtPre');if(!box)return;
if(!pre||(!pre.form.home&&!pre.form.away&&!pre.h2h.length&&!pre.odds)){box.innerHTML='';return}
var h='<div class="mth3">🔮 Ön Bilgi</div>';
if(pre.form.home||pre.form.away){h+='<div class="kv"><span>Form · '+esc(mtLabel('home'))+'</span><b>'+formBadges(pre.form.home)+'</b></div>';
h+='<div class="kv"><span>Form · '+esc(mtLabel('away'))+'</span><b>'+formBadges(pre.form.away)+'</b></div>'}
if(pre.h2h&&pre.h2h.length)h+='<div class="kv"><span>Son karşılaşmalar</span><b style="text-align:right">'+pre.h2h.map(function(g){return esc(g.h)+' '+(g.hs!=null?g.hs+'-'+g.as:'?')+' '+esc(g.a)}).join(' · ')+'</b></div>';
if(pre.odds)h+='<div class="kv"><span>Bahis favorisi</span><b>'+esc(oddsTxt(pre.odds))+'</b></div>';
box.innerHTML=h}
function remindKey(){return SC.detail?(SC.detail.l.id+'|'+SC.detail.m.id):''}
function renderMtActions(){var b=$('#mtRemind');if(!b||!SC.detail)return;
var R=LS.g('radar_remind',{});b.textContent=R[remindKey()]?'🔕 Hatırlatma':'🔔 Hatırlat'}
function scheduleReminders(){var R=LS.g('radar_remind',{}),now=Date.now();if(!window._remH)window._remH={};
Object.keys(R).forEach(function(k){var rec=R[k];if(!rec)return;var fire=rec.at-900000;
if(fire<now-60000){delete R[k];LS.s('radar_remind',R);return}
if(window._remH[k])return;
if(fire<=now){window._remH[k]=1;toast('🔔 Başlamak üzere: '+rec.label);
try{if('Notification'in window&&Notification.permission==='granted')new Notification('RADAR · Maç başlıyor',{body:rec.label})}catch(e){}}
else window._remH[k]=setTimeout(function(){window._remH[k]=1;toast('🔔 Başlamak üzere: '+rec.label);
try{if('Notification'in window&&Notification.permission==='granted')new Notification('RADAR · Maç başlıyor',{body:rec.label})}catch(e){}},fire-now)})}
function remindSet(){var R=LS.g('radar_remind',{}),k=remindKey();if(!k||!SC.detail)return;
if(R[k]){delete R[k];toast('🔕 Hatırlatma kaldırıldı')}
else{R[k]={at:new Date(SC.detail.m.start).getTime(),label:SC.detail.m.home+' – '+SC.detail.m.away};
toast('🔔 Maçtan 15 dk önce haber vereceğim (sayfa açıksa)');
if('Notification'in window&&Notification.permission==='default')Notification.requestPermission().catch(function(){})}
LS.s('radar_remind',R);renderMtActions();scheduleReminders()}
function icsStamp(ms){return new Date(ms).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z'}
function mtIcs(){if(!SC.detail)return;var m=SC.detail.m,start=new Date(m.start).getTime();
var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//RADAR//TR','BEGIN:VEVENT','UID:'+m.id+'@radar',
'DTSTAMP:'+icsStamp(Date.now()),'DTSTART:'+icsStamp(start),'DTEND:'+icsStamp(start+7200000),
'SUMMARY:'+(m.home+' - '+m.away),'LOCATION:'+((m.venue||'').replace(/,/g,'\\,')),'DESCRIPTION:'+SC.detail.l.name,'END:VEVENT','END:VCALENDAR'].join('\r\n');
var blob=new Blob([ics],{type:'text/calendar'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='radar-mac.ics';
document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);toast('📅 Takvim dosyası indirildi')}
function mtShare(){if(!SC.detail)return;var m=SC.detail.m;
var txt=m.home+' '+(m.hs!=null?m.hs:'-')+(m.as!=null?':'+m.as:'')+' '+m.away+' · '+SC.detail.l.name+' · '+(m.state==='in'?scClock(m):m.state==='post'?'MS':hhmm(m.start));
if(navigator.share){navigator.share({title:'RADAR Saha',text:txt,url:location.href}).catch(function(){copyTxt(txt)});return}copyTxt(txt)}
function scDetail(){if(!SC.detail)return;
if(SC.sport==='volleyball'){['#mtEv','#mtQ','#mtLead','#mtStats','#mtLine','#mtPre'].forEach(function(s){var e=$(s);if(e)e.innerHTML=''});
var vb=$('#mtLoad');if(vb){vb.hidden=false;vb.textContent='🏐 Voleybol için olay/diziliş detayı şu an yok — skor ve durum yukarıda.'}return}
['#mtEv','#mtQ','#mtLead','#mtStats','#mtLine','#mtPre'].forEach(function(s){var e=$(s);if(e)e.innerHTML=''});
var box=$('#mtLoad'),m=SC.detail.m,l=SC.detail.l;box.hidden=false;box.textContent='⏳ Maç detayı yükleniyor…';
jget(MATCH_URL+'?sport='+SC.sport+'&lg='+encodeURIComponent(l.id)+'&id='+encodeURIComponent(m.id)+'&t='+Date.now(),12000).then(function(d){
box.hidden=true;SC.lineups=d.lineups||null;SC.preInfo=d.info||null;SC.dbgKeys=d.debugKeys||null;
renderMtEvents(d.events);renderMtQ(d.linescores);renderMtLead(d.leaders);renderMtStats(d.stats);renderMtLine(d.lineups);renderMtPre(d.pre);renderMtActions();
if(d.info&&(d.info.venue||d.info.referee)){var mi=$('#mtInfo');if(mi)mi.innerHTML=mi.innerHTML+(d.info.referee?'<div class="kv"><span>Hakem</span><b>'+esc(d.info.referee)+'</b></div>':'')+(d.info.attendance?'<div class="kv"><span>Seyirci</span><b>'+esc(String(d.info.attendance))+'</b></div>':'')}
}).catch(function(){box.hidden=false;box.textContent='⚠️ Detay alınamadı — skor ve durum yukarıda.'})}
function scLoad(force){var key=SC.sport+'|'+SC.date;
if(SC.loading)return SC.loadP||Promise.resolve();
if(!force&&SC.data&&SC.dataKey===key&&(Date.now()-SC.ts)<45000)return Promise.resolve();
SC.loading=true;SC.err=null;if(!SC.data)renderScores();
return SC.loadP=jget(SCORES_URL+'?sport='+SC.sport+'&date='+SC.date+'&t='+Date.now(),15000).then(function(d){
if(SC.data&&SC.dataKey===key)d=scKeep(SC.data,d);else SC.miss={};
SC.data=d;SC.dataKey=key;SC.ts=Date.now();SC.loading=false;scFlash(d);renderScores();renderLiveRow();
}).catch(function(e){SC.loading=false;SC.err=errTR(e);renderScores();renderLiveRow();})}
// C1: ESPN gol/durum geçişinde maçı (veya ligi) bir-iki tur düşürebiliyor; satır kaybolmasın.
// Önceki veride olup yenide olmayan maç 2 tura kadar korunur, sonra düşer.
function scKeep(prev,d){var miss=SC.miss||{},seen={},nm={};
((d&&d.leagues)||[]).forEach(function(l){(l.matches||[]).forEach(function(m){seen[m.id]=1;delete miss[m.id]})});
((prev&&prev.leagues)||[]).forEach(function(pl){(pl.matches||[]).forEach(function(m){if(seen[m.id])return;
var n=(miss[m.id]||0)+1;if(n>2){delete miss[m.id];return}miss[m.id]=n;
var tl=null;(d.leagues=d.leagues||[]).forEach(function(l){if(l.id===pl.id)tl=l});
if(!tl){tl={id:pl.id,flag:pl.flag,name:pl.name,matches:[]};d.leagues.push(tl)}tl.matches=tl.matches||[];tl.matches.push(m)})});
SC.miss=miss;return d}
// ESPN durum metni İngilizce gelir; bilinenleri çevir, bilinmeyeni olduğu gibi bırak.
function scDet(d){d=String(d||'').trim();var T={'Scheduled':'Planlandı','FT':'Maç sonu','Final':'Maç sonu','Full Time':'Maç sonu','HT':'Devre arası','Halftime':'Devre arası','Postponed':'Ertelendi','Delayed':'Ertelendi','Canceled':'İptal','Cancelled':'İptal','Suspended':'Durduruldu','Abandoned':'Tatil edildi','AET':'Uzatmalar sonrası','FT-Pens':'Penaltılar sonrası','Final/OT':'Uzatmalar sonrası'};return T[d]||d}
// ESPN oranı 'BES -425' biçiminde (kısaltma + Amerikan oranı): eksi = o takım favori.
function oddsTxt(o){var m=String(o||'').trim().match(/^([A-Za-z]{2,5})\s*([-+])\d/);if(!m||!SC.detail)return o;
var up=function(t){return normK(t)},ab=up(m[1]),H=SC.detail.m.home,A=SC.detail.m.away;
var who=up(H).indexOf(ab)===0?'h':up(A).indexOf(ab)===0?'a':null;if(!who)return o;
var fav=(m[2]==='-')===(who==='h')?H:A;return fav}
function scClock(m){var c=String(m.clock||''),dt=String(m.detail||'');
if(/^(HT|Halftime|Half Time)$/i.test(dt))return 'İY';
return (dt.indexOf('+')>=0&&c.indexOf('+')<0)?dt:(c||dt||'CANLI')}
function scInit(){SC.date=scKey(new Date());var di=$('#scDate');if(di)di.value=scToInput(SC.date);scLoad(true)}
function scEnter(){renderScores();scLoad(false)}
/* ================= YAŞAM WIDGET'LARI ================= */
function wgb(id){return $('#'+id+' .wgb')}
function widgets(retry){var wn=$('#wxName');if(wn)wn.textContent=CITY.n;var rb=$('#wxRetry');if(rb)rb.hidden=!retry;
jget('https://api.open-meteo.com/v1/forecast?latitude='+CITY.la+'&longitude='+CITY.lo+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone='+encodeURIComponent(TZ)+'&forecast_days=7',11000).then(function(d){
var c=d.current||{},hr=d.hourly||{},dy=d.daily||{},w=wx(c.weather_code);
var h='<div class="wgn"><div class="wt">'+Math.round(c.temperature_2m||0)+'°</div><div class="wm"><b>'+w[1]+' '+w[0]+'</b>Hissedilen '+Math.round(c.apparent_temperature||0)+'° · nem %'+Math.round(c.relative_humidity_2m||0)+' · rüzgâr '+Math.round(c.wind_speed_10m||0)+' km/s</div></div>';
var now=Date.now(),cnt=0,hs='';
(hr.time||[]).forEach(function(t,i){if(cnt>=12)return;if(new Date(t).getTime()<now-36e5)return;cnt++;
var ww=wx(hr.weather_code[i]);hs+='<div class="wh"><span>'+hhmm(t)+'</span><i>'+ww[1]+'</i><b>'+Math.round(hr.temperature_2m[i])+'°</b></div>'});
h+='<div class="whrs">'+hs+'</div><div class="wds">';
var mins=dy.temperature_2m_min||[],maxs=dy.temperature_2m_max||[];
var lo=mins.length?Math.min.apply(null,mins):0,hi=maxs.length?Math.max.apply(null,maxs):1,rg=(hi-lo)||1;
(dy.time||[]).forEach(function(t,i){var ww=wx(dy.weather_code[i]),a=(mins[i]-lo)/rg*100,b=(maxs[i]-lo)/rg*100;
h+='<div class="wd"><span>'+(i===0?'Bugün':new Date(t).toLocaleDateString('tr-TR',{weekday:'short'}))+'</span><i style="font-style:normal">'+ww[1]+'</i>'+
'<div class="bar"><i style="left:'+a+'%;width:'+Math.max(6,b-a)+'%;background:linear-gradient(90deg,var(--cy),var(--warn))"></i></div><b>'+Math.round(mins[i])+'° / '+Math.round(maxs[i])+'°</b></div>'});
wgb('wgWeather').className='wgb';wgb('wgWeather').innerHTML=h;if(rb)rb.hidden=true;
$('#railWx').innerHTML='<div class="wgn"><div class="wt">'+Math.round(c.temperature_2m||0)+'°</div><div class="wm"><b>'+w[1]+' '+w[0]+'</b>'+esc(CITY.n)+' · nem %'+Math.round(c.relative_humidity_2m||0)+'</div></div>';
var sr=(dy.sunrise||[])[0],ss=(dy.sunset||[])[0];
if(sr&&ss){var A=new Date(sr).getTime(),B=new Date(ss).getTime(),len=Math.max(1,B-A),p=clamp((Date.now()-A)/len,0,1);
wgb('wgSun').className='wgb';wgb('wgSun').innerHTML='<div class="kv"><span>🌅 Doğuş</span><b>'+hhmm(sr)+'</b></div><div class="kv"><span>🌇 Batış</span><b>'+hhmm(ss)+'</b></div>'+
'<div class="kv"><span>Gün uzunluğu</span><b>'+Math.floor(len/36e5)+' sa '+Math.round(len%36e5/6e4)+' dk</b></div>'+
'<div class="bar" style="margin-top:10px"><i style="left:0;width:'+(p*100)+'%;background:linear-gradient(90deg,var(--gold),var(--warn))"></i></div>'+
'<p class="hint">'+(Date.now()<A?'Gün henüz başlamadı':Date.now()>B?'Gün battı':'Günün %'+Math.round(p*100)+"'i geçti")+'</p>'}
}).catch(function(){
    wgb('wgWeather').className='wgb';
    wgb('wgWeather').innerHTML='<p class="hint">Hava servisi yanıt vermedi.</p>';
    $('#railWx').innerHTML='<p class="hint">Hava verisi alınamadı.</p>';if(rb)rb.hidden=false});
jget('https://air-quality-api.open-meteo.com/v1/air-quality?latitude='+CITY.la+'&longitude='+CITY.lo+'&current=european_aqi,pm2_5,pm10&timezone='+encodeURIComponent(TZ),10000).then(function(d){
var c=d.current||{},a=Number(c.european_aqi||0);
var lv=a<=20?['İyi','var(--up)']:a<=40?['Orta','#84CC16']:a<=60?['Hassas','var(--warn)']:a<=80?['Kötü','#F97316']:['Çok kötü','var(--dn)'];
wgb('wgAir').className='wgb';wgb('wgAir').innerHTML='<div class="aqi"><div class="aqn" style="background:'+lv[1]+'">'+Math.round(a)+'</div><div class="aql"><b>'+lv[0]+'</b><span>Avrupa AQI</span></div></div>'+
'<div class="kv" style="margin-top:10px"><span>PM2.5</span><b>'+nf(c.pm2_5,1)+' µg/m³</b></div><div class="kv"><span>PM10</span><b>'+nf(c.pm10,1)+' µg/m³</b></div>'
}).catch(function(){wgb('wgAir').className='wgb';wgb('wgAir').innerHTML='<p class="hint">Hava kalitesi verisi alınamadı.</p>'});
jget('https://api.aladhan.com/v1/timings?latitude='+CITY.la+'&longitude='+CITY.lo+'&method=13',10000).then(function(d){
var t=(d.data&&d.data.timings)||{},map=[['İmsak','Fajr'],['Güneş','Sunrise'],['Öğle','Dhuhr'],['İkindi','Asr'],['Akşam','Maghrib'],['Yatsı','Isha']];
var nm=new Date().getHours()*60+new Date().getMinutes(),nx=-1;
map.forEach(function(m,i){var v=String(t[m[1]]||'').split(':'),mm=(+v[0])*60+(+v[1]);if(nx<0&&mm>nm)nx=i});
wgb('wgPray').className='wgb';wgb('wgPray').innerHTML=map.map(function(m,i){
return '<div class="kv'+(i===nx?' now':'')+'"><span>'+m[0]+(i===nx?' · sıradaki':'')+'</span><b>'+esc(String(t[m[1]]||'—').slice(0,5))+'</b></div>'}).join('')+'<p class="hint">Diyanet yöntemi · '+esc(CITY.n)+'</p>'
}).catch(function(){wgb('wgPray').className='wgb';wgb('wgPray').innerHTML='<p class="hint">Vakit servisi yanıt vermedi.</p>'});
converterFill()}
function converterFill(){
jget('https://open.er-api.com/v6/latest/USD',10000).then(function(d){FXR=d.rates||null}).catch(function(){FXR=null}).then(function(){
var gb=gramBase(),usd=gb.usdV,eur=(findFx('EURTRY')&&findFx('EURTRY').v)||(MK&&MK.eurtry);
CVR={TRY:1,USD:usd||null,EUR:eur||null,GBP:(FXR&&FXR.TRY&&FXR.GBP)?FXR.TRY/FXR.GBP:null};
var opts=Object.keys(CVR).filter(function(k){return CVR[k]});
var f=$('#cvF'),t=$('#cvT'),of=f.value||'USD',ot=t.value||'TRY';
f.innerHTML=opts.map(function(k){return '<option value="'+k+'"'+(k===of?' selected':'')+'>'+k+'</option>'}).join('');
t.innerHTML=opts.map(function(k){return '<option value="'+k+'"'+(k===ot?' selected':'')+'>'+k+'</option>'}).join('');
if(opts.indexOf(of)<0)f.value=opts.indexOf('USD')>=0?'USD':opts[0];
if(opts.indexOf(ot)<0)t.value='TRY';
$('#cvHint').textContent=FXR?'Kur: open.er-api (günlük) + worker USD/TRY':'Kur: bot/worker verisi (günlük)';
converterCalc()})}
function converterCalc(){if(!CVR)return;
var a=Number($('#cvA').value||0),f=$('#cvF').value,t=$('#cvT').value;
if(!CVR[f]||!CVR[t]){$('#cvO').textContent='—';return}
var v=a*CVR[f]/CVR[t];
$('#cvO').textContent=isFinite(v)?nf(v,v>=1000?2:4)+' '+t:'—'}
/* ================= HABER MODAL / SES ================= */
function updateNSave(){if(!cur)return;var on=S.savedSet.has(cur.link),b=$('#nSave');
b.className='btn '+(on?'pri':'gh');b.textContent=on?'📌 Kaydedildi':'📌 Kaydet'}
function openNews(n){cur=n;
trackUsage('Haber açıldı')                     
// Haber penceresinde 3 sn kalınca okundu say; kart pencere kapanınca akışın sonuna iner.
clearTimeout(window._rdT);window._rdT=setTimeout(function(){if(cur===n&&$('#mNews').classList.contains('on')&&!S.read.has(n.link)){S.read.add(n.link);LS.s('radar_read',Array.from(S.read));window._rdDirty=true}},3000);
if(S.later.has(n.link)){S.later.delete(n.link);LS.s('radar_later',Array.from(S.later));renderLater()}
var c=CATS[n.catId]||{l:'Haber',c:'var(--pri)'};
$('#nKicker').textContent=c.l;$('#nKicker').style.color=c.c;$('#nTitle').textContent=n.title||'';
var others=(n.other_sources||[]).map(function(s){return '<a href="'+esc(safeUrl(s.link))+'" target="_blank" rel="noopener">'+esc(s.source||'kaynak')+'</a>'}).join(', ');
$('#nMeta').innerHTML='<span>'+esc(n.source||'')+'</span><span>·</span><span>'+ago(n.pubDate)+' önce</span>'+
(n.ai&&n.ai.model?'<span>·</span><span class="badge bai" data-ai role="button" tabindex="0">✦ AI</span>':'')+(others?'<span>·</span><span>'+others+'</span>':'');
var bb=$('#nBias'),bh=biasBadge(n);
if(bh){bb.className='mb show';bb.innerHTML=bh+'<span>Dil analizi '+Number(n.bias_score)+'/10 · AI değerlendirmesi, kesin değildir.</span>'}else bb.className='mb';
var wh=$('#nWhy');if(n.why_important){wh.className='mw show';wh.innerHTML='💡 <b>Neden önemli?</b><br>'+esc(n.why_important)}else wh.className='mw';
$('#nBody').textContent=n.summary||'Bu haber için özet hazırlanmadı. Kaynakta tamamını okuyabilirsin.';
$('#nLink').href=safeUrl(n.link);
$('#readBox').hidden=true;$('#nRead').textContent='📖 Okuma modu';
updateNSave();var fs=$('#nFollowSrc');if(fs){var fon=FV.has('src',n.source||'');fs.textContent=fon?'★ Takip ediliyor':'★ Kaynağı takip et';fs.classList.toggle('pri',fon)}
timeline(n);stopSpeak();openM('#mNews');renderFeed()}
function timeline(n){var box=$('#nTL'),rows=[{s:n.source,l:n.link,t:n.pubDate}];
(n.other_sources||[]).forEach(function(o){if(o&&o.link)rows.push({s:o.source,l:o.link,t:o.pubDate})});
if(rows.length<2){box.className='tl';box.innerHTML='';return}
rows.sort(function(a,b){return new Date(a.t||0)-new Date(b.t||0)});
var t0=new Date(rows[0].t||0).getTime();
var h='<div class="tlh">🧵 Olay örgüsü · '+rows.length+' kaynak</div><div class="tls">'+(n.event_title?esc(n.event_title)+' — ':'')+'İlk kim verdi, diğerleri ne kadar sonra?</div>';
rows.forEach(function(r,i){var d=new Date(r.t||0),ok=!isNaN(d.getTime()),tag;
if(i===0)tag='<span class="tlg f">İLK</span>';
else if(ok&&isFinite(t0)){var g=Math.max(0,Math.round((d.getTime()-t0)/6e4));tag='<span class="tlg">+'+(g<60?g+' dk':Math.round(g/60)+' sa')+'</span>'}
else tag='<span class="tlg">—</span>';
h+='<div class="tlr"><span class="tlt">'+(ok?hhmm(d):'--:--')+'</span><a class="tln" href="'+esc(safeUrl(r.l))+'" target="_blank" rel="noopener">'+esc(r.s||'Kaynak')+'</a>'+tag+'</div>'});
box.className='tl show';box.innerHTML=h}
function showAI(anchor,ai){var p=$('#pop');
var srcs=(ai.source_urls||[]).map(function(u){return '<a href="'+esc(safeUrl(u))+'" target="_blank" rel="noopener" style="color:var(--pri)">kaynak</a>'}).join(', ');
p.innerHTML='<h4>🤖 AI şeffaflığı</h4>'+[['Model',ai.model||'—'],['Sıcaklık',ai.temperature!=null?ai.temperature:'—'],['Prompt',ai.prompt_version||'—'],
['Üretim',ai.generated_at?new Date(ai.generated_at).toLocaleString('tr-TR'):'—'],['Yöntem',ai.method||'—']]
.map(function(r){return '<div class="pr"><span>'+r[0]+'</span><b>'+esc(r[1])+'</b></div>'}).join('')+(srcs?'<div class="pr"><span>Kaynak</span><b>'+srcs+'</b></div>':'');
p.classList.add('on');var r=anchor.getBoundingClientRect(),pr=p.getBoundingClientRect();
p.style.left=Math.max(8,Math.min(r.left,innerWidth-pr.width-10))+'px';
p.style.top=(r.bottom+8+pr.height>innerHeight-8?Math.max(8,r.top-pr.height-8):r.bottom+8)+'px'}
function hidePop(){$('#pop').classList.remove('on')}
function stopSpeak(){try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}speaking=null;
$('#nSpeak').textContent='🔊 Dinle';var b=$('#briefSpeak');b.textContent='🔊';b.classList.remove('on')}
function speak(text,btn,kind){if(!window.speechSynthesis){toast('Tarayıcı sesli okumayı desteklemiyor','warn');return}
if(speaking===kind){stopSpeak();return}
stopSpeak();var u=new SpeechSynthesisUtterance(text);u.lang='tr-TR'; u.rate=Number(($('#nRate')||{}).value||1); var vv=$('#nVoice');if(vv&&vv.value){var vc=speechSynthesis.getVoices().filter(function(x){return x.voiceURI===vv.value})[0];if(vc)u.voice=vc}
u.onend=u.onerror=function(){if(speaking===kind)stopSpeak()};
speaking=kind;if(kind==='news')btn.textContent='⏹ Durdur';else{btn.textContent='⏹';btn.classList.add('on')}
speechSynthesis.speak(u)}
function fillVoices(){var vv=$('#nVoice');if(!vv||!window.speechSynthesis)return;
var vs=speechSynthesis.getVoices()||[],tr=vs.filter(function(x){return (x.lang||'').indexOf('tr')===0});
var list=tr.length?tr:vs.slice(0,8);
vv.innerHTML='<option value="">Varsayılan ses</option>'+list.map(function(x){return '<option value="'+esc(x.voiceURI)+'">'+esc(String(x.name).slice(0,22))+'</option>'}).join('');
vv.style.display=list.length?'':'none'}
if(window.speechSynthesis&&speechSynthesis.onvoiceschanged!==undefined)speechSynthesis.onvoiceschanged=fillVoices;
function copyTxt(t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){toast('Bağlantı kopyalandı')}).catch(function(){prompt('Bağlantı:',t)});else prompt('Bağlantı:',t)}
/* ================= RADYO ================= */
function buildStations(){STATIONS.length=0;
BASE.forEach(function(s){if(!OFF.has(s.n))STATIONS.push(s)});
EXTRA.forEach(function(x){if(!OFF.has(x.n)&&!STATIONS.some(function(s){return s.n===x.n}))STATIONS.push(x)})}
function rebuildStations(){var nm=curSt>=0&&STATIONS[curSt]?STATIONS[curSt].n:null;
buildStations();curSt=-1;
if(nm)STATIONS.forEach(function(s,i){if(s.n===nm)curSt=i});
renderRadio();renderHealth()}
function renderRadio(){var order=STATIONS.map(function(s,i){return i}).sort(function(a,b){return (S.fav.has(STATIONS[b].n)?1:0)-(S.fav.has(STATIONS[a].n)?1:0)});
$('#radioGrid').innerHTML=order.map(function(i){var s=STATIONS[i],playing=curSt===i&&!$('#audio').paused,t=MT.rtest[s.n];
var badge=t==='ok'?'<span class="rsg ok">✓ çalışıyor</span>':t==='bad'?'<span class="rsg bad">✗ yanıt yok</span>':t==='busy'?'<span class="rsg">test…</span>':'';
return '<div class="rs'+(curSt===i?' on':'')+'" data-i="'+i+'"><div class="rsp" role="button" tabindex="0" aria-label="Oynat">'+(playing?'❚❚':'▶')+'</div>'+
'<div class="rsb"><b>'+esc(s.n)+'</b><span>'+esc(s.d)+'</span><br><span class="rsg">'+esc(s.g)+'</span>'+
(s.urls.length>1?'<span class="rsg mir">'+s.urls.length+' mirror</span>':'')+badge+'</div>'+
'<span class="rsf'+(S.fav.has(s.n)?' on':'')+'" role="button" tabindex="0" data-f="'+esc(s.n)+'" aria-label="Favori">'+(S.fav.has(s.n)?'★':'☆')+'</span></div>'}).join('')}
function renderHealth(){var ok=0,bad=0;
STATIONS.forEach(function(s){if(MT.rtest[s.n]==='ok')ok++;else if(MT.rtest[s.n]==='bad')bad++});
$('#rhStat').textContent=ok+' çalışıyor · '+bad+' yanıt yok · '+(STATIONS.length-ok-bad)+' bekliyor';
$('#rHide').hidden=bad===0;$('#rShow').hidden=OFF.size===0}
function reallyPlaying(){var a=$('#audio');
return !!a&&!a.paused&&(a.readyState>=2||a.currentTime>0||(a.buffered&&a.buffered.length>0))}
function cleanupAttempt(){var a=$('#audio');
if(attOk){a.removeEventListener('playing',attOk);attOk=null}
if(attErr){a.removeEventListener('error',attErr);attErr=null}}
function destroyHls(){if(hls){try{hls.destroy()}catch(e){}hls=null}}
function attempt(s,tok){cleanupAttempt();destroyHls();
var a=$('#audio');a.volume=S.vol;a.muted=S.muted;
var u=s.urls[mIdx]||s.urls[0],isH=u.indexOf('.m3u8')>=0,url=isH?PROXY+encodeURIComponent(u):u;
clearTimeout(wd);
wd=setTimeout(function(){if(tok!==playTok)return;reallyPlaying()?radioSuccess(s):radioFail(s,tok)},25000);
$('#plState').textContent='bağlanıyor… ('+(mIdx+1)+'/'+s.urls.length+')';
attOk=function(){if(tok===playTok)radioSuccess(s)};
attErr=function(){if(tok===playTok)radioFail(s,tok)};
a.addEventListener('playing',attOk);a.addEventListener('error',attErr);
var go=function(){if(tok===playTok)radioFail(s,tok)};
if(isH&&window.Hls&&window.Hls.isSupported()){
hls=new window.Hls({maxBufferLength:20});hls.loadSource(url);hls.attachMedia(a);
hls.on(window.Hls.Events.MANIFEST_PARSED,function(){if(tok===playTok)a.play().catch(go)});
hls.on(window.Hls.Events.ERROR,function(ev,d){if(d&&d.fatal)go()})}
else{a.src=url;a.play().catch(go)}}
function radioSuccess(s){clearTimeout(wd);cleanupAttempt();radioBusy=false;
MT.playedOk.add(s.n);MT.rtest[s.n]='ok';
$('#plState').textContent=S.muted?'sessiz · çalıyor':'canlı çalıyor';
renderRadio();renderHealth();plSync()}
function radioFail(s,tok){if(tok!==playTok)return;
if(reallyPlaying()){radioSuccess(s);return}
clearTimeout(wd);cleanupAttempt();mIdx++;
if(mIdx<s.urls.length){attempt(s,tok);return}
radioBusy=false;
if(!MT.playedOk.has(s.n))MT.rtest[s.n]='bad';
$('#plState').textContent='açılamadı ('+s.urls.length+' mirror denendi)';
var now=Date.now();
if(!MT.toastOnce[s.n]||now-MT.toastOnce[s.n]>600000){MT.toastOnce[s.n]=now;
toast('⚠️ '+esc(s.n)+' şu an açılamadı — tüm mirrorlar denendi','err')}
renderRadio();renderHealth()}
function play(i){var a=$('#audio'),s=STATIONS[i];if(!s)return;
if(curSt===i&&!a.paused){a.pause();return}
curSt=i;mIdx=0;playTok++;radioBusy=true;pushRecent(s.n);
$('#plName').textContent=s.n;$('#plState').textContent='bağlanıyor…';mediaSync(s);
$('#player').classList.add('on');measure();
attempt(s,playTok);renderRadio()}
function probe(u){return new Promise(function(res){
var done=false,fin=function(v){if(!done){done=true;res(v)}};
var isH=u.indexOf('.m3u8')>=0;
var ac=new AbortController(),t1=setTimeout(function(){ac.abort()},9000);
fetch(PROXY+encodeURIComponent(u),{cache:'no-store',signal:ac.signal}).then(function(r){
clearTimeout(t1);if(!r.ok)throw 0;
if(isH)return r.text().then(function(tx){if(tx.indexOf('#EXT')<0)throw 0;fin(true)});
var ct=(r.headers.get('content-type')||'').toLowerCase();
if(ct&&ct.indexOf('audio')<0&&ct.indexOf('mpeg')<0&&ct.indexOf('octet-stream')<0&&ct.indexOf('mp4')<0)throw 0;
fin(true)}).catch(function(){
clearTimeout(t1);
var ac2=new AbortController(),t2=setTimeout(function(){ac2.abort()},6000);
fetch(u,{mode:'no-cors',cache:'no-store',signal:ac2.signal}).then(function(){clearTimeout(t2);fin(true)}).catch(function(){clearTimeout(t2);fin(false)})});
setTimeout(function(){fin(false)},17000)})}
async function testAll(){if(MT.testing)return;MT.testing=true;
var btn=$('#rTest');btn.disabled=true;var ok=0;
for(var i=0;i<STATIONS.length;i++){var s=STATIONS[i];
MT.rtest[s.n]='busy';renderHealth();
var good=false;
for(var m=0;m<s.urls.length;m++){if(await probe(s.urls[m])){good=true;break}}
if(good||MT.playedOk.has(s.n)){MT.rtest[s.n]='ok';ok++}else MT.rtest[s.n]='bad';
renderRadio();renderHealth()}
MT.testing=false;btn.disabled=false;
toast('🩺 Test bitti: '+ok+'/'+STATIONS.length+' kanal çalışıyor')}
function hideBad(){STATIONS.forEach(function(s){if(MT.rtest[s.n]==='bad')OFF.add(s.n)});
LS.s('radar_radio_off',Array.from(OFF));rebuildStations()}
function showHidden(){OFF.clear();LS.s('radar_radio_off',[]);rebuildStations()}
function pushRecent(n){var r=LS.g('radar_radio_recent',[]);r=[n].concat(r.filter(function(x){return x!==n})).slice(0,5);LS.s('radar_radio_recent',r);renderRecent()}
function renderRecent(){var r=LS.g('radar_radio_recent',[]),box=$('#recentRow');if(!box)return;
if(!r.length){box.innerHTML='';box.style.display='none';return}
box.style.display='';box.innerHTML='<span style="font:900 10px var(--sans);letter-spacing:1.2px;color:var(--ink3);align-self:center">SON:</span>'+r.map(function(n){return '<div class="trend" role="button" tabindex="0" data-rn="'+esc(n)+'">📻 '+esc(n)+'</div>'}).join('')}
function stationStep(d){if(!STATIONS.length)return;var i=curSt<0?(d>0?0:STATIONS.length-1):(curSt+d+STATIONS.length)%STATIONS.length;play(i);toast('📻 '+esc(STATIONS[i].n))}
function mediaSync(s){if(!('mediaSession'in navigator))return;try{
navigator.mediaSession.metadata=new MediaMetadata({title:s.n,artist:'RADAR Radyo · canlı',album:'RADAR',artwork:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png'}]});
navigator.mediaSession.setActionHandler('play',function(){var a=$('#audio');if(curSt<0)play(0);else a.play().catch(function(){})});
navigator.mediaSession.setActionHandler('pause',function(){$('#audio').pause()});
navigator.mediaSession.setActionHandler('previoustrack',function(){stationStep(-1)});
navigator.mediaSession.setActionHandler('nexttrack',function(){stationStep(1)});
navigator.mediaSession.setActionHandler('seekbackward',null);
navigator.mediaSession.setActionHandler('seekforward',null);
navigator.mediaSession.setActionHandler('seekto',null);
}catch(e){}}
function plSync(){var a=$('#audio'),on=!a.paused;
if('mediaSession'in navigator){try{navigator.mediaSession.playbackState=on?'playing':'paused'}catch(e){}}
$('#player').classList.toggle('playing',on);
$('#plToggle').textContent=on?'❚❚':'▶';
if(curSt>=0&&!radioBusy)$('#plState').textContent=on?(S.muted?'sessiz · çalıyor':'canlı çalıyor'):'duraklatıldı';
if(S.view==='radio')renderRadio()}
function citySet(){var q=$('#cityIn').value.trim();if(!q)return;
jget('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(q)+'&count=1&language=tr',8000).then(function(d){
var r=(d.results||[])[0];if(!r){toast('Şehir bulunamadı','warn');return}
CITY={n:r.name,la:r.latitude,lo:r.longitude};LS.s('radar_city',CITY);
$('#cityNow').textContent=CITY.n;$('#cityIn').value='';widgets();toast('📍 '+esc(CITY.n))
}).catch(function(){toast('Şehir araması başarısız','err')})}
function measure(){var tb=$('#tabbar'),pl=$('#player');
var tH=(tb&&getComputedStyle(tb).display!=='none')?tb.offsetHeight:0;
var pH=(pl&&pl.classList.contains('on'))?pl.offsetHeight:0;
document.documentElement.style.setProperty('--tab',tH+'px');
document.documentElement.style.setProperty('--pl',pH+'px')}
/* ================= PALET ================= */
function openPal(){$('#palette').classList.add('on');document.body.classList.add('lock');$('#paIn').value=S.q;palFill(S.q);$('#paIn').focus()}
function closePal(){$('#palette').classList.remove('on');document.body.classList.remove('lock')}
function hl(text,q){var raw=String(text||'');if(!q)return esc(raw);
var i=raw.toLocaleLowerCase('tr').indexOf(q);if(i<0)return esc(raw);
return esc(raw.slice(0,i))+'<mark>'+esc(raw.slice(i,i+q.length))+'</mark>'+esc(raw.slice(i+q.length))}
function palFill(q){var s=String(q||'').toLocaleLowerCase('tr');
palRows=NEWS.filter(function(n){return !s||[n.title,n.source,n.summary].some(function(x){return x&&String(x).toLocaleLowerCase('tr').indexOf(s)>=0})}).slice(0,40);palIdx=0;
$('#paList').innerHTML=palRows.length?palRows.map(function(n,i){var c=CATS[n.catId]||{c:'#64748B'};
return '<div class="pai'+(i===0?' sel':'')+'" data-i="'+i+'"><i style="background:'+c.c+'"></i></i><span>'+hl(n.title,s)+'</span><em>★'+(n.score||5)+'</em></div>'}).join(''):'<div class="pai"><span>Eşleşme yok</span></div>'}
function palMove(d){if(!palRows.length)return;palIdx=(palIdx+d+palRows.length)%palRows.length;
$$('#paList .pai').forEach(function(e,i){e.classList.toggle('sel',i===palIdx)});
var el=$$('#paList .pai')[palIdx];if(el)el.scrollIntoView({block:'nearest'})}
/* ================= NAV / URL ================= */
function setView(v){S.view=v;LS.s('radar_view',v);
$$('.view').forEach(function(s){s.classList.toggle('on',s.id==='v-'+v)});
$$('#sideNav .nav-i,#tabbar .tb').forEach(function(b){b.classList.toggle('on',b.dataset.view===v)});
$('#app').dataset.rail=v==='feed'?'1':'0';
if(v==='market')mkEnter();else mkLeave();
if(v==='radio'){renderRadio();renderHealth();if(!MT.radioAuto){MT.radioAuto=true;setTimeout(testAll,500)}}
if(v==='scores')scEnter();
if(v==='saved'){renderSaved();renderUsage();renderFavUniv()}
if(v==='feed'){renderCats();renderFeed()}
scrollTo({top:0,behavior:'auto'});syncUrl();measure()}
function hello(){var h=new Date().getHours(),g='İyi geceler',i='🌙';
if(h>=5&&h<12){g='Günaydın';i='☀️'}else if(h>=12&&h<18){g='İyi günler';i='🌤️'}else if(h>=18&&h<22){g='İyi akşamlar';i='🌆'}
$('#hello').textContent=g+' '+i}
function tickClock(){$('#clockM').textContent=hhmm(new Date())}
function fromURL(){try{var p=new URLSearchParams(location.search),v=p.get('v'),c=p.get('cat'),t=p.get('tone'),q=p.get('q');
if(c&&(c==='all'||CATS[c]))S.cat=c;if(t&&['pozitif','nötr','negatif'].indexOf(t)>=0)S.tone=t;if(q)S.q=q;
if(v&&['feed','market','radio','scores','saved','menu'].indexOf(v)>=0)S.view=v;
$$('#toneSeg button').forEach(function(b){b.classList.toggle('on',b.dataset.tone===S.tone)})}catch(e){}}
function filterURL(){var p=new URLSearchParams();if(S.view!=='feed')p.set('v',S.view);if(S.cat!=='all')p.set('cat',S.cat);
if(S.tone!=='all')p.set('tone',S.tone);if(S.q)p.set('q',S.q);var q=p.toString();return location.origin+location.pathname+(q?'?'+q:'')}
function syncUrl(){try{if(location.protocol!=='file:')history.replaceState(null,'',filterURL())}catch(e){}}
function archInit(){jget('archive/index.json?t='+Date.now(),9000).then(function(d){
var ds=(d.dates||[]).slice().sort(function(a,b){return String(b.date).localeCompare(String(a.date))});
var html='<option value="">📅 Bugün</option>'+ds.map(function(x){return '<option value="'+esc(x.path)+'">📅 '+esc(x.date)+'</option>'}).join('');
$('#archSel').innerHTML=html;$('#archSelM').innerHTML=html;
$('#archSel').value=S.arch;$('#archSelM').value=S.arch}).catch(function(){})}
function applyArch(path){S.arch=path||'';
$('#archSel').value=S.arch;$('#archSelM').value=S.arch;
var b=$('#archBanner');
if(S.arch){var m=S.arch.match(/(\d{4}-\d{2}-\d{2})/);b.className='note arch show';
b.innerHTML='📅 <b>Arşiv:</b> '+(m?m[1]:esc(S.arch))+' — dondurulmuş geçmiş veri. Canlı akış için “Bugün” seç.';
$('#helloSub').textContent='Arşiv görüntüleniyor'}
else{b.className='note';$('#helloSub').textContent='Bugün dünyada neler oluyor?'}
booting=true;renderFeed();loadData()}
// Ana ekrandan (uygulama modu) açıldığında tarayıcının yenile tuşu yok: yeni sürümü al, yoksa sayfayı baştan yükle.
function isApp(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}
function refreshAll(){if(isApp()&&'serviceWorker' in navigator){toast('Güncelleniyor…');
navigator.serviceWorker.getRegistration().then(function(reg){if(!reg)return location.reload();
return reg.update().then(function(){if(reg.waiting)reg.waiting.postMessage('SKIP_WAITING');else location.reload()})}).catch(function(){location.reload()});return}
toast('Yenileniyor…');loadData();
if(S.view==='market')Promise.all([binLoad(),wkLoad(),cgLoad(),fngLoad()]).then(renderMarket)}
function toggleMute(){S.muted=!S.muted;LS.s('radar_muted',S.muted);$('#audio').muted=S.muted;
var m=S.muted?'🔇':'🔊';$('#btnMute').textContent=m;$('#btnMuteM').textContent=m;
plSync();toast(S.muted?'Tüm sesler kapatıldı':'Ses açık')}
/* ================= MENÜ ================= */
var PREFS_OPEN=LS.g('radar_prefs_open',false);
function renderPrefs(){var box=$('#prefs');box.innerHTML=ORDER.filter(function(k){return k!=='all'}).map(function(k){var on=!S.prefs||S.prefs.indexOf(k)>=0;
return '<div class="pref'+(on?' on':'')+'" role="button" tabindex="0" data-k="'+k+'"><i style="background:'+CATS[k].c+'"></i>'+CATS[k].l+'<span class="bx">✓</span></div>'}).join('');
box.hidden=!PREFS_OPEN;var st=$('#prefsState');if(st)st.textContent=PREFS_OPEN?'açık':'kapalı'}
function togglePref(k){var base=ORDER.filter(function(x){return x!=='all'});var c=S.prefs?S.prefs.slice():base.slice();
c.indexOf(k)>=0?c=c.filter(function(x){return x!==k}):c.push(k);
if(!c.length){toast('En az bir kategori seçili olmalı','warn');return}
S.prefs=c.length===base.length?null:c;
S.prefs?LS.s('radar_prefs',S.prefs):LS.d('radar_prefs');
renderPrefs();renderFeed()}
function renderAbout(){$('#about').innerHTML='<p><b>RADAR</b> · sunucusuz haber &amp; piyasa terminali.</p>'+
'<p style="margin-top:8px">Model: <code>'+esc(META&&META.model||'—')+'</code><br>Haber: <code>'+NEWS.length+'</code> · Kripto çifti: <code>'+MT.bin.length+'</code><br>Üretim: <code>'+(META&&META.generated_at?new Date(META.generated_at).toLocaleString('tr-TR'):'—')+'</code></p>'+
'<p style="margin-top:8px">Özetler AI ürünüdür, hata içerebilir; kaynak bağlantısı her zaman verilir. Kripto verisi Binance\'ten canlıdır. Hisseler ücretsiz kaynaklardan ~15 dk gecikmelidir. Altın fiyatları <b>truncgil</b>\'den gelir (alış/satış); has/gram altın uluslararası spot bazlıdır, Kapalıçarşı primi dahil değildir. Kuyumcu tahmini işçilik primiyle hesaplanır, gerçek kuyumcu fiyatı değildir. Piyasa saatleri resmî tatilleri içermez.</p>'}
function exportSaved(){var items=NEWS.filter(function(n){return S.savedSet.has(n.link)});
var missing=Array.from(S.savedSet).filter(function(l){return !NEWS.some(function(n){return n.link===l})});
if(!items.length&&!missing.length){toast('Kaydedilmiş haber yok','warn');return}
var blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),count:items.length,items:items,not_in_feed:missing},null,2)],{type:'application/json'});
var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='radar-kayit-'+new Date().toISOString().slice(0,10)+'.json';
document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);toast('JSON indirildi')}
function exportCSV(){var wk=wkAll();
if(!MT.bin.length&&!wk.length){toast('Piyasa verisi yok — önce Piyasa sekmesini aç','warn');return}
var rows=[['Tur','Sembol','Ad','Fiyat','Degisim_Yuzde','Hacim','Piyasa_Degeri','Kaynak']];
MT.bin.slice().sort(function(a,b){return b.vol-a.vol}).slice(0,100).forEach(function(x){rows.push(['kripto',x.sym,x.base+'/'+x.quote,x.v,x.p==null?'':x.p.toFixed(2),x.vol,'','Binance'])});
wk.forEach(function(q){if(['st','bist','us','idx','fx','metal'].indexOf(q.grp)>=0)rows.push([q.grp,q.k,q.n||q.k,q.v,q.p==null?'':Number(q.p).toFixed(2),q.vol||'',q.mcap||'',q.src||'worker'])});
var csv='\uFEFF'+rows.map(function(r){return r.map(function(c){c=String(c==null?'':c);return /[";\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(';')}).join('\r\n');
var blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='radar-piyasa-'+new Date().toISOString().slice(0,10)+'.csv';
document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);
toast('CSV indirildi (Excel uyumlu)')}
function doTranslate(){var txt=$('#trIn').value.trim(),out=$('#trOut');
if(!txt){out.textContent='Bir metin gir.';return}
if(txt.length>500){out.textContent='En fazla 500 karakter çevrilebilir.';return}
var f=$('#trFrom').value,t=$('#trTo').value;out.textContent='Çevriliyor…';
jget('https://api.mymemory.translated.net/get?q='+encodeURIComponent(txt)+'&langpair='+(f==='auto'?'Autodetect':f)+'|'+t,10000).then(function(d){
var r=d&&d.responseData&&d.responseData.translatedText;
if(r&&r.indexOf('MYMEMORY WARNING')<0){out.textContent=r;return}throw 0
}).catch(function(){return jget('https://lingva.ml/api/v1/'+(f==='auto'?'auto':f)+'/'+t+'/'+encodeURIComponent(txt),10000).then(function(d){
if(d&&d.translation){out.textContent=d.translation;return}throw 0})
}).catch(function(){out.textContent='Çeviri yapılamadı. Metni kısaltıp tekrar dene.'})}
/* ================= OLAY BAĞLAMA (en sonda, DOM hazır) ================= */
function bindEvents(){
$$('#sideNav .nav-i,#tabbar .tb').forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.view)})});
$$('[data-goto]').forEach(function(b){b.addEventListener('click',function(){setView(b.dataset.goto)})});
$$('#themeSeg button,#themeSegSide button').forEach(function(b){b.addEventListener('click',function(){setTheme(b.dataset.theme)})});
var THEME_CYCLE=['dark','light','sepia'];
var thToggle=function(){var cur=document.documentElement.getAttribute('data-theme');
var i=THEME_CYCLE.indexOf(cur);setTheme(THEME_CYCLE[(i+1)%THEME_CYCLE.length])};
$('#btnTheme').addEventListener('click',thToggle);$('#btnThemeM').addEventListener('click',thToggle);
$$('#densSeg button,#densSegSide button').forEach(function(b){b.addEventListener('click',function(){S.dens=b.dataset.d;LS.s('radar_dens',S.dens);applyTheme()})});
['fontRange','fontRange2'].forEach(function(id){$('#'+id).addEventListener('input',function(e){S.fs=Number(e.target.value);LS.s('radar_fs',S.fs);applyTheme()})});
var bindSw=function(id,get,set){$('#'+id).addEventListener('click',function(){set(!get());applyTheme();renderFeed()})};
bindSw('swImg',function(){return S.noimg},function(v){S.noimg=v;LS.set('radar_hide_images',v)});
bindSw('swImgSide',function(){return !S.noimg},function(v){S.noimg=!v;LS.set('radar_hide_images',!v)});
bindSw('swMotion',function(){return S.nomotion},function(v){S.nomotion=v;LS.s('radar_nomotion',v)});
bindSw('swMotionSide',function(){return !S.nomotion},function(v){S.nomotion=!v;LS.s('radar_nomotion',!v)});
bindSw('sw12',function(){return S.h12},function(v){S.h12=v;LS.set('radar_age_12h',v)});
bindSw('swBias',function(){return S.biasOff},function(v){S.biasOff=v;LS.set('radar_bias_filter',v)});
bindSw('swAlert',function(){return S.alert},function(v){S.alert=v;LS.s('radar_alert_on',v);MT.alr={};
if(v&&'Notification'in window&&Notification.permission==='default')Notification.requestPermission().catch(function(){})});
$('#toTop').addEventListener('click',function(){scrollTo({top:0,behavior:S.nomotion?'auto':'smooth'})});
$('#prefsToggle').addEventListener('click',function(){PREFS_OPEN=!PREFS_OPEN;LS.s('radar_prefs_open',PREFS_OPEN);renderPrefs()});
$('#thRange').addEventListener('input',function(e){S.th=Number(e.target.value);$('#thVal').textContent='%'+S.th;LS.s('radar_alert_th',S.th);MT.alr={}});
$$('#briefTabs button').forEach(function(b){b.addEventListener('click',function(){S.brief=b.dataset.b;stopSpeak();renderBrief()})});
$('#briefAI').addEventListener('click',function(e){e.stopPropagation();showAI($('#briefAI'),{model:META&&META.model,temperature:META&&META.temperature,prompt_version:META&&META.prompt_version,generated_at:META&&META.generated_at,method:'günlük analiz'})});
$('#briefSpeak').addEventListener('click',function(){speak('Günün analizi. '+(BRIEF[S.brief]||''),$('#briefSpeak'),'brief')});
$$('#toneSeg button').forEach(function(b){b.addEventListener('click',function(){S.tone=b.dataset.tone;S.limit=24;
$$('#toneSeg button').forEach(function(x){x.classList.toggle('on',x===b)});renderFeed()})});
$('#moreBtn').addEventListener('click',function(){S.limit+=24;renderFeed()});
$('#filterClear').addEventListener('click',function(){clearFilters('all')});
$('#catsL').addEventListener('click',function(){$('#cats').scrollBy({left:-220,behavior:'smooth'})});
$('#catsR').addEventListener('click',function(){$('#cats').scrollBy({left:220,behavior:'smooth'})});
$('#liveRowL').addEventListener('click',function(){$('#liveRow').scrollBy({left:-260,behavior:'smooth'})});
$('#liveRowR').addEventListener('click',function(){$('#liveRow').scrollBy({left:260,behavior:'smooth'})});
$('#liveRow').addEventListener('scroll',function(){rowArrows('liveRow')},{passive:true});
$('#cats').addEventListener('scroll',catArrows,{passive:true});
$$('#mkTabs button').forEach(function(b){b.addEventListener('click',function(){MT.tab=b.dataset.m;MT.clim=100;renderMarket()})});
$('#mkRefresh').addEventListener('click',function(){toast('Piyasa yenileniyor…');Promise.all([binLoad(),wkLoad(),cgLoad(),fngLoad(),cgMktLoad()]).then(renderMarket)});
$('#cq').addEventListener('input',function(e){MT.cq=e.target.value;MT.clim=100;renderMarket()})
$$('#cfSeg button').forEach(function(b){b.addEventListener('click',function(){MT.cf=b.dataset.f;MT.clim=100;renderMarket()})});
$('#csSel').addEventListener('change',function(e){MT.cs=e.target.value;renderMarket()});
$('#cMore').addEventListener('click',function(){MT.clim=10000;renderMarket()});
$('#guideBtn').addEventListener('click',function(){openM('#mGuide')});
$('#mListBody').addEventListener('click',function(e){var b=e.target.closest('[data-li]');if(!b)return;var n=DL_LIST[+b.dataset.li];closeM();if(n)openNews(n)});
$('#nlSub').addEventListener('click',function(){
var email=$('#nlEmail').value.trim();
if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast('Geçerli email gir','warn');return}
var fd=new URLSearchParams();fd.append('email',email);
fetch('https://buttondown.com/api/emails/embed-subscribe/'+BD_USER,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:fd.toString()}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);toast('✅ Abone olundu: '+email);$('#nlEmail').value=''}).catch(function(){toast('Abonelik başarısız','err')});
});
$('#pfAdd').addEventListener('click',function(){
var kind=$('#pfKind').value,raw=$('#pfSym').value.trim().toLocaleUpperCase('tr'),amt=Number($('#pfAmt').value),buy=Number($('#pfBuy').value);
if(!raw||!isFinite(amt)||amt<=0||!isFinite(buy)||buy<=0){toast('Sembol, adet ve alış fiyatı gir','warn');return}
var sym=raw,cur='₺';
if(kind==='coin'){var m=MT.bin.filter(function(x){return (x.sym===raw||x.base===raw)&&x.quote==='TRY'})[0]||MT.bin.filter(function(x){return x.sym===raw||x.base===raw})[0];
if(!m){toast('Coin bulunamadı: '+raw+' (örn. BTC, ETH)','warn');return}
sym=m.sym;cur=m.quote==='TRY'?'₺':'$'}else{
var q=stPool().filter(function(x){return x.k===raw||x.disp===raw})[0];
if(!q){toast('Hisse bulunamadı: '+raw+' (örn. THYAO, AAPL)','warn');return}
sym=q.k;cur=q.grp==='bist'?'₺':'$'}
var a=pfLoad();a.push({kind:kind,sym:sym,amt:amt,buy:buy,cur:cur});pfSave(a);
$('#pfSym').value='';$('#pfAmt').value='';$('#pfBuy').value='';
renderPf();toast('💼 Eklendi: '+esc(sym))});
$('#goldPrim').addEventListener('input',function(e){GPRIM=Number(e.target.value);$('#gpVal').textContent='%'+GPRIM;LS.s('radar_gold_prim',GPRIM);if(MT.tab==='fx')renderMarket()});
$('#stq').addEventListener('input',function(e){MT.stq=e.target.value;renderMarket()});
$$('#stmSeg button').forEach(function(b){b.addEventListener('click',function(){MT.stMkt=b.dataset.m;renderMarket()})});
$$('#stDirSeg button').forEach(function(b){b.addEventListener('click',function(){MT.stDir=b.dataset.d;renderMarket()})});
$('#stSort').addEventListener('change',function(e){MT.stSort=e.target.value;renderMarket()});
['cvA','cvF','cvT'].forEach(function(id){var e=$('#'+id);e.addEventListener('input',converterCalc);e.addEventListener('change',converterCalc)});
$('#rTest').addEventListener('click',testAll);
$('#rHide').addEventListener('click',hideBad);
$('#rShow').addEventListener('click',showHidden);
$('#expSaved').addEventListener('click',exportSaved);
$('#expSaved2').addEventListener('click',exportSaved);
$('#expCsv').addEventListener('click',exportCSV);
$('#copyLink').addEventListener('click',function(){copyTxt(filterURL())});
$('#wipe').addEventListener('click',function(){ask('Geçmiş sıfırlansın mı?','Okundu, beğeni ve kayıtlar silinir. Geri alınamaz.',function(){
S.read.clear();S.liked.clear();S.savedSet.clear();S.later.clear();LS.d('radar_read');LS.d('radar_liked');LS.d('radar_saved');LS.d('radar_later');
renderFeed();renderSaved();renderLater();toast('Geçmiş temizlendi')})});
$('#trSwap').addEventListener('click',function(){var f=$('#trFrom'),t=$('#trTo');if(f.value==='auto'){toast('Otomatik algılama çevrilemez','warn');return}var a=f.value;f.value=t.value;t.value=a});
$('#trGo').addEventListener('click',doTranslate);
$('#sentGo').addEventListener('click',sentiment);
$('#scRefresh').addEventListener('click',function(){scLoad(true)});
$('#scPrev').addEventListener('click',function(){scShift(-1)});
$('#scNext').addEventListener('click',function(){scShift(1)});
$('#scToday').addEventListener('click',function(){SC.date=scKey(new Date());scLoad(true)});
$('#scDate').addEventListener('change',function(e){SC.date=scFromInput(e.target.value);scLoad(true)});
$$('#scSport button').forEach(function(b){b.addEventListener('click',function(){SC.sport=b.dataset.s;LS.s('radar_sc_sport',SC.sport);SC.league='all';SC.data=null;scLoad(true)})});
$$('#scStatusSeg button').forEach(function(b){b.addEventListener('click',function(){SC.status=b.dataset.t;renderScores()})});
$('#scQ').addEventListener('input',function(e){SC.q=e.target.value;renderScores()});
$('#scLeague').addEventListener('change',function(e){SC.league=e.target.value;renderScores()});
$('#scFavOnly').addEventListener('click',function(){SC.favOnly=!SC.favOnly;renderScores()});
$('#mtFavH').addEventListener('click',function(){if(SC.detail)scToggleFav(SC.detail.m.home)});
$('#mtFavA').addEventListener('click',function(){if(SC.detail)scToggleFav(SC.detail.m.away)});
$('#mtRemind').addEventListener('click',remindSet);
$('#mtIcs').addEventListener('click',mtIcs);
$('#mtShare2').addEventListener('click',mtShare);
$('#cityGo').addEventListener('click',citySet);
$('#wxRetry').addEventListener('click',function(){toast('Hava güncelleniyor…');widgets(true)});
$('#cityIn').addEventListener('keydown',function(e){if(e.key==='Enter')citySet()});
$('#nFollowSrc').addEventListener('click',function(){if(!cur)return;var on=FV.toggle('src',cur.source||'Kaynak',cur.source||'Kaynak');
$('#nFollowSrc').textContent=on?'★ Takip ediliyor':'★ Kaynağı takip et';$('#nFollowSrc').classList.toggle('pri',on)});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&e.target.id==='fvKw'){var b=$('#fvKwAdd');if(b)b.click()}});
$('#btnPalette').addEventListener('click',openPal);
$('#palette').addEventListener('click',function(e){if(e.target===$('#palette'))closePal()});
$('#paIn').addEventListener('input',function(e){palFill(e.target.value);S.q=e.target.value.trim();S.limit=24;renderFeed()});
$('#paIn').addEventListener('keydown',function(e){
if(e.key==='ArrowDown'){e.preventDefault();palMove(1)}
else if(e.key==='ArrowUp'){e.preventDefault();palMove(-1)}
else if(e.key==='Enter'){e.preventDefault();if(palRows[palIdx]){closePal();openNews(palRows[palIdx])}}
else if(e.key==='Escape')closePal()});
$('#btnRefresh').addEventListener('click',refreshAll);
$('#btnRefreshM').addEventListener('click',refreshAll);
$('#btnMute').addEventListener('click',toggleMute);
$('#btnMuteM').addEventListener('click',toggleMute);
$('#archSel').addEventListener('change',function(e){applyArch(e.target.value)});
$('#archSelM').addEventListener('change',function(e){applyArch(e.target.value)});
$('#nSpeak').addEventListener('click',function(){if(!cur)return;speak(cur.title+'. '+(cur.why_important?'Neden önemli? '+cur.why_important+'. ':'')+(cur.summary||''),$('#nSpeak'),'news')});
$('#nSave').addEventListener('click',function(){if(!cur)return;toggleSave(cur.link);updateNSave();renderFeed()});
function readMode(){var box=$('#readBox');if(!cur||!box)return;
if(!box.hidden){box.hidden=true;$('#nRead').textContent='📖 Okuma modu';return}
box.hidden=false;$('#nRead').textContent='⏳ Yükleniyor…';box.textContent='';
fetch(PROXY+encodeURIComponent(cur.link),{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(html){
var doc=new DOMParser().parseFromString(html,'text/html');
$$('script,style,noscript,nav,footer,aside,form,iframe,button,[class*="related"],[class*="ilgili"],[class*="author"],[class*="yazar"],[class*="bio"],[class*="social"],[class*="sosyal"],[class*="share"],[class*="paylas"],[class*="comment"],[class*="yorum"],[class*="tags"],[class*="etiket"],[class*="breadcrumb"],[class*="sidebar"],[class*="widget"],[class*="newsletter"],[class*="bulten"],[class*="promo"],[class*="reklam"],[class*="advert"],[id*="related"],[id*="author"],[id*="comments"],[id*="sidebar"]',doc).forEach(function(n){n.remove()});
var root=doc.querySelector('article')||doc.querySelector('[class*="content"]')||doc.querySelector('[class*="detail"]')||doc.querySelector('main')||doc.body;
var brand=String(cur.source||'').toLocaleLowerCase('tr').split(' ')[0].replace(/[^a-zçğıöşü0-9]/gi,'');
var BOIL=['okuyucuları ile paylaşır','okuyucularıyla paylaşır','takip etmekten','zevk alan','öğrendiklerini','yazarı','editörü','muhabiri','mezunu','bizi takip','takip edin','abone ol','bülten','google news','google haberler','telegram','twitter','instagram','facebook','youtube','tiktok','linkedin','whatsapp','sosyal medya','ilginizi çekebilir','ayrıca bakınız','önceki haber','sonraki haber','sıradaki haber','okumaya devam','tıklayın','tıklayarak','kaynak:','fotoğraf:','getty images','reuters'];
var ps=$$('p',root).map(function(p){return (p.textContent||'').replace(/\s+/g,' ').trim()}).filter(function(t){
if(t.length<60)return false;
var low=t.toLocaleLowerCase('tr');
if(BOIL.some(function(k){return low.indexOf(k)>=0}))return false;
if(brand&&low.indexOf(brand)>=0&&t.length<260&&!/\d/.test(t))return false;
return true}).slice(0,14);
if(!ps.length)throw 0;
box.innerHTML=ps.map(function(t){return '<p style="margin-bottom:12px">'+esc(t)+'</p>'}).join('')+
'<div class="ma" style="margin:6px 0 0"><button class="btn gh" id="rdClean">🤖 AI ile daha da sadeleştir</button></div>';
$('#rdClean').addEventListener('click',aiClean);
$('#nRead').textContent='📖 Okuma modunu kapat';
}).catch(function(){
box.hidden=true;$('#nRead').textContent='📖 Okuma modu';toast('Okuma modu bu kaynak için açılamadı','warn')})}
function aiClean(){var box=$('#readBox');if(!box||!cur)return;
var key='radar_clean_'+cur.link;
var draw=function(t){box.innerHTML=t.split(/\n{2,}/).map(function(p){return '<p style="margin-bottom:12px">'+esc(p.trim())+'</p>'}).filter(function(h){return h.length>12}).join('')+
'<div class="ma" style="margin:6px 0 0"><button class="btn gh" id="rdClean">🤖 AI ile daha da sadeleştir</button></div>';
$('#rdClean').addEventListener('click',aiClean)};
var cached=LS.g(key,null);
if(cached&&cached.text&&Date.now()-cached.at<7*864e5){draw(cached.text);toast('✨ Önbellekten sadeleştirildi');return}
var b=$('#rdClean');b.disabled=true;b.textContent='⏳ Sadeleştiriliyor…';
var raw=$$('p',box).map(function(p){return p.textContent}).filter(function(t){return t&&t.indexOf('AI ile')<0}).join('\n');
jpost(CLEAN_URL,{text:raw},{ms:45000}).then(function(d){if(!d||!d.clean)throw 0;
LS.s(key,{text:d.clean,at:Date.now()});draw(d.clean);toast('✨ Sadeleştirildi (7 gün önbellek)')}).catch(function(){
b.disabled=false;b.textContent='🤖 AI ile daha da sadeleştir';toast('Sadeleştirme başarısız — worker/GROQ secret kontrol','warn')})}
$('#nRead').addEventListener('click',readMode);
$('#podcastPlay').addEventListener('click',function(){
trackUsage('Podcast')
if(!NEWS||!NEWS.length){toast('Haber yok','warn');return}
$('#podcastStatus').textContent='⏳ AI sesi hazırlanıyor…';
var top10=NEWS.slice(0,10).map(function(n,i){return (i+1)+'. '+n.title+'. '+n.summary}).join(' ');
var u=new SpeechSynthesisUtterance(top10);u.lang='tr-TR';u.rate=1.1;
u.onstart=function(){$('#podcastStatus').textContent='🔊 Çalıyor… ('+Math.ceil(top10.length/15)+' sn)'};
u.onend=function(){$('#podcastStatus').textContent='✅ Bitti. Tekrar dinlemek için tıkla.'};
speechSynthesis.speak(u)});
$('#nShare').addEventListener('click',function(){if(!cur)return;var d={title:cur.title,text:(cur.summary||'').slice(0,180),url:cur.link};
if(navigator.share){navigator.share(d).catch(function(e){if(e&&e.name!=='AbortError')copyTxt(cur.link)});return}copyTxt(cur.link)});
$('#cFav').addEventListener('click',function(){var kind=MT.detailKind,key=MT.detailKey;if(!key)return;
var set=kind==='coin'?MT.cfav:MT.stfav;
set.has(key)?set.delete(key):set.add(key);
LS.s(kind==='coin'?'radar_cfav':'radar_stfav',Array.from(set));
$('#cFav').textContent=set.has(key)?'★ Favorilerde':'★ Favorilere ekle';
renderMarket()});
$('#cfOk').addEventListener('click',function(){if(cfFn)cfFn();cfFn=null;closeM()});
$$('[data-close]').forEach(function(b){b.addEventListener('click',closeM)});
$$('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)closeM()})});
$('#plToggle').addEventListener('click',function(){var a=$('#audio');if(a.paused){if(curSt<0)play(0);else a.play().catch(function(){toast('Yayın açılamadı','err')})}else a.pause()});
$('#plClose').addEventListener('click',function(){playTok++;clearTimeout(wd);cleanupAttempt();
var a=$('#audio');a.pause();a.removeAttribute('src');try{a.load()}catch(e){}
destroyHls();curSt=-1;radioBusy=false;clearTimeout(sleepT);$('#plSleep').value='0';
$('#player').classList.remove('on','playing');measure();renderRadio()});
$('#plPrev').addEventListener('click',function(){stationStep(-1)});
$('#plNext').addEventListener('click',function(){stationStep(1)});
$('#plVol').addEventListener('input',function(e){S.vol=Number(e.target.value);$('#audio').volume=S.vol;LS.set('radar_radio_volume',S.vol)});
$('#plSleep').addEventListener('change',function(e){clearTimeout(sleepT);var m=+e.target.value;if(!m)return;
toast('⏱ '+m+' dk sonra duracak');sleepT=setTimeout(function(){$('#audio').pause();$('#plSleep').value='0';toast('⏱ Uyku zamanlayıcı: durduruldu')},m*6e4)});
['play','pause','playing','waiting','error'].forEach(function(ev){$('#audio').addEventListener(ev,function(){
if(ev==='waiting')$('#plState').textContent='tamponlanıyor…';plSync()})});
/* --- dinamik içerik: tek delege --- */
document.addEventListener('click',function(e){
var t=e.target,el;
if(!t.closest('#pop')&&!t.closest('[data-ai]')&&!t.closest('#briefAI'))hidePop();
if(el=t.closest('[data-fc]')){clearFilters(el.dataset.fc);return}
if(el=t.closest('[data-cat]')){S.cat=el.dataset.cat;S.saved=false;S.limit=24;setView('feed');renderCats();renderFeed();return}
if(el=t.closest('.pref[data-k]')){togglePref(el.dataset.k);return}
if(el=t.closest('.pai[data-i]')){closePal();var pn=palRows[+el.dataset.i];if(pn)openNews(pn);return}
if(el=t.closest('[data-ai]')){var ac=el.closest('.nc');var ai=ac?((findNews(ac.dataset.link)||{}).ai):(cur?cur.ai:null);showAI(el,ai||{});return}
if(el=t.closest('.act')){var c2=el.closest('.nc');if(!c2)return;var l=c2.dataset.link;
if(el.classList.contains('sv')){toggleSave(l);el.classList.toggle('on',S.savedSet.has(l));if(cur&&cur.link===l)updateNSave();if(S.view==='saved')renderSaved()}
else if(el.classList.contains('lk'))toggleLike(l,el);
else if(el.classList.contains('lt')){toggleLater(l);el.classList.toggle('on',S.later.has(l));if(S.view==='saved')renderLater()}
return}
if(el=t.closest('[data-hist]')){openHist(el.dataset.hist);return}
if(el=t.closest('.nc')){var nn=findNews(el.dataset.link);if(nn)openNews(nn);return}
if(el=t.closest('[data-f]')){var nm=el.dataset.f;S.fav.has(nm)?S.fav.delete(nm):S.fav.add(nm);LS.s('radar_fav',Array.from(S.fav));renderRadio();return}
if(el=t.closest('.rs')){play(+el.dataset.i);return}
if(el=t.closest('[data-fav]')){var sy=el.dataset.fav;MT.cfav.has(sy)?MT.cfav.delete(sy):MT.cfav.add(sy);LS.s('radar_cfav',Array.from(MT.cfav));renderMarket();return}
if(el=t.closest('[data-stfav]')){var sk=el.dataset.stfav;MT.stfav.has(sk)?MT.stfav.delete(sk):MT.stfav.add(sk);LS.s('radar_stfav',Array.from(MT.stfav));renderMarket();return}
if(el=t.closest('tr[data-sym]')){openCoin(el.dataset.sym);return}
if(el=t.closest('tr[data-stk]')){openStock(el.dataset.stk);return}
if(el=t.closest('th[data-s]')){MT.cs=el.dataset.s;renderMarket();return}
if(el=t.closest('.tc[data-sym]')){openCoin(el.dataset.sym);return}
if(el=t.closest('.ht[data-hk]')){openStock(el.dataset.hk);return}
if(el=t.closest('[data-pfd]')){var pa=pfLoad();pa.splice(+el.dataset.pfd,1);pfSave(pa);renderPf();return}
if(el=t.closest('[data-rn]')){var nm=el.dataset.rn;for(var ri=0;ri<STATIONS.length;ri++){if(STATIONS[ri].n===nm){play(ri);break}}return}
if(el=t.closest('[data-scf]')){scToggleFav(el.dataset.scf);return}
if(el=t.closest('[data-lc]')){var lk2=el.dataset.lc;SC.collapsed[lk2]=!SC.collapsed[lk2];renderScores();return}
if(el=t.closest('[data-scretry]')){scLoad(true);return}
if(el=t.closest('[data-live]')){var mid=el.dataset.live;setView('scores');SC.status='in';renderScores();scOpen(mid);return}
if(el=t.closest('[data-gotoscores]')){setView('scores');return}
if(el=t.closest('[data-scm]')){scOpen(el.dataset.scm);return}
if(el=t.closest('[data-fvdel]')){var fp=el.dataset.fvdel.split('|');FV.del(fp[0],fp[1]);return}
if(el=t.closest('#fvTgBind')){fvBind();return}
if(el=t.closest('#fvTgSync')){fvPush(false);return}
if(el=t.closest('#fvKwAdd')){var fi=$('#fvKw'),fv=fi?fi.value.trim():'';if(!fv){toast('Kelime gir','warn');return}FV.toggle('kw',fv.toLocaleLowerCase('tr'),fv);if(fi)fi.value='';return}
if(el=t.closest('[data-favrow]')){var pp=el.dataset.favrow.split('|');if(pp[0]==='coin')openCoin(pp[1]);else openStock(pp[1]);return}
});
addEventListener('keydown',function(e){
var ae=document.activeElement,typing=ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName);
if((e.ctrlKey||e.metaKey)&&String(e.key).toLowerCase()==='k'){e.preventDefault();openPal();return}
if(e.key==='Escape'){closePal();closeM();hidePop();return}
if(typing)return;
var cards=$$('#newsGrid .nc');
if(e.key==='j'||e.key==='k'){if(!cards.length)return;e.preventDefault();
var i=cards.indexOf(ae),n2=e.key==='j'?Math.min(cards.length-1,i+1):Math.max(0,i<0?0:i-1);
cards[n2].focus();cards[n2].scrollIntoView({block:'center',behavior:'auto'});return}
if(ae&&ae.classList&&ae.classList.contains('nc')){var lk=ae.dataset.link;
if(e.key==='o'||e.key==='Enter'){e.preventDefault();var n3=findNews(lk);if(n3)openNews(n3);return}
if(e.key==='s'){e.preventDefault();toggleSave(lk);var b2=$('.sv',ae);if(b2)b2.classList.toggle('on',S.savedSet.has(lk));return}
if(e.key==='l'||e.key===' '){e.preventDefault();var b3=$('.lk',ae);toggleLike(lk,b3);return}
if(e.key==='t'){e.preventDefault();toggleLater(lk);var b4=$('.lt',ae);if(b4)b4.classList.toggle('on',S.later.has(lk));return}}
if(e.key==='/'){e.preventDefault();openPal();return}
if((e.key==='Enter'||e.key===' ')&&ae&&ae.getAttribute&&ae.getAttribute('role')==='button'){e.preventDefault();ae.click()}});
addEventListener('scroll',function(){hidePop()},{passive:true,capture:true});
// Masaüstünde dikey tekerlek, yatay şeritte (canlı maçlar vb.) yatay kaydırır.
document.addEventListener('wheel',function(e){var p=e.target.closest&&e.target.closest('.pulse');if(!p||Math.abs(e.deltaX)>Math.abs(e.deltaY)||p.scrollWidth<=p.clientWidth)return;
var max=p.scrollWidth-p.clientWidth;if((e.deltaY<0&&p.scrollLeft<=0)||(e.deltaY>0&&p.scrollLeft>=max-1))return;e.preventDefault();p.scrollLeft+=e.deltaY},{passive:false});
addEventListener('scroll',function(){var y=scrollY||pageYOffset||0;
if(innerWidth>900){if(!tightOn&&y>140)tightOn=true;else if(tightOn&&y<60)tightOn=false;
$('#topbar').classList.toggle('tight',tightOn)}
else{if(tightOn){tightOn=false;$('#topbar').classList.remove('tight')}
// Mobil: üst panel ekranın ~%25'ini kaplıyordu; aşağı kaydırınca gizle, yukarı kaydırınca göster.
var dy=y-(window._lastY||0);if(Math.abs(dy)>6){$('#topbar').classList.toggle('hid',dy>0&&y>120);window._lastY=y}}
var tt=$('#toTop');if(tt)tt.classList.toggle('show',y>600)},{passive:true});
addEventListener('resize',function(){catArrows();redrawSparks();measure();
if(MT.tab==='heat'&&S.view==='market')treemap(heatCoins());
if(innerWidth<=900&&tightOn){tightOn=false;$('#topbar').classList.remove('tight')}});
addEventListener('orientationchange',function(){setTimeout(measure,200)});
// iOS: klavye açıkken sabit alt panel kaydırınca ekranın ortasına çıkıyordu; yazı alanı odaktayken gizle.
document.addEventListener('focusin',function(e){if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)&&e.target.type!=='range'&&e.target.type!=='checkbox')document.body.classList.add('kb')});
document.addEventListener('focusout',function(){document.body.classList.remove('kb')});
if(mq){var mh=function(){if(S.theme==='auto')applyTheme()};mq.addEventListener?mq.addEventListener('change',mh):mq.addListener(mh)}
document.addEventListener('visibilitychange',function(){
if(document.hidden){clearInterval(MT.timer);MT.timer=0}
else{hello();checkStale();tickClock();
if(S.view==='market'){mkTickers();clearInterval(MT.timer);MT.timer=setInterval(mkTickers,10000);
if(!MT.ws||MT.ws.readyState>1)wsSet(MT.wsExtra)}}});
if('IntersectionObserver'in window){
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)maybeMore()})},{rootMargin:'600px 0px'});
io.observe($('#ioSentinel'))}
if(window.MutationObserver){var mo=new MutationObserver(measure);mo.observe($('#player'),{attributes:true,attributeFilter:['class']})}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
addEventListener('load',measure)}
/* ================= BAŞLAT ================= */
var PRES_ID=LS.g('radar_pres_id','');if(!PRES_ID){PRES_ID=Math.random().toString(36).slice(2,10);LS.s('radar_pres_id',PRES_ID)}
function presRender(n){$$('.pres').forEach(function(e){if(!(n>0)){e.hidden=true;return}
e.hidden=false;e.innerHTML='<i></i>'+(n>1?'<b>'+n+'</b>':'');e.title=n>1?(n+' kişi çevrimiçi'):'Çevrimiçi'})}
function presBeat(){jpost(NOTIFY_URL+'/presence',{id:PRES_ID}).then(function(d){return d&&d.n!=null?d:jget(NOTIFY_URL+'/presence',8000)}).then(function(d){presRender(d.n||0)}).catch(function(){presRender(0)})}
function init(){
buildStations();
applyTheme();hello();tickClock();renderPrefs();renderAbout();
$('#trFrom').innerHTML=LANGS.map(function(l){return '<option value="'+l[0]+'">'+l[1]+'</option>'}).join('');
$('#trTo').innerHTML=LANGS.filter(function(l){return l[0]!=='auto'}).map(function(l){return '<option value="'+l[0]+'"'+(l[0]==='en'?' selected':'')+'>'+l[1]+'</option>'}).join('');
$('#plVol').value=S.vol;$('#goldPrim').value=GPRIM;$('#gpVal').textContent='%'+GPRIM;fillVoices();
$('#cityNow').textContent=CITY.n;fromURL();renderCats();renderFeed();setView(S.view);archInit();loadData();
if(!wgDone){wgDone=true;widgets()}
if(S.view!=='market')Promise.all([binLoad(),cgLoad(),fngLoad()]).then(function(){renderRail();renderFav()});
setInterval(function(){if(!S.arch&&!document.hidden)loadData()},3e5);
setInterval(function(){hello();checkStale()},6e4);
setInterval(tickClock,10000);
setInterval(function(){if(curSt>=0&&STATIONS[curSt]&&reallyPlaying()){var n=STATIONS[curSt].n;
MT.playedOk.add(n);if(MT.rtest[n]!=='ok'){MT.rtest[n]='ok';if(S.view==='radio'){renderRadio();renderHealth()}}}},2000);
renderRecent();measure();setTimeout(measure,300);setTimeout(measure,1200);
scInit();scheduleReminders();
setInterval(function(){if(!document.hidden&&(S.view==='scores'||S.view==='feed'))scLoad(false)},45000);
if('serviceWorker'in navigator&&location.protocol!=='file:'){
var swReg=null,swWait=null;
var showBar=function(){var b=$('#swBar');if(b)b.hidden=false};
var hook=function(reg){swReg=reg;
if(reg.waiting&&navigator.serviceWorker.controller){swWait=reg.waiting;showBar()}
reg.addEventListener('updatefound',function(){var nw=reg.installing;if(!nw)return;
nw.addEventListener('statechange',function(){if(nw.state==='installed'&&navigator.serviceWorker.controller){swWait=nw;showBar()}})});};
var go=function(){navigator.serviceWorker.register('sw.js').then(hook).catch(function(e){console.warn('SW kayıt hatası:', e)})};
document.readyState==='complete'?go():addEventListener('load',go);
navigator.serviceWorker.addEventListener('controllerchange',function(){location.reload()});
$('#swReload').addEventListener('click',function(){var w=swWait||(swReg&&swReg.waiting);if(w)w.postMessage('SKIP_WAITING');else location.reload()});
setInterval(function(){if(swReg&&!document.hidden)swReg.update().catch(function(){})},1800000);}
presBeat();setInterval(presBeat,300000);}
/* --- Altın tablosu yardımcıları (haRow, mrHead) --- */
// Altın satırı: Alış | Satış | Fark sütunları; makas ve kuyumcu tahmini alt satırda.
function haRow(r){var h=r.h&&r.h.length>1?r.h:[];
return '<div class="mr ha"'+histAttr(r.n)+'><div class="mrn"><b>'+esc(r.n)+'</b><span>'+esc(r.s||'')+(r.kuy?'<em class="kuy">'+(r.s?' · ':'')+esc(r.kuy)+'</em>':'')+'</span></div>'+
(h.length?'<canvas class="mrs" data-spark=\''+JSON.stringify(h)+'\'></canvas>':'<span class="mrs"></span>')+
'<div class="mrv al">'+(r.al!=null?price(r.al):'—')+'</div><div class="mrv">'+price(r.v)+'</div>'+
'<div class="mrp">'+(r.p!=null?'<span class="pill '+cls(r.p)+'">'+arw(r.p)+' '+pct(r.p)+'</span>':'<span class="pill fl">—</span>')+'</div></div>'}
function mrHead(ha,cols){return '<div class="mr mrh'+(ha?' ha':'')+'"><span class="mrn"></span><span class="mrs"></span>'+cols.map(function(c,i){return '<span class="'+(i===cols.length-1?'mrp':'mrv')+'">'+c+'</span>'}).join('')+'</div>'}
bindEvents();
init();
})();

