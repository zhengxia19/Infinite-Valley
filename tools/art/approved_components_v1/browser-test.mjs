import { chromium } from "playwright";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { mkdir,writeFile } from "node:fs/promises";
const server=spawn(process.execPath,["node_modules/vite/bin/vite.js","preview","--host","127.0.0.1","--port","4173","--strictPort"],{stdio:"inherit"});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch("http://127.0.0.1:4173/?review=1")).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
 page.on("pageerror",e=>errors.push(String(e)));const start=Date.now();
 await page.goto("http://127.0.0.1:4173/?review=1");await page.waitForSelector('[data-review-ready="true"]',{timeout:60000});
 const hud=page.locator("#hud");const readyMs=Date.now()-start;
 await page.waitForFunction(()=>Number(document.querySelector("#hud").dataset.x)===416);
 await page.keyboard.down("ArrowRight");try{await page.waitForFunction(()=>Number(document.querySelector("#hud").dataset.x)>920,{},{timeout:20000})}finally{await page.keyboard.up("ArrowRight")}
 const crossedX=Number(await hud.getAttribute("data-x"));assert(crossedX>920);
 await page.getByRole("combobox",{name:"季节"}).selectOption("winter");await page.waitForFunction(()=>document.querySelector("#hud").dataset.season==="winter");
 await page.getByRole("combobox",{name:"缩放"}).selectOption("2");await page.waitForFunction(()=>document.querySelector("#hud").dataset.zoom==="2");
 await page.getByRole("button",{name:"开启围栏门"}).click();await page.waitForFunction(()=>document.querySelector("#hud").dataset.gate==="true");
 await page.getByRole("combobox",{name:"场景"}).selectOption("nature");await page.waitForFunction(()=>document.querySelector("#hud").dataset.scene==="nature");
 const stats=await page.evaluate(()=>new Promise(resolve=>{const start=performance.now();let frames=0,prev=start,dt=[];function frame(t){if(frames++)dt.push(t-prev);prev=t;if(t-start<2000)requestAnimationFrame(frame);else resolve({fps:(frames-1)*1000/(t-start),p95Ms:dt.sort((a,b)=>a-b)[Math.floor(dt.length*.95)]})}requestAnimationFrame(frame)}));
 assert.equal(errors.length,0,errors.join("\n"));await mkdir("test-results/asset-review",{recursive:true});
 await page.screenshot({path:"test-results/asset-review/nature.png"});
 await writeFile("test-results/asset-review/report.json",JSON.stringify({readyMs,crossedX,scene:"nature",season:"winter",zoom:2,errors,stats},null,2)+"\n");console.log({readyMs,crossedX,stats,errors});
}finally{await browser?.close();server.kill()}
