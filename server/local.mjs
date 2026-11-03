// Local-only adapter; production uses Cloudflare D1 and the same worker handler.
import {DatabaseSync} from 'node:sqlite';
import {readFile,mkdir,stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import path from 'node:path';
import worker from './worker.js';
await mkdir('.local',{recursive:true});
const sqlite=new DatabaseSync(process.env.LOCAL_DB||'.local/concierge.sqlite');
sqlite.exec(await readFile('migrations/0001_access.sql','utf8'));
function prepare(sql){let args=[];const statement={bind(...values){args=values;return statement;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return sqlite.prepare(sql).run(...args);}};return statement;}
let secrets={};try{secrets=JSON.parse(await readFile('.local/secrets.json','utf8'));}catch{}
const env={DB:{prepare,async batch(items){return Promise.all(items.map(s=>s.run()));}},SESSION_SECRET:process.env.SESSION_SECRET||secrets.SESSION_SECRET,ADMIN_PASSWORD_HASH:process.env.ADMIN_PASSWORD_HASH||secrets.ADMIN_PASSWORD_HASH,ASSETS:{async fetch(req){const u=new URL(req.url);const rel=u.pathname==='/'?'index.html':decodeURIComponent(u.pathname).slice(1);const file=path.resolve('dist',rel);if(!file.startsWith(path.resolve('dist')+path.sep))return new Response('Not found',{status:404});try{if(!(await stat(file)).isFile())throw Error();const ext=path.extname(file);return new Response(await readFile(file),{headers:{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'})[ext]||'application/octet-stream'}});}catch{return new Response('Not found',{status:404});}}}};
const port=Number(process.env.PORT||8787);
createServer(async(req,res)=>{try{const chunks=[];let total=0;for await(const chunk of req){total+=chunk.length;if(total>8192){res.writeHead(413);res.end();return;}chunks.push(chunk);}const origin=`http://127.0.0.1:${port}`;const headers=new Headers(req.headers);headers.set('cf-connecting-ip',req.socket.remoteAddress||'local');const request=new Request(new URL(req.url,origin),{method:req.method,headers,...(req.method!=='GET'&&req.method!=='HEAD'?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('Request failed.');}}).listen(port,'127.0.0.1',()=>console.log(`Private local concierge listening on port ${port}`));
