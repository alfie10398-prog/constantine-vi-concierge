import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
const assertImages=async page=>{await expect.poll(()=>page.locator('main img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);};
test('approved welcome, direct map entry, selection and zoom',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('Constantine VI');
 await assertImages(page);
 await expect(page.locator('.welcome-art')).toHaveAttribute('src','/assets/welcome.png');
 await page.screenshot({path:`docs/screenshots/${testInfo.project.name}-welcome.png`,fullPage:true});
 await page.getByRole('link',{name:'Enter the concierge'}).click();
 await expect(page).toHaveURL(/#map$/);
 await expect(page.locator('.map-viewport')).toBeInViewport();
 await expect(page.locator('.facility-detail h2')).toHaveText('Constantine · Building 10');
 await assertImages(page);
 await page.getByRole('button',{name:'Lucca Restaurant',exact:true}).click();
 await expect(page.locator('.facility-detail h2')).toHaveText('Lucca Restaurant');
 await expect(page.locator('.facility-detail')).toContainText('Walking route & time unavailable');
 await expect(page.locator('.pin[aria-pressed=true]')).toHaveCount(1);
 await expect(page.locator('.home-pin')).toBeVisible();
 await expect(page.locator('svg path')).toHaveCount(0);
 const initialZoom=Number((await page.locator('#zoom-value').textContent()).replace('%',''));
 await page.screenshot({path:`docs/screenshots/${testInfo.project.name}-map.png`,fullPage:false});
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();
 await expect(page.locator('#zoom-value')).toHaveText(`${initialZoom+50}%`);
 await page.getByRole('button',{name:'Fit map'}).click();
 await expect(page.locator('#zoom-value')).toHaveText('100%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
test('sections, real apartment gallery and guest information',async({page},testInfo)=>{
 await page.goto('/#home');await assertImages(page);
 await expect(page.getByText('Up to 5 guests')).toBeVisible();
 await page.getByRole('button',{name:'Enlarge photo: The bedroom',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.locator('dialog img')).toHaveAttribute('src','/assets/bedroom.jpg');
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
 await page.getByText('Wi-Fi & water',{exact:true}).click();await expect(page.getByText(/Your host will share network details privately/)).toBeVisible();
 await page.screenshot({path:`docs/screenshots/${testInfo.project.name}-home.png`,fullPage:true});
 for(const [id,title] of [['wellness','Pools & Wellness'],['dining','Dining & Social'],['beach','Long Beach'],['collection','The Private Collection']]){
  await page.goto(`/#${id}`);await expect(page.getByRole('heading',{level:1})).toHaveText(title);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 }
 await expect(page.getByText('A little gem by the water.',{exact:false})).toBeVisible();
 await page.goto('/#map/spa');await expect(page.locator('.facility-detail h2')).toHaveText('Caesar’s Spa & Beauty');
});
test('portable preview is self-contained and works offline',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.context().setOffline(true);
 await page.setContent(await readFile('dist/Constantine-VI-Private-Preview.html','utf8'));
 await assertImages(page);await page.getByRole('link',{name:'Enter the concierge'}).click();await assertImages(page);
 await expect(page.locator('.map-viewport')).toBeVisible();
 await page.getByRole('link',{name:'Your Home',exact:true}).click();await assertImages(page);
 await page.getByRole('button',{name:'Enlarge photo: The bedroom',exact:true}).click();
 await expect.poll(()=>page.locator('dialog img').evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 expect(errors).toEqual([]);
});
