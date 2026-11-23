// Vyrenderuje PNG ikony z SVG (Chromium cez Playwright, nie je závislosť projektu).
// Použitie: node scripts/logo/render.mjs <priečinok so SVG z logo.py> <cieľový priečinok>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
// Playwright je nainštalovaný globálne (NODE_PATH), ESM import ho nenájde.
const { chromium } = createRequire(import.meta.url)('playwright');
const [FIN,DST]=process.argv.slice(2);
const jobs=[['ikona-kutisko.svg','icon-512.png',512],['ikona-kutisko.svg','icon-192.png',192],
 ['ikona-kutisko.svg','icon-maskable-512.png',512],['ikona-kutisko.svg','icon-maskable-192.png',192],
 ['ikona-kutisko.svg','apple-touch-icon.png',180],['ikona-kutisko-tmava.svg','icon-tmava-512.png',512],
 ['icon.svg','favicon-48.png',48],['icon.svg','favicon-32.png',32],['icon.svg','favicon-16.png',16]];
(async()=>{const b=await chromium.launch();const p=await b.newPage({deviceScaleFactor:1});
 for(const [src,out,sz] of jobs){const svg=fs.readFileSync(path.join(FIN,src),'utf8').replace(/width="1024" height="1024"/,`width="${sz}" height="${sz}"`);
  await p.setViewportSize({width:sz,height:sz});await p.setContent(`<style>*{margin:0}body{background:transparent}svg{display:block}</style>${svg}`);
  await p.screenshot({path:path.join(DST,out),omitBackground:true,clip:{x:0,y:0,width:sz,height:sz}});}
 await b.close();})();
