import './style.css';
import {api,escape} from './api.js';
const main=document.querySelector('main');
let identity=null,checking=false;
function locked(message=''){
 identity=null;globalThis.cvRole=null;document.querySelector('#navigation').innerHTML='';document.querySelector('#session-tools')?.remove();document.querySelector('#photo-dialog')?.close();
 main.innerHTML=`<section class="welcome"><img class="welcome-art" src="/assets/welcome.png" width="1536" height="1024" alt="Constantine VI — The Private Concierge. Approved Roman column welcome artwork." /><div class="welcome-entry"><h1 class="sr-only">Your private guest concierge</h1><p class="eyebrow">EXCLUSIVELY FOR OUR GUESTS</p><form id="access-form" class="access-form"><label for="credential">${location.hash==='#admin'?'Host passphrase':'Your booking access code'}</label><input id="credential" name="credential" type="password" autocomplete="${location.hash==='#admin'?'current-password':'off'}" required maxlength="256" autocapitalize="none" autocorrect="off" spellcheck="false" aria-describedby="access-status" /><button class="button" type="submit">${location.hash==='#admin'?'Sign in as host':'Enter the concierge'} →</button><p id="access-status" role="status">${escape(message)}</p></form><p class="fine-print">${location.hash==='#admin'?'Host administration · secure sign-in':'Your host shares your code privately through Airbnb. No account or app required.'}</p>${location.hash==='#admin'?'<a href="#welcome" class="subtle-link">Guest access</a>':''}</div></section>`;
 main.querySelector('form').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;const credential=new FormData(e.target).get('credential');try{await api('/api/login','POST',{role:location.hash==='#admin'?'admin':'guest',credential});e.target.reset();location.reload();}catch(err){main.querySelector('#access-status').textContent=err.message;button.disabled=false;}};
}
async function start(){try{identity=await api('/api/session');const tools=document.createElement('div');tools.id='session-tools';tools.className='session-tools';tools.innerHTML=`${identity.role==='admin'?'<a href="#admin">Host administration</a>':''}<button id="install-app" hidden>Add to home screen</button><button id="sign-out">Sign out</button>`;document.querySelector('.masthead').after(tools);document.querySelector('#sign-out').onclick=async()=>{try{await api('/api/logout','POST',{});location.replace('/');}catch{locked('Unable to sign out while offline. Reconnect and sign out to end your session.');}};globalThis.cvRole=identity.role;setTimeout(()=>location.replace('/'),Math.max(0,identity.expiresAt*1000-Date.now()));await import('./main.js');}catch(e){locked(e.message.includes('expired')?'':e.message);}}
window.addEventListener('cv-expired',()=>{if(identity)location.replace('/');});
window.addEventListener('hashchange',()=>{if(!identity)locked();});
async function check(){if(!identity||checking)return;checking=true;try{await api('/api/session');}catch{location.replace('/');}finally{checking=false;}}
setInterval(check,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
window.addEventListener('offline',()=>{if(identity)location.replace('/');});
let installPrompt;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;const button=document.querySelector('#install-app');if(button){button.hidden=false;button.onclick=async()=>{await installPrompt.prompt();button.hidden=true;installPrompt=null;};}});
if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
start();
