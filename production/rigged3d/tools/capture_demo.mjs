import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const base=process.env.DEMO_URL||'http://127.0.0.1:4173/capture.html';
const out=process.env.OUT_DIR||'render-output';
const fps=Number(process.env.FPS||24);
const duration=Number(process.env.DURATION||9);
await fs.rm(out,{recursive:true,force:true});
await fs.mkdir(path.join(out,'frames'),{recursive:true});

const launchOptions={headless:true,args:[
  '--use-gl=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist',
  '--disable-dev-shm-usage','--no-sandbox'
]};
if(process.env.BROWSER_CHANNEL) launchOptions.channel=process.env.BROWSER_CHANNEL;
if(process.env.BROWSER_EXECUTABLE) launchOptions.executablePath=process.env.BROWSER_EXECUTABLE;
const browser=await chromium.launch(launchOptions);
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
page.on('console',m=>console.log('[browser]',m.text()));
page.on('pageerror',e=>console.error('[pageerror]',e));
await page.goto(base,{waitUntil:'networkidle',timeout:120000});
await page.waitForFunction(()=>window.__ready===true,{timeout:120000});

const meta=await page.evaluate(()=>({clips:window.__clipInventory,chosen:window.__chosenClips,story:window.__storyMeta||null,contactAudit:window.__contactAudit||null}));
await fs.writeFile(path.join(out,'clip_inventory.json'),JSON.stringify(meta,null,2));

const total=Math.round(duration*fps);
for(let i=0;i<total;i++){
  const t=i/fps;
  await page.evaluate(t=>window.__setTime(t),t);
  const file=path.join(out,'frames',`frame_${String(i).padStart(4,'0')}.png`);
  await page.screenshot({path:file,type:'png'});
  if(i%48===0) console.log(`captured ${i}/${total}`);
}
await browser.close();
console.log(`Captured ${total} deterministic frames at ${fps} fps`);
