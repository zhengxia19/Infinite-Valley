import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {approvedComponents} from "../tools/art/approved_components_v1/archive.mjs";
import {packSprites} from "../tools/art/approved_components_v1/atlas.mjs";
import {decodePNG} from "../tools/art/placement_v3/png.mjs";
import {blank,paste,cleanSprite,alignParts,renderTerrain,makeLayout,move,MATERIALS,SEASONS,TREE_TYPES} from "../src/world/asset-review-core.mjs";
const input=readFileSync(new URL("../tools/art/approved_components_v1/approved_review.html",import.meta.url));
const urls=JSON.parse(input.toString("utf8").match(/const sources=(\{[^\n]*?\});/)[1]);
const images={};let removed=0;
for(const [id,url] of Object.entries(urls)){const r=cleanSprite(decodePNG(Buffer.from(url.split(",")[1],"base64")));images[id]=r.image;removed+=r.removed}
const tex={};for(const name of MATERIALS)tex[name]=name==="water"?[decodePNG(readFileSync(new URL("../assets/source/environment/water_v3/water_deep.png",import.meta.url)))]:Object.keys(images).filter(id=>new RegExp("^"+name+"[0-9]$").test(id)).map(id=>images[id]);
tex.shallow=[decodePNG(readFileSync(new URL("../assets/source/environment/water_v3/water_shallow.png",import.meta.url)))];
test("immutable review archive: exact hash and 163 nonempty independent PNGs",()=>{assert.equal(createHash("sha256").update(input).digest("hex"),"9d41d52e73985f3fbfcef68c8a02f8c17cabcb0c4e7432e09ed1c877e73c10df");assert.equal(Object.keys(images).length,163);for(const [id,im] of Object.entries(images)){assert(im.rgba.some((v,i)=>i%4===3&&v===255),id);assert(im.rgba.every((v,i)=>i%4!==3||v===0||v===255),id)}assert.equal(removed,20)});
test("registered foreground and hidden base reconstruct the approved silhouette",()=>{let count=0,hidden=0;for(const id of ["cottage","shop","mill","market","tower",...TREE_TYPES.flatMap(k=>SEASONS.map(s=>k+"_"+s)).filter(k=>images[k+"_canopy"])]){const tree=!!images[id+"_trunk"],v=alignParts(images[id],images[id+(tree?"_trunk":"_base")],images[id+(tree?"_canopy":"_roof")],tree?"tree":"building");assert.deepEqual(paste(paste(blank(images[id].w,images[id].h),v.back,0,0),v.fore,0,0).rgba,images[id].rgba,id);assert(v.registration.hiddenPixels>0);hidden+=v.registration.hiddenPixels;count++}assert.equal(count,18);assert(hidden>0)});
test("pixel-identical partition boundaries on real textures across scenes and negative coordinates",()=>{let checked=0;for(const scene of ["village","nature"]){const l=makeLayout(scene);for(const [x,y] of [[704,128],[-64,-64],[960,960]]){const full=renderTerrain(l.at,tex,x,y,128,128,2701,l.waterField);for(let j=0;j<2;j++)for(let i=0;i<2;i++){const part=renderTerrain(l.at,tex,x+i*64,y+j*64,64,64,2701,l.waterField);for(let k=0;k<64;k++){assert.deepEqual(part.rgba.subarray(k*256,(k+1)*256),full.rgba.subarray(((j*64+k)*128+i*64)*4,((j*64+k)*128+i*64+64)*4));checked+=64}}}}assert.equal(checked,98304)});
test("bridge crossing, rails, water, gate and movement substeps",()=>{for(const scene of ["village","nature"]){const l=makeLayout(scene);assert(!l.blocked(l.spawn.x,l.spawn.y));for(const b of l.bridges){for(let x=b.x+8;x<=b.x+b.w-8;x+=4)assert(!l.blocked(x,b.y),scene+b.kind);assert(l.blocked(b.x+64,b.y+32));const p=move(l,b.x+8,b.y,b.w-16,0);assert(Math.abs(p.x-(b.x+b.w-8))<.01)}assert(l.blocked(768,275));const p=move(l,600,275,400,0);assert(p.x<768);if(scene==="village"){assert(l.blocked(520,790,false));assert(!l.blocked(520,790,true))}}});
test("terrain chunk raster timing (diagnostic, not browser FPS)",()=>{const l=makeLayout();let t=performance.now();let result=renderTerrain(l.at,tex,512,256,256,256,2701,l.waterField);assert.equal(result.rgba.length,256*256*4);console.log("256x256 raster ms:",Math.round(performance.now()-t))});

