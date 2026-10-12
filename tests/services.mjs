import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs/promises';
import { startServer } from '../scripts/serve.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const data=JSON.parse(await fs.readFile(new URL('../content/services.json',import.meta.url),'utf8'));
const server=await startServer({port:0,directory:process.env.TEST_DIST==='1'?'dist':'.'});
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,ignoreDefaultArgs:['--disable-back-forward-cache']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(origin+'/services/');
 await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('[data-service]').count(),5);
 assert.equal(await page.locator('[data-service-controls]').count(),0);
 await page.locator('.services-intro .button').click();
 await page.waitForFunction(()=>location.hash==='#consulting');
 for(const service of data.services) {
  await page.locator('[data-service-nav] a[href="#'+service.id+'"]').click();
  await page.waitForFunction(id=>document.querySelector('[data-service-nav] [aria-current]')?.hash==='#'+id,service.id);
  await page.waitForTimeout(500);
  const card=page.locator('#'+service.id);
  const geometry=await card.evaluate(el=>({top:el.getBoundingClientRect().top,navBottom:document.querySelector('[data-service-nav]').getBoundingClientRect().bottom}));
  assert.ok(geometry.top>=geometry.navBottom-2,service.title+' clears sticky navigation');
  assert.equal(await card.locator('.service-scope li').count(),service.keyAreas.length);
  assert.equal(await card.locator('.service-action a').getAttribute('href'),'/contact/#consultation_form');
  const details=card.locator('details');
  const before=await card.evaluate(el=>el.offsetHeight);
  await details.locator('summary').focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(420);
  assert.notEqual(await details.getAttribute('open'),null,'Keyboard opens full source copy');
  await page.waitForFunction(({id,before})=>document.getElementById(id).offsetHeight>before+50,{id:service.id,before});
  await page.keyboard.press('Enter');
  await page.waitForTimeout(420);
  assert.equal(await details.getAttribute('open'),null);
 }
 // Source-specific alternating composition: network/deployment left; security/support right.
 const positions=await page.evaluate(()=>[...document.querySelectorAll('[data-service]')].filter(el=>el.id!=='design').map(el=>({id:el.id,art:el.querySelector('.service-art').getBoundingClientRect().left,copy:el.querySelector('.service-detail-body').getBoundingClientRect().left})));
 for(const item of positions) assert.equal(item.art<item.copy,['consulting','implementation'].includes(item.id),item.id+' matches approved image placement');
 for(const width of [1440,1280,1024,768,390,360,320]) {
  await page.setViewportSize({width,height:844});
  await page.goto(origin+'/services/');
  await page.evaluate(()=>document.fonts.ready);
  const layout=await page.evaluate(()=>({
   overflow:document.documentElement.scrollWidth>innerWidth,
   clipped:[...document.querySelectorAll('h1,h2,h3,p,a,summary')].filter(el=>el.getClientRects().length&&el.clientWidth>0&&el.scrollWidth>el.clientWidth+1).map(el=>el.textContent.trim()),
   overlap:[...document.querySelectorAll('.service-lead')].filter(el=>el.getBoundingClientRect().top<el.previousElementSibling.querySelector('h2').getBoundingClientRect().bottom-1).map(el=>el.textContent),
   nav:getComputedStyle(document.querySelector('[data-service-nav]')).position,
   designImage:(()=>{
    const figure=document.querySelector('.service-art-design-flow');
    const image=figure.querySelector('img');
    const frame=figure.getBoundingClientRect(),art=image.getBoundingClientRect();
    return art.top>=frame.top-1&&art.bottom<=frame.bottom+1&&art.left>=frame.left-1&&art.right<=frame.right+1;
   })(),
  }));
  assert.equal(layout.overflow,false,'No page overflow at '+width);
  assert.deepEqual(layout.clipped,[],'No clipped text at '+width);
  assert.deepEqual(layout.overlap,[],'Summary does not overlap heading at '+width);
  assert.ok(layout.designImage,'Full Solution Design image fits its frame at '+width);
  if(width<768) assert.equal(layout.nav,'static');
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 await page.locator('#consulting summary').click();
 assert.equal(await page.locator('#consulting details').evaluate(el=>getComputedStyle(el,'::details-content').transitionDuration),'0s');
 assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:900});
 await page.goto(origin+'/services/#design');
 await page.waitForFunction(()=>document.querySelector('[data-service-nav] [aria-current]')?.hash==='#design');
 await page.evaluate(()=>addEventListener('pageshow',event=>{window.__serviceRestored=event.persisted;}));
 await page.locator('#design .service-action a').click();
 await page.waitForURL(origin+'/contact/#consultation_form');
 await page.goBack({waitUntil:'commit'});
 await page.waitForFunction(()=>window.__serviceRestored===true);
 await page.locator('[data-service-nav] a[href="#cybersecurity-consulting"]').click();
 await page.waitForFunction(()=>document.querySelector('[data-service-nav] [aria-current]')?.hash==='#cybersecurity-consulting');
 assert.deepEqual(errors,[]);
 for(const width of [1440,390]) {
  const plain=await browser.newPage({javaScriptEnabled:false,viewport:{width,height:844}});
  await plain.goto(origin+'/services/#support');
  await plain.locator('#support summary').click();
  assert.notEqual(await plain.locator('#support details').getAttribute('open'),null);
  assert.equal(await plain.locator('[data-service]').count(),5);
  await plain.close();
 }
 console.log('PASS: vertical Services anchors/sticky clearance, keyboard disclosures, full source scopes, responsive 320–1440, reduced motion, BFCache and no-JS');
} finally {
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
