const enc=new TextEncoder();
const fields=['wifiName','wifiPassword','arrival','checkout','appliances','houseRules','hostContact','receptionContact','emergencyGuidance'];
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json',...headers}});
const random=(size=32)=>Array.from(crypto.getRandomValues(new Uint8Array(size)),x=>x.toString(16).padStart(2,'0')).join('');
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function hash(text,pepper){const k=await crypto.subtle.importKey('raw',enc.encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,enc.encode(text)));}
export async function passwordHash(password,salt=random(16)) {const k=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveBits']);return `pbkdf2$100000$${salt}$${hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(salt),iterations:100000},k,256))}`;}
async function verifyPassword(password,stored){const p=String(stored).split('$');if(p.length!==4||p[0]!=='pbkdf2'||p[1]!=='100000'||!/^[a-f0-9]{32}$/.test(p[2])||!/^[a-f0-9]{64}$/.test(p[3]))return false;const candidate=await passwordHash(password,p[2]);let diff=0;for(let i=0;i<stored.length;i++)diff|=stored.charCodeAt(i)^candidate.charCodeAt(i);return diff===0;}
function cookieName(url){return url.protocol==='https:'?'__Host-cv_session':'cv_local_session';}
function cookie(url,token,maxAge){return `${cookieName(url)}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${url.protocol==='https:'?'; Secure':''}`;}
async function session(req,env,url,now){const value=(req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName(url)+'='))?.split('=')[1];if(!value||! /^[a-f0-9]{64}$/.test(value))return null;const s=await env.DB.prepare('SELECT s.*, b.active, b.starts_at, b.ends_at FROM sessions s LEFT JOIN bookings b ON s.booking_id=b.id WHERE token_hash=? AND expires_at>?').bind(await hash(value,env.SESSION_SECRET),now).first();if(!s)return null;if(s.role==='guest'&&(!s.active||s.starts_at>now||s.ends_at<=now))return null;return s;}
async function limit(env,key,now){await env.DB.prepare('INSERT INTO attempts(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END, reset_at=CASE WHEN reset_at<=? THEN ? ELSE reset_at END').bind(key,now+900,now,now,now+900).run();const a=await env.DB.prepare('SELECT count FROM attempts WHERE key=?').bind(key).first();return a.count>20;}
async function createSession(env,url,role,bookingId,expiry,now){const token=random();await env.DB.prepare('INSERT INTO sessions(token_hash,role,booking_id,expires_at) VALUES(?,?,?,?)').bind(await hash(token,env.SESSION_SECRET),role,bookingId,expiry).run();return json({role},200,{'Set-Cookie':cookie(url,token,expiry-now)});}
async function body(req){if(Number(req.headers.get('content-length')||0)>8192)throw Object.assign(new Error('Request too large.'),{status:413});const s=await req.text();if(s.length>8192)throw Object.assign(new Error('Request too large.'),{status:413});try{return JSON.parse(s);}catch{throw Object.assign(new Error('Invalid JSON.'),{status:400});}}
async function api(req,env,url,now){
 const path=url.pathname;
 if(req.method!=='GET'&&(req.headers.get('origin')!==url.origin||req.headers.get('x-cv-request')!=='1'||!req.headers.get('content-type')?.startsWith('application/json')))return json({error:'Request not permitted.'},403);
 const s=await session(req,env,url,now);
 if(path==='/api/session'&&req.method==='GET')return s?json({role:s.role,expiresAt:s.expires_at}):json({error:'Please enter your guest code.'},401);
 if(path==='/api/login'&&req.method==='POST'){
  const input=await body(req);const role=input.role==='admin'?'admin':'guest';
  // CF-Connecting-IP is set by the edge. The local adapter sets it from the socket.
  const ip=req.headers.get('cf-connecting-ip')||'unknown';
  if(await limit(env,await hash(`login:${role}:${ip}`,env.SESSION_SECRET),now))return json({error:'Too many attempts. Please wait 15 minutes.'},429,{'Retry-After':'900'});
  const credential=String(input.credential||'');if(credential.length>256)return json({error:'Access could not be verified.'},401);
  if(role==='admin')return await verifyPassword(credential,env.ADMIN_PASSWORD_HASH)?createSession(env,url,'admin',null,now+3600,now):json({error:'Access could not be verified.'},401);
  const normalized=credential.replace(/[\s-]/g,'').toLowerCase();
  const b=await env.DB.prepare('SELECT id,ends_at FROM bookings WHERE code_hash=? AND active=1 AND starts_at<=? AND ends_at>?').bind(await hash(normalized,env.SESSION_SECRET),now,now).first();
  return b?createSession(env,url,'guest',b.id,Math.min(now+86400,b.ends_at),now):json({error:'Code unavailable. Check your code and booking dates with your host.'},401);
 }
 if(path==='/api/logout'&&req.method==='POST'){
  if(s)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(s.token_hash).run();
  return json({ok:true},200,{'Set-Cookie':cookie(url,'',0)});
 }
 if(!s)return json({error:'Your access has expired. Please enter your code again.'},401);
 if(path==='/api/guest-info'&&req.method==='GET'){
  const saved=await env.DB.prepare("SELECT value FROM settings WHERE id='guest-info'").first();return json(saved?JSON.parse(saved.value):Object.fromEntries(fields.map(f=>[f,''])));
 }
 if(s.role!=='admin')return json({error:'Host access required.'},403);
 if(path==='/api/admin/bookings'&&req.method==='GET')return json((await env.DB.prepare('SELECT id,label,starts_at,ends_at,active FROM bookings ORDER BY created_at DESC').all()).results);
 if(path==='/api/admin/bookings'&&req.method==='POST'){
  const b=await body(req);const label=String(b.label||'').trim();const start=Number(b.startsAt),end=Number(b.endsAt);
  if(!label||label.length>80||!Number.isInteger(start)||!Number.isInteger(end)||start>=end||end<=now||end-start>366*86400)return json({error:'Use a label up to 80 characters and a valid access window of no more than one year.'},400);
  const id=crypto.randomUUID(),code=random(12);await env.DB.prepare('INSERT INTO bookings(id,label,code_hash,starts_at,ends_at,active,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,label,await hash(code,env.SESSION_SECRET),start,end,b.active===true?1:0,now).run();return json({id,code:code.match(/.{1,4}/g).join('-')},201);
 }
 const match=path.match(/^\/api\/admin\/bookings\/([a-f0-9-]{36})$/);
 if(match&&req.method==='PATCH'){
  const b=await body(req);if(typeof b.active!=='boolean')return json({error:'Set active to true or false.'},400);
  await env.DB.prepare('UPDATE bookings SET active=? WHERE id=?').bind(b.active?1:0,match[1]).run();
  // Revocation also removes sessions so reactivation cannot restore old cookies.
  await env.DB.prepare('DELETE FROM sessions WHERE booking_id=?').bind(match[1]).run();return json({ok:true});
 }
 if(path==='/api/admin/guest-info'&&req.method==='PUT'){
  const b=await body(req);const data={};for(const f of fields){if(typeof b[f]!=='string'||b[f].length>600)return json({error:'Each field must be plain text, up to 600 characters.'},400);data[f]=b[f];}
  await env.DB.prepare("INSERT INTO settings(id,value) VALUES('guest-info',?) ON CONFLICT(id) DO UPDATE SET value=excluded.value").bind(JSON.stringify(data)).run();return json({ok:true});
 }
 return json({error:'Not found.'},404);
}
const publicFiles=new Set(['/','/index.html','/assets/access.js','/assets/index.css','/assets/welcome.png','/manifest.webmanifest','/sw.js','/offline.html','/icons/icon.svg','/icons/icon-192.png','/icons/icon-512.png','/favicon.ico']);
export default {async fetch(req,env){
 const url=new URL(req.url),now=Math.floor(Date.now()/1000);let response;
 try{
  const configured=env.DB&&env.SESSION_SECRET?.length>=32&&env.ADMIN_PASSWORD_HASH;
  if(url.pathname.startsWith('/api/')){
   response=configured?await api(req,env,url,now):json({error:'Guest access is not configured. Please contact your host.'},503);
   if(configured&&Math.random()<.02)await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE expires_at<=?').bind(now),env.DB.prepare('DELETE FROM attempts WHERE reset_at<=?').bind(now)]);
  }else if(publicFiles.has(url.pathname))response=await env.ASSETS.fetch(req);
  else if(configured&&await session(req,env,url,now))response=await env.ASSETS.fetch(req);
  else response=new Response('Guest access required.',{status:401});
 }catch(e){response=e.status?json({error:e.message},e.status):json({error:'The concierge is temporarily unavailable. Please try again.'},500);}
 const headers=new Headers(response.headers);
 headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('X-Frame-Options','DENY');headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; worker-src 'self'");
 if(url.protocol==='https:')headers.set('Strict-Transport-Security','max-age=31536000');
 return new Response(response.body,{status:response.status,headers});
}};
