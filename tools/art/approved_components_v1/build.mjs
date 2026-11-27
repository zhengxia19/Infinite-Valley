import {readFile,mkdir,writeFile,copyFile,rm} from "node:fs/promises";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
import {deflateSync} from "node:zlib";
import {decodePNG} from "../placement_v3/png.mjs";
import {cleanSprite,alignParts,paste,blank,renderTerrain,makeLayout,MATERIALS,TREE_TYPES,SEASONS} from "../../../src/world/asset-review-core.mjs";
import {approvedComponents} from "./archive.mjs";
import {packSprites} from "./atlas.mjs";
const root=resolve(process.argv[2]||"."),dir=join(root,"public/asset-review");
const sha=x=>createHash("sha256").update(x).digest("hex");
const {sha:sourceSHA256,images:source}=await approvedComponents(root);
await rm(dir,{recursive:true,force:true});await mkdir(join(dir,"atlas"),{recursive:true});await mkdir(join(dir,"terrain"),{recursive:true});
const crcTable=Array.from({length:256},(_,n)=>{for(let j=0;j<8;j++)n=(n>>>1)^((n&1)?0xedb88320:0);return n>>>0});
function chunk(type,buf){const tag=Buffer.from(type),payload=Buffer.concat([tag,buf]),head=Buffer.alloc(4),tail=Buffer.alloc(4);head.writeUInt32BE(buf.length);let crc=0xffffffff;for(const b of payload)crc=(crc>>>8)^crcTable[(crc^b)&255];tail.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([head,payload,tail])}
function png(im){const header=Buffer.alloc(13);header.writeUInt32BE(im.w,0);header.writeUInt32BE(im.h,4);header[8]=8;header[9]=6;const stride=im.w*4,raw=Buffer.alloc((stride+1)*im.h);for(let y=0;y<im.h;y++)raw.set(im.rgba.subarray(y*stride,(y+1)*stride),y*(stride+1)+1);return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",header),chunk("IDAT",deflateSync(raw)),chunk("IEND",Buffer.alloc(0))])}
const ims={},records={},removed={},sprites={};
async function writeSprite(id,im){const bytes=png(im);const again=decodePNG(bytes);if(!again.rgba.every((v,i)=>v===im.rgba[i]))throw Error("PNG roundtrip "+id);sprites[id]=im;records[id]={w:im.w,h:im.h,anchor:[Math.round(im.w/2),im.h],sha256:sha(bytes)}}
for(const [id,bytes] of Object.entries(source)){const c=cleanSprite(decodePNG(bytes));ims[id]=c.image;removed[id]=c.removed;await writeSprite(id,c.image);records[id].sourceSHA256=sha(bytes)}
const registrations={};for(const id of ["cottage","shop","mill","market","tower",...TREE_TYPES.flatMap(k=>SEASONS.map(s=>k+"_"+s)).filter(k=>ims[k+"_canopy"])]){const tree=!!ims[id+"_trunk"],v=alignParts(ims[id],ims[id+(tree?"_trunk":"_base")],ims[id+(tree?"_canopy":"_roof")],tree?"tree":"building");const merged=paste(paste(blank(ims[id].w,ims[id].h),v.back,0,0),v.fore,0,0);if(!merged.rgba.every((x,i)=>x===ims[id].rgba[i]))throw Error("composite changed "+id);await writeSprite(id+"_lower",v.back);await writeSprite(id+"_upper",v.fore);registrations[id]=v.registration}
const cropDir=join(root,"assets/candidates/crops_v1");
const cropManifest=JSON.parse(await readFile(join(cropDir,"manifest.json"),"utf8"));
const cropBytes=await readFile(join(cropDir,"crops.png")),cropSheet=decodePNG(cropBytes);
for(const f of cropManifest.records){const im=blank(f.w,f.h);for(let y=0;y<f.h;y++){const p=((f.y+y)*cropSheet.w+f.x)*4;im.rgba.set(cropSheet.rgba.subarray(p,p+f.w*4),y*f.w*4)}await writeSprite(f.id,im);records[f.id].sourceSHA256=sha(cropBytes)}
const packed=packSprites(sprites);for(const page of packed.pages){const bytes=png(page.image);await writeFile(join(dir,"atlas",page.id+".png"),bytes);await writeFile(join(dir,"atlas",page.id+".json"),JSON.stringify({frames:page.frames,meta:{image:page.id+".png",size:{w:1024,h:1024},scale:"1"}}));}for(const [id,frame] of Object.entries(packed.records))Object.assign(records[id],frame);
const waterPath=join(root,"assets/source/environment/water_v3/water_deep.png");
const shallowPath=join(root,"assets/source/environment/water_v3/water_shallow.png");
const water=decodePNG(await readFile(waterPath)),shallow=decodePNG(await readFile(shallowPath));
const textures={};for(const name of MATERIALS)textures[name]=name==="water"?[water]:Object.keys(ims).filter(id=>new RegExp("^"+name+"[0-9]$").test(id)).map(id=>ims[id]);
textures.shallow=[shallow];
const layouts={};for(const scene of ["village","nature"]){const l=makeLayout(scene);const chunks=[];for(let y=0;y<l.height;y+=256)for(let x=0;x<l.width;x+=256){const w=Math.min(256,l.width-x),h=Math.min(256,l.height-y),id=scene+"_"+x+"_"+y,im=renderTerrain(l.at,textures,x,y,w,h,2701,l.waterField);const bytes=png(im);await writeFile(join(dir,"terrain",id+".png"),bytes);chunks.push({id,x,y,w,h,sha256:sha(bytes)})}layouts[scene]={width:l.width,height:l.height,items:l.items,bridges:l.bridges,spawn:l.spawn,chunks}}
await copyFile(join(root,"assets/source/characters/character_v2/male/default.png"),join(dir,"actor.png"));
const manifest={cropBatch:cropManifest.batch,cropCount:cropManifest.records.length,sourceSHA256,atlasPages:packed.pages.map(p=>p.id),sourceCount:Object.keys(source).length,records,registrations,removedPixels:Object.values(removed).reduce((a,b)=>a+b,0),layouts,seed:2701,limitations:["隐藏面为独立原稿近似配准，未完成人工精修","当前为固定验收场景，不是共享世界"]};
await writeFile(join(dir,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log(JSON.stringify({source:manifest.sourceCount,refined:Object.keys(records).length,registered:Object.keys(registrations).length,atlasPages:packed.pages.length,removed:manifest.removedPixels,chunks:Object.values(layouts).reduce((n,l)=>n+l.chunks.length,0)}));