test("building access routes, mill bank and dry bridge portals",()=>{
 const l=makeLayout("village");
 const buildings=l.items.filter(o=>o.type==="building");assert.equal(buildings.length,5);
 for(const b of buildings){
  assert.deepEqual(b.access[0],[b.doorX,b.y+8]);
  for(let i=1;i<b.access.length;i++){
   const [x,y]=b.access[i-1],[ex,ey]=b.access[i],n=Math.ceil(Math.hypot(ex-x,ey-y)/4);
   for(let j=0;j<=n;j++){const xx=x+(ex-x)*j/n,yy=y+(ey-y)*j/n;assert(!l.blocked(xx,yy),b.id+" access blocked");assert.equal(l.at(Math.floor(xx/32),Math.floor(yy/32)),"stone",b.id+" access texture")}
   const p=move(l,x,y,ex-x,ey-y);assert(Math.hypot(p.x-ex,p.y-ey)<.01,b.id+" access unreachable");
  }
  assert.equal(b.access.at(-1)[1],b.roadY);
 }
 const mill=buildings.find(b=>b.id==="mill");
 assert(l.waterField(mill.wheelX,mill.wheelY)<=0,"wheel should contact river");
 assert(l.waterField(mill.x+40,mill.y-25)>=0,"building collision footprint must stay on dry land");
 for(const scene of ["village","nature"]){const a=makeLayout(scene);for(const b of a.bridges)for(let y=b.y-24;y<=b.y+24;y+=4)for(const x of [b.x+8,b.x+b.w-8])assert(a.waterField(x,y)>=0,b.kind+" wet portal")}
});

test("archived binary PNGs match the approved HTML source byte for byte",async()=>{
 const a=await approvedComponents(fileURLToPath(new URL("../",import.meta.url)));
 assert.equal(Object.keys(a.images).length,163);
 for(const [id,bytes] of Object.entries(a.images))assert(bytes.equals(Buffer.from(urls[id].split(",")[1],"base64")),id);
});
test("1024px atlas preserves every pixel, frame padding and nonoverlap",()=>{
 const atlas=packSprites(images);assert.equal(Object.keys(atlas.records).length,163);
 for(const p of atlas.pages){
  const used=new Uint8Array(1024*1024);
  for(const [id,{frame:f}] of Object.entries(p.frames)){
   assert(f.x>=2&&f.y>=2&&f.x+f.w+2<=1024&&f.y+f.h+2<=1024,id);const im=images[id];
   for(let j=-2;j<f.h+2;j++)for(let i=-2;i<f.w+2;i++){
    const n=(f.y+j)*1024+f.x+i;assert.equal(used[n],0,"overlap "+id);used[n]=1;
    const s=(Math.max(0,Math.min(f.h-1,j))*im.w+Math.max(0,Math.min(f.w-1,i)))*4;
    for(let c=0;c<4;c++)assert.equal(p.image.rgba[n*4+c],im.rgba[s+c],id);
   }
  }
 }
});

import {drawCrop} from "../assets/candidates/crops_v1/draw.mjs";
test("crop candidate source has 20 exact independent native-pixel frames in the village",()=>{
 const manifest=JSON.parse(readFileSync(new URL("../assets/candidates/crops_v1/manifest.json",import.meta.url),"utf8"));
 const sheet=decodePNG(readFileSync(new URL("../assets/candidates/crops_v1/crops.png",import.meta.url)));
 assert.equal(sheet.w,160);assert.equal(sheet.h,192);assert.equal(manifest.records.length,20);
 const l=makeLayout("village"),items=l.items.filter(o=>o.type==="crop");
 assert.equal(items.length,20);assert.equal(makeLayout("nature").items.filter(o=>o.type==="crop").length,0);
 const ids=new Set(),hashes=new Set();
 for(const f of manifest.records){assert(!ids.has(f.id));ids.add(f.id);const [,id,stage]=f.id.split("_");const im=drawCrop(id,Number(stage));assert.deepEqual(f.anchor,[16,48]);assert.equal(im.rgba.filter((v,i)=>i%4===3&&v===255).length,f.pixels);
 for(let y=0;y<48;y++){const p=((f.y+y)*sheet.w+f.x)*4;assert.deepEqual(sheet.rgba.subarray(p,p+128),im.rgba.subarray(y*128,y*128+128))}
 hashes.add(createHash("sha256").update(im.rgba).digest("hex"));const item=items.find(o=>o.id===f.id);assert(item);assert.equal(l.at(Math.floor(item.x/32),Math.floor((item.y-1)/32)),"dirt");assert(!l.blocked(item.x,item.y))}
 assert.equal(hashes.size,20);
});
