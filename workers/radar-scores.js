const CAT={football:[["tur.1","🇹🇷","Süper Lig"],["tur.2","🇹🇷","1. Lig"],["tur.cup","🇹🇷","Türkiye Kupası"],["eng.1","🏴","Premier Lig"],["eng.2","🏴","Championship"],["esp.1","🇪🇸","La Liga"],["ita.1","🇮🇹","Serie A"],["ger.1","🇩🇪","Bundesliga"],["fra.1","🇫🇷","Ligue 1"],["ned.1","🇳🇱","Eredivisie"],["por.1","🇵🇹","Primeira Liga"],["sco.1","🏴","İskoçya Premiership"],["bel.1","🇧🇪","Pro League"],["gre.1","🇬🇷","Yunanistan Süper Lig"],["uefa.champions","🏆","Şampiyonlar Ligi"],["uefa.europa","🏆","Avrupa Ligi"],["uefa.europa.conf","🏆","Konferans Ligi"],["usa.1","🇺🇸","MLS"],["bra.1","🇧🇷","Brasileirão"],["arg.1","🇦🇷","Liga Profesional"],["mex.1","🇲🇽","Liga MX"],["jpn.1","🇯🇵","J1 League"],["kor.1","🇰🇷","K League 1"],["ksa.1","🇸🇦","Suudi Pro Lig"]],basketball:[["nba","🇺🇸","NBA"],["wnba","🇺🇸","WNBA"],["mens-college-basketball","🇺🇸","NCAA"],["euroleague","🇪🇺","EuroLeague"],["tur.1","🇹🇷","BSL"]]};
const CACHE=new Map();
// ESPN Türk takım adlarını ASCII veriyor (Besiktas). Kelime kelime düzelt; listede olmayan aynen kalır.
// Bildirim/favori eşleşmesi bu adlarla yapıldığı için düzeltme burada, tek kaynakta.
const TRW={Besiktas:"Beşiktaş",Fenerbahce:"Fenerbahçe",Basaksehir:"Başakşehir",Goztepe:"Göztepe",Kasimpasa:"Kasımpaşa",Caykur:"Çaykur",
Eyupspor:"Eyüpspor",Genclerbirligi:"Gençlerbirliği",Karagumruk:"Karagümrük",Istanbul:"İstanbul",Istanbulspor:"İstanbulspor",
Ankaragucu:"Ankaragücü",Umraniyespor:"Ümraniyespor",Bandirmaspor:"Bandırmaspor",Igdir:"Iğdır",Corum:"Çorum",Keciorengucu:"Keçiörengücü",
Sariyer:"Sarıyer",Sanliurfaspor:"Şanlıurfaspor",Turkiye:"Türkiye",Buyuksehir:"Büyükşehir",
Tofas:"Tofaş",Darussafaka:"Darüşşafaka",Karsiyaka:"Karşıyaka"};
function trName(n){return String(n||"").replace(/[A-Za-z]+/g,w=>TRW[w]||w)}
function json(o,s){return new Response(JSON.stringify(o),{status:s||200,headers:{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","cache-control":"no-store"}})}
function todayKey(){const d=new Date();return d.getUTCFullYear()+String(d.getUTCMonth()+1).padStart(2,"0")+String(d.getUTCDate()).padStart(2,"0")}
async function grab(u,ms){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),ms||9000);try{const r=await fetch(u,{signal:ac.signal,headers:{"user-agent":"Mozilla/5.0"}});clearTimeout(t);if(!r.ok)return null;return await r.json()}catch(e){clearTimeout(t);return null}}
async function league(sport,code,flag,name,date){const path=sport==="basketball"?"basketball":"soccer";const d=await grab("https://site.api.espn.com/apis/site/v2/sports/"+path+"/"+code+"/scoreboard?dates="+date,9000);if(!d||!d.events||!d.events.length)return null;const matches=d.events.map(e=>{const c=(e.competitions||[])[0]||{};const cs=c.competitors||[];const h=cs.find(x=>x.homeAway==="home")||cs[0]||{};const a=cs.find(x=>x.homeAway==="away")||cs[1]||{};const st=(c.status||{}).type||{};return{id:e.id,home:trName((h.team||{}).displayName||(h.team||{}).shortDisplayName||"?"),away:trName((a.team||{}).displayName||(a.team||{}).shortDisplayName||"?"),hid:(h.team||{}).id||"",aid:(a.team||{}).id||"",hs:h.score!=null?+h.score:null,as:a.score!=null?+a.score:null,state:st.state||"pre",clock:(c.status||{}).displayClock||"",detail:st.shortDetail||st.detail||"",venue:((c.venue||{}).fullName)||"",start:e.date,micro:microOf(c,h,a)}});return{id:code,flag,name,matches}}
function microOf(c,h,a){const det=c.details||[];const ev={hg:[],ag:[],hy:0,ay:0,hr:0,ar:0};
const hid=(h.team||{}).id,aid=(a.team||{}).id;
det.forEach(d=>{const tl=((d.type||{}).text||"").toLowerCase();
const side=(d.team&&d.team.id===hid)?"h":(d.team&&d.team.id===aid)?"a":null;if(!side)return;
const min=(d.clock||{}).displayValue||"";
const pl=(d.athletesInvolved||[])[0]||{};const nm=pl.displayName||pl.shortName||"";const last=nm?nm.trim().split(" ").pop():"";
if(d.scoringPlay||tl.indexOf("goal")>=0){ev[side+"g"].push((last||"")+(min?" "+min:""))}
else if(d.redCard||tl.indexOf("red")>=0){ev[side+"r"]++}
else if(d.yellowCard||tl.indexOf("yellow")>=0){ev[side+"y"]++}});
return(ev.hg.length||ev.ag.length||ev.hy||ev.ay||ev.hr||ev.ar)?ev:null}
function sideOf(tid,hid,aid){return tid&&tid===hid?"home":tid&&tid===aid?"away":null}
function minNum(s){const m=String(s||"").match(/\d+/);return m?+m[0]:0}
function extractLineups(d,hid,aid){
const srcs=[d.lineups,d.rosters,d.boxscore&&d.boxscore.lineups,d.boxscore&&d.boxscore.players,d.boxscore&&d.boxscore.rosters];
for(let si=0;si<srcs.length;si++){const src=srcs[si];if(!Array.isArray(src)||!src.length)continue;
const out={};
src.forEach(function(t){const s=sideOf((t.team||{}).id,hid,aid);if(!s)return;
let pl=null;["players","athletes","roster","lineup"].forEach(function(k){if(!pl&&Array.isArray(t[k])&&t[k].length)pl=t[k]});
if(!pl)return;
const norm=pl.map(function(p){const a=p.athlete||p;return{n:String(p.jersey!=null?p.jersey:(a.jersey!=null?a.jersey:"")),nm:a.displayName||a.shortName||a.fullName||"",pos:((p.position||{}).abbreviation)||((a.position||{}).abbreviation)||"",fp:p.formationPlace||a.formationPlace||0,st:p.starter===true||p.starting===true,sb:!!(p.subIn||p.subOut||p.substitutionIn)}}).filter(function(p){return p.nm});
if(!norm.length)return;
let xi,subs;
if(norm.some(function(p){return p.st})){xi=norm.filter(function(p){return p.st});subs=norm.filter(function(p){return !p.st})}
else if(norm.some(function(p){return p.fp>0})){xi=norm.filter(function(p){return p.fp>0}).sort(function(a,b){return a.fp-b.fp});subs=norm.filter(function(p){return !p.fp})}
else if(norm.some(function(p){return p.sb})){subs=norm.filter(function(p){return p.sb});xi=norm.filter(function(p){return !p.sb})}
else{xi=norm.slice(0,11);subs=norm.slice(11)}
out[s]={formation:t.formation||t.formationString||"",coach:((t.coach||{}).name)||((t.coaches&&t.coaches[0]||{}).name)||"",xi:xi,subs:subs};});
if(out.home||out.away)return out}
return null}
async function volleyDay(dateIso){
const d8=dateIso.slice(0,4)+"-"+dateIso.slice(4,6)+"-"+dateIso.slice(6,8);
const j=await grab("https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d="+d8+"&s=Volleyball",9000);
if(!j||!Array.isArray(j.events)||!j.events.length)return [];
const byL={};
j.events.forEach(function(e){
const ln=e.strLeague||"Voleybol";
if(!byL[ln])byL[ln]={id:"tsdb-"+String(ln).toLowerCase().replace(/[^a-z0-9]+/g,"-"),flag:"🏐",name:ln,matches:[]};
const start=(e.dateEvent||"")+"T"+(e.strTime||"00:00:00");
const t=Date.parse(start);
const hs=(e.intHomeScore!=null&&e.intHomeScore!=="")?+e.intHomeScore:null;
const as=(e.intAwayScore!=null&&e.intAwayScore!=="")?+e.intAwayScore:null;
const st=String(e.strStatus||"").toLowerCase();
let state="pre";
if(st.indexOf("finish")>=0||st==="ft")state="post";
else if(hs!=null||as!=null||st.indexOf("set")>=0||st.indexOf("live")>=0||st.indexOf("progress")>=0)state=(isFinite(t)&&t<Date.now()-5*36e5)?"post":"in";
else if(isFinite(t)&&t<Date.now()-8*36e5)state="post";
byL[ln].matches.push({id:String(e.idEvent),home:e.strHomeTeam||"?",away:e.strAwayTeam||"?",hid:"",aid:"",hs:hs,as:as,state:state,clock:(st.indexOf("set")>=0?(e.strStatus||""):""),detail:e.strStatus||"",venue:e.strVenue||"",start:(isNaN(t)?(e.dateEvent||""):start)});
});
return Object.keys(byL).map(function(k){return byL[k]}).filter(function(l){return l.matches.length})}
async function matchDetail(sport,lg,id){const path=sport==="basketball"?"basketball":"soccer";const d=await grab("https://site.api.espn.com/apis/site/v2/sports/"+path+"/"+lg+"/summary?event="+id,10000);if(!d)return null;
const comp=(d.competitions&&d.competitions[0])||((d.header&&d.header.competitions&&d.header.competitions[0])||{});
const cs=comp.competitors||[];const H=cs.find(x=>x.homeAway==="home")||cs[0]||{};const A=cs.find(x=>x.homeAway==="away")||cs[1]||{};
const hid=(H.team||{}).id,aid=(A.team||{}).id;
const events=[];
(d.keyEvents||comp.details||[]).forEach(ev=>{const tl=(((ev.type||{}).text)||"").toLowerCase();let kind=null;
if(ev.ownGoal||tl.indexOf("own goal")>=0)kind="og";
else if(ev.penaltyKick||tl.indexOf("penalty")>=0)kind="pen";
else if(ev.scoringPlay||tl.indexOf("goal")>=0)kind="goal";
else if(ev.redCard||tl.indexOf("red")>=0)kind="red";
else if(ev.yellowCard||tl.indexOf("yellow")>=0)kind="yellow";
else if(tl.indexOf("substitution")>=0)kind="sub";
if(!kind)return;
const src=ev.athletesInvolved||ev.participants||(ev.athlete?[ev.athlete]:[]);
const ath=src.map(x=>{const a=x.athlete||x;return a.displayName||a.shortName||a.fullName||""}).filter(Boolean);
if(!ath.length&&ev.text){const tp=String(ev.text).split(" - ");if(tp.length>1)ath.push(tp[tp.length-1]);}
events.push({min:((ev.clock||{}).displayValue)||"",period:(ev.period||{}).number||0,side:sideOf((ev.team||{}).id,hid,aid),player:ath[0]||"",assist:ath[1]||"",kind});});
events.sort((x,y)=>(x.period-y.period)||(minNum(x.min)-minNum(y.min)));
const lv=function(x){const v=(x.value!=null?x.value:(x.displayValue!=null?x.displayValue:(x.points!=null?x.points:0)));const n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:0};
const linescores={h:(H.linescores||[]).map(lv),a:(A.linescores||[]).map(lv)};
const leaders={home:[],away:[]};
(d.leaders||[]).forEach(cat=>{(cat.leaders||[]).forEach(l=>{const s=sideOf((l.team||{}).id,hid,aid);if(s&&leaders[s].length<3)leaders[s].push({n:((l.athlete||{}).displayName)||"",v:l.displayValue||String(l.value==null?"":l.value),c:cat.shortDisplayName||cat.displayName||cat.name||""})})});
const stats=[];const bt=(d.boxscore&&d.boxscore.teams)||[];
if(bt.length>=2){const pick=function(t,re){const f=(t.statistics||[]).find(s=>re.test((s.name||"").toLowerCase()));return f?(f.displayValue!=null?f.displayValue:String(f.value!=null?f.value:"")):""};
[["possession",/posses/],["shots",/shot|attempt/],["shotsOnTarget",/on ?target/],["cornerKicks",/corner/],["foulsCommitted",/foul/],["offsides",/offside/],["yellowCards",/yellow/],["saves",/save/],["passes",/pass/]].forEach(function(mm){const hv=pick(bt[0],mm[1]),av=pick(bt[1],mm[1]);if(hv||av)stats.push({k:mm[0],h:hv,a:av})});}
const lineups=extractLineups(d,hid,aid);
const gi=d.gameInfo||{};
const info={venue:gi.venue||((comp.venue||{}).fullName)||"",referee:(gi.officials&&gi.officials[0])?(gi.officials[0].fullName||""):"",attendance:gi.attendance||""};
const pre={form:{home:"",away:""},h2h:[],odds:""};
try{(d.recentForm||[]).forEach(t=>{const s=sideOf((t.team||{}).id,hid,aid);if(s&&t.form)pre.form[s]=String(t.form)})}catch(e){}
try{(d.headToHeadGames||[]).slice(0,5).forEach(g=>{const cs=(g.competitions||[])[0]||{};const cc=cs.competitors||[];const h=cs.find?cc.find(x=>x.homeAway==="home")||cc[0]||{}:cc[0]||{};const a=cc.find(x=>x.homeAway==="away")||cc[1]||{};pre.h2h.push({h:trName((h.team||{}).displayName||"?"),a:trName((a.team||{}).displayName||"?"),hs:h.score!=null?+h.score:null,as:a.score!=null?+a.score:null})})}catch(e){}
try{const pk=(d.pickcenter||[])[0];pre.odds=(pk&&pk.details)||(d.odds&&d.odds[0]&&d.odds[0].details)||""}catch(e){}
const out={events,linescores,leaders,stats,lineups,info,pre};
if(!lineups)out.debugKeys=Object.keys(d).join(",");
return out}
var CLEAN=new Map();
async function aiClean(text,env){
if(!env.GROQ_API_KEY)return null;
try{
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",
headers:{"Authorization":"Bearer "+env.GROQ_API_KEY,"Content-Type":"application/json"},
body:JSON.stringify({model:"openai/gpt-oss-120b",max_tokens:2000,temperature:0.2,reasoning_effort:"low",
messages:[{role:"user",content:"Aşağıdaki haber metnindeki reklam, abone ol / sosyal medya çağrıları, yazar bio'su ve tekrar eden boilerplate cümlelerini sil. Sadece haber içeriğini, kendi cümleni eklemeden, Türkçe paragraflarla ver.\n\n"+text}]})});
if(!r.ok)return null;const j=await r.json();
return (j.choices&&j.choices[0]&&j.choices[0].message&&j.choices[0].message.content)||null}catch(e){return null}}
// Takım arama + tarihten bağımsız fikstür: /team?sport=football&q=galatasaray → son 5 sonuç + sıradaki 5 maç.
// Takım listesi lig başına günde bir çekilir (bellekte); takım fikstürü 10 dk önbellek.
const TEAMS=new Map();
function normTR(s){return String(s||"").toLocaleLowerCase("tr").replace(/ı/g,"i").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()}
async function teamIndex(sport){const h=TEAMS.get(sport);if(h&&Date.now()-h.ts<864e5)return h.list;
const path=sport==="basketball"?"basketball":"soccer";const seen=new Set(),list=[];
const res=await Promise.allSettled(CAT[sport].map(l=>grab("https://site.api.espn.com/apis/site/v2/sports/"+path+"/"+l[0]+"/teams",9000).then(d=>[l,d])));
res.forEach(r=>{if(r.status!=="fulfilled"||!r.value[1])return;const l=r.value[0],d=r.value[1];
const lg=(((d.sports||[])[0]||{}).leagues||[])[0]||{};(lg.teams||[]).forEach(x=>{const t=x.team||{};const k=l[0]+"|"+t.id;if(!t.id||seen.has(k))return;seen.add(k);
list.push({id:String(t.id),name:trName(t.displayName||t.name||""),lg:l[0],flag:l[1],lname:l[2]})})});
if(list.length)TEAMS.set(sport,{ts:Date.now(),list});return list}
function scoreOf(x){if(x==null)return null;if(typeof x==="object")x=x.value!=null?x.value:x.displayValue;const n=+x;return isFinite(n)?n:null}
function schedEv(e,fb){const c=(e.competitions||[])[0]||{};const cs=c.competitors||[];const h=cs.find(x=>x.homeAway==="home")||cs[0]||{};const a=cs.find(x=>x.homeAway==="away")||cs[1]||{};const st=(c.status||{}).type||{};const lg=e.league||{};
return{id:e.id,lg:lg.slug||fb,lname:lg.name||"",home:trName((h.team||{}).displayName||"?"),away:trName((a.team||{}).displayName||"?"),hs:scoreOf(h.score),as:scoreOf(a.score),state:st.state||"pre",detail:st.shortDetail||"",start:e.date||c.date}}
async function teamSchedule(sport,q){const qn=normTR(q);if(qn.length<2)return{error:"en az 2 harf"};
const list=await teamIndex(sport);const m=list.filter(t=>normTR(t.name).includes(qn));
m.sort((x,y)=>(normTR(y.name)===qn)-(normTR(x.name)===qn)||(normTR(y.name).startsWith(qn))-(normTR(x.name).startsWith(qn))||x.name.length-y.name.length);
if(!m.length)return{team:null,others:[],matches:[]};
// Aynı takım birden çok ligde olabilir (Efes: EuroLeague + BSL); fikstürü boş olanı atla, en fazla 3 aday dene.
let body=null;for(const t of m.slice(0,3)){body=await oneSchedule(sport,t);if(body.matches.length)break}
const others=[...new Set(m.map(x=>x.name))].filter(n=>n!==body.team.name).slice(0,5);
return Object.assign({},body,{others})}
async function oneSchedule(sport,t){
const key="t|"+sport+"|"+t.lg+"|"+t.id;const hit=CACHE.get(key);if(hit&&Date.now()-hit.ts<600000)return hit.body;
const path=sport==="basketball"?"basketball":"soccer";const base="https://site.api.espn.com/apis/site/v2/sports/"+path+"/"+t.lg+"/teams/"+t.id+"/schedule";
const [p,f]=await Promise.all([grab(base,9000),grab(base+"?fixture=true",9000)]);
const seen=new Set(),all=[];[p,f].forEach(d=>((d||{}).events||[]).forEach(e=>{if(seen.has(e.id))return;seen.add(e.id);all.push(schedEv(e,t.lg))}));
all.sort((x,y)=>new Date(x.start)-new Date(y.start));
const past=all.filter(x=>x.state==="post").slice(-5),next=all.filter(x=>x.state!=="post").slice(0,5);
const body={team:t,matches:past.concat(next)};CACHE.set(key,{ts:Date.now(),body});return body}
export default{async fetch(req,env){const url=new URL(req.url);
if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"*"}});
if(url.pathname==="/match"){const sport=url.searchParams.get("sport")==="basketball"?"basketball":"football";const lg=url.searchParams.get("lg")||"";const id=url.searchParams.get("id")||"";if(!lg||!id)return json({error:"lg ve id gerekli"},400);
const key="m|"+sport+"|"+lg+"|"+id;const now=Date.now();const hit=CACHE.get(key);
if(hit&&now-hit.ts<30000)return json(hit.body);
const body=await matchDetail(sport,lg,id);if(!body)return json({error:"detay yok"},404);
CACHE.set(key,{ts:now,body});return json(body)}
if(url.pathname==="/clean"&&req.method==="POST"){
const d=await req.json().catch(()=>null);
const text=d&&String(d.text||"").slice(0,14000);
if(!text||text.length<80)return json({error:"metin çok kısa"},400);
const k=text.length+"|"+text.slice(0,80)+"|"+text.slice(-80);
const hit=CLEAN.get(k);if(hit&&Date.now()-hit.ts<7*864e5)return json({clean:hit.text,cached:true});
const c=await aiClean(text,env);if(!c)return json({error:"AI yanıt vermedi"},502);
CLEAN.set(k,{ts:Date.now(),text:c});if(CLEAN.size>60){for(const[k2,v]of CLEAN){if(Date.now()-v.ts>7*864e5)CLEAN.delete(k2)}}
return json({clean:c})}
if(url.pathname==="/team"){const sp=url.searchParams.get("sport")==="basketball"?"basketball":"football";return json(await teamSchedule(sp,(url.searchParams.get("q")||"").slice(0,40)))}
if(url.pathname!=="/scores")return json({error:"use /scores, /match, /team veya /clean"},404);
let sport=url.searchParams.get("sport")||"football";if(sport!=="basketball"&&sport!=="volleyball")sport="football";
const date=(url.searchParams.get("date")||todayKey()).replace(/-/g,"");
const key=sport+"|"+date;const now=Date.now();const ttl=date===todayKey()?45000:600000;const hit=CACHE.get(key);
if(hit&&now-hit.ts<ttl)return json(hit.body);
let leagues=[];
if(sport==="volleyball"){leagues=(await volleyDay(date))||[]}
else{const res=await Promise.allSettled(CAT[sport].map(l=>league(sport,l[0],l[1],l[2],date)));res.forEach(r=>{if(r.status==="fulfilled"&&r.value)leagues.push(r.value)})}
const body={as_of:now,sport,date,leagues};CACHE.set(key,{ts:now,body});
if(CACHE.size>60){for(const[k,v]of CACHE){if(now-v.ts>600000)CACHE.delete(k)}}
return json(body)}};