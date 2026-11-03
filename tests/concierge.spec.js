import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const mutation={Origin:'http://127.0.0.1:8787','X-CV-Request':'1'};
async function host(request){const password=(await readFile('.local/host-password.txt','utf8')).trim();const r=await request.post('/api/login',{headers:mutation,data:{role:'admin',credential:password}});expect(r.status()).toBe(200);}
async function booking(request){await host(request);const now=Math.floor(Date.now()/1000);const r=await request.post('/api/admin/bookings',{headers:mutation,data:{label:'Browser test '+crypto.randomUUID(),startsAt:now-60,endsAt:now+3600,active:true}});expect(r.status()).toBe(201);return r.json();}
async function login(page,code){await page.goto('/');await page.getByLabel('Your booking access code').fill(code);await page.getByRole('button',{name:'Enter the concierge'}).click();await expect(page.getByRole('link',{name:'Enter the concierge'})).toBeVisible();}
const images=async page=>expect.poll(()=>page.locator('main img').evaluateAll(is=>is.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);
test('secure guest journey preserves artwork and direct map interaction',async({page,request},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const b=await booking(request);
 await page.goto('/#map');await expect(page.getByLabel('Your booking access code')).toBeVisible();await expect(page.locator('.map-viewport')).toHaveCount(0);
 await login(page,b.code);await images(page);await expect(page.locator('.welcome-art')).toHaveAttribute('src','/assets/welcome.png');
 await page.screenshot({path:`docs/screenshots/${testInfo.project.name}-welcome.png`,fullPage:true});
 await page.getByRole('link',{name:'Enter the concierge'}).click();await expect(page.locator('.map-viewport')).toBeInViewport();await images(page);
 await page.getByRole('button',{name:'Lucca Restaurant',exact:true}).click();await expect(page.locator('.facility-detail h2')).toHaveText('Lucca Restaurant');await expect(page.locator('.facility-detail')).toContainText('unavailable');
 await page.screenshot({path:`docs/screenshots/${testInfo.project.name}-map.png`});
 await page.getByRole('button',{name:'Fit map'}).click();await expect(page.locator('#zoom-value')).toHaveText('100%');
 await page.getByRole('link',{name:'Your Apartment',exact:true}).click();await images(page);await page.getByRole('button',{name:'Enlarge photo: The bedroom',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Close photograph'}).click();
 await page.getByText('Wi-Fi password',{exact:true}).click();await expect(page.locator('details[open] .private-copy')).toContainText('Not yet supplied.');
 for(const [id,title] of [['discover','Discover Northern Cyprus'],['assistance','Guest Assistance'],['collection','The Private Collection']]){await page.goto('/#'+id);await expect(page.getByRole('heading',{level:1})).toHaveText(title);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page.getByLabel('Your booking access code')).toBeVisible();await page.goto('/#home');await expect(page.locator('.gallery')).toHaveCount(0);expect(errors).toEqual([]);
});
test('host UI creates and revokes access, edits private fields safely and generates QR',async({page,request})=>{
 // Separate host session from the guest journey; no credentials in browser bundles.
 const password=(await readFile('.local/host-password.txt','utf8')).trim();await page.goto('/#admin');await page.getByLabel('Host passphrase').fill(password);await page.getByRole('button',{name:'Sign in as host'}).click();await expect(page.getByRole('heading',{name:'Guest access',exact:true})).toBeVisible();
 await page.getByLabel('Booking label').fill('UI stay');const now=Date.now();const local=t=>{const d=new Date(t);return new Date(t-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};await page.getByLabel('Access starts').fill(local(now-60000));await page.getByLabel('Access ends').fill(local(now+3600000));await page.getByLabel('Activate immediately').check();await page.getByRole('button',{name:'Create access code',exact:true}).click();await expect(page.locator('.guest-code')).toHaveText(/^[a-f0-9]{4}(-[a-f0-9]{4}){5}$/);
 await page.getByRole('button',{name:'I have saved it',exact:false}).click();await expect(page.locator('.booking-list')).toContainText('UI stay');
 // Use only placeholders on the shared browser-test database.
 await page.getByLabel('House rules',{exact:true}).fill('');await page.getByRole('button',{name:'Save private information'}).click();await expect(page.locator('#info-status')).toHaveText('Private information saved.');
 await page.getByLabel('Approved deployed HTTPS guest address').fill('https://concierge.example/');await page.getByRole('button',{name:'Prepare QR for this address'}).click();await expect(page.locator('#qr-output img')).toBeVisible();await expect(page.locator('#qr-output')).toContainText('https://concierge.example/');
 const row=page.locator('.booking-list article').filter({has:page.getByRole('heading',{name:'UI stay',exact:true})}).first();await row.getByRole('button',{name:'Deactivate & revoke sessions'}).click();await expect(page.locator('.booking-list article').filter({has:page.getByRole('heading',{name:'UI stay',exact:true})}).first()).toContainText('Inactive');
});
test('booking revocation clears guest UI and protected assets reject the old session',async({page,request})=>{
 const b=await booking(request);await login(page,b.code);await page.goto('/#home');await expect(page.locator('.gallery')).toBeVisible();expect((await request.patch(`/api/admin/bookings/${b.id}`,{headers:mutation,data:{active:false}})).status()).toBe(200);await page.reload();await expect(page.getByLabel('Your booking access code')).toBeVisible();expect((await page.request.get('/assets/bedroom.jpg')).status()).toBe(401);
});
test('PWA shell registers without caching authenticated content',async({page,request})=>{
 const b=await booking(request);await login(page,b.code);await page.evaluate(()=>navigator.serviceWorker.ready);const manifest=await (await page.request.get('/manifest.webmanifest')).json();expect(manifest.start_url).toBe('/');expect(manifest.display).toBe('standalone');const cached=await page.evaluate(async()=>{const out=[];for(const key of await caches.keys())for(const r of await (await caches.open(key)).keys())out.push(new URL(r.url).pathname);return out;});expect(cached.every(p=>['/offline.html','/icons/icon-192.png','/icons/icon-512.png'].includes(p))).toBe(true);
 await page.context().setOffline(true);await expect(page.getByText('Private guest guidance is not stored offline.',{exact:false})).toBeVisible();
});
