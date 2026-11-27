// Pure raster/geometry functions shared by asset build and tests.
export const TILE=32;
export const SEASONS=["spring","summer","autumn","winter"];
export const TREE_TYPES=["oak","pine","birch","willow"];
export const MATERIALS=["grass","dirt","wet_dirt","wetland","sand","forest","hill","stone","brick","yard","foundation","water"];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const mod=(v,n)=>((v%n)+n)%n;
export function hash(x,y,seed=2701){let h=seed^Math.imul(x,0x9e3779b1)^Math.imul(y,0x85ebca77);h=Math.imul(h^(h>>>16),0x7feb352d);return (h^(h>>>15))>>>0}
function axis(v,size,band){const c=Math.floor(v/size),r=v-c*size;if(r<band)return [c-1,c,smooth((r+band)/(2*band))];if(r>size-band)return [c,c+1,smooth((r-size+band)/(2*band))];return [c,c,0]}
function mirror(x,n){let p=mod(x,2*n);return p<n?p:2*n-1-p}
export function blank(w,h){return {w,h,rgba:new Uint8Array(w*h*4)}}
function offset(im,x,y){return (y*im.w+x)*4}
export function alphaBounds(im){let l=im.w,r=-1,t=im.h,b=-1;for(let y=0;y<im.h;y++)for(let x=0;x<im.w;x++)if(im.rgba[offset(im,x,y)+3]){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}if(r<l)throw Error("empty sprite");return {x:l,y:t,w:r-l+1,h:b-t+1}}
export function cleanSprite(im){const out=blank(im.w,im.h);out.rgba.set(im.rgba);let removed=0;for(let y=0;y<im.h;y++)for(let x=0;x<im.w;x++){const p=offset(im,x,y),a=im.rgba[p+3];if(!a){out.rgba.fill(0,p,p+4);continue}let neighbors=0;for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){if(!i&&!j)continue;const xx=x+i,yy=y+j;if(xx>=0&&yy>=0&&xx<im.w&&yy<im.h&&im.rgba[offset(im,xx,yy)+3])neighbors++}if(!neighbors){out.rgba.fill(0,p,p+4);removed++}else out.rgba[p+3]=255}return {image:out,removed}}
export function paste(dst,src,x,y){for(let j=0;j<src.h;j++)for(let i=0;i<src.w;i++){const xx=x+i,yy=y+j;if(xx<0||yy<0||xx>=dst.w||yy>=dst.h)continue;const p=offset(src,i,j);if(src.rgba[p+3])dst.rgba.set(src.rgba.subarray(p,p+4),offset(dst,xx,yy))}return dst}
function scaled(im,w,h){const b=alphaBounds(im),o=blank(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=offset(im,b.x+Math.min(b.w-1,Math.floor((x+.5)*b.w/w)),b.y+Math.min(b.h-1,Math.floor((y+.5)*b.h/h)));o.rgba.set(im.rgba.subarray(p,p+4),offset(o,x,y))}return o}
// Search a small set of uniform scaling/translation candidates against the approved full sprite.
// The foreground uses exact approved visible pixels, while the independent base supplies hidden pixels only.
export function alignParts(full,base,front,kind){
 const f=alphaBounds(full),b=alphaBounds(base),q=alphaBounds(front);
 const tree=kind==="tree",targetW=tree?f.w:Math.round(f.w*.86);
 let best=null;
 for(const k of [.82,.92,1,1.08,1.18]){
  const w=Math.max(1,Math.round(targetW*k)),h=Math.max(1,Math.round(q.h*w/q.w)),im=scaled(front,w,h);
  for(const dx of [-8,-4,0,4,8])for(const dy of [-5,0,5,10,15]){
   const x=Math.round(f.x+(f.w-w)/2)+dx,y=f.y+dy;let score=0,n=0;
   for(let j=0;j<h;j+=2)for(let i=0;i<w;i+=2){let p=offset(im,i,j);if(!im.rgba[p+3])continue;n++;let xx=x+i,yy=y+j;if(xx<0||xx>=full.w||yy<0||yy>=full.h){score+=4;continue}let u=offset(full,xx,yy);if(!full.rgba[u+3]){score+=4;continue}let d=0;for(let c=0;c<3;c++)d+=Math.abs(im.rgba[p+c]-full.rgba[u+c]);score+=d/255}
   if(n&&(!best||score/n<best.score))best={x,y,w,h,im,score:score/n};
  }
 }
 const alignedFront=paste(blank(full.w,full.h),best.im,best.x,best.y);
 const bw=Math.max(1,Math.round((tree?Math.min(f.w,b.w*f.h/b.h):f.w*.78))),bh=Math.max(1,Math.round(tree?f.h:f.h*.83));
 const alignedBase=paste(blank(full.w,full.h),scaled(base,bw,bh),Math.round(f.x+(f.w-bw)/2),f.y+f.h-bh);
 const back=blank(full.w,full.h),fore=blank(full.w,full.h);
 let overlap=0,frontPixels=0;
 for(let p=0;p<full.rgba.length;p+=4){if(!full.rgba[p+3])continue;
  if(alignedFront.rgba[p+3]){fore.rgba.set(full.rgba.subarray(p,p+4),p);frontPixels++;if(alignedBase.rgba[p+3]){back.rgba.set(alignedBase.rgba.subarray(p,p+4),p);overlap++}}
  else back.rgba.set(full.rgba.subarray(p,p+4),p);
 }
 if(!frontPixels)throw Error("empty registered foreground");
 return {back,fore,alignedBase,alignedFront,anchor:[Math.round(full.w/2),full.h],registration:{x:best.x,y:best.y,w:best.w,h:best.h,score:best.score,frontPixels,hiddenPixels:overlap}};
}
// World-coordinate sampling: smooth interpolation of four macro variants avoids per-tile discontinuities.
function texel(im,x,y,c){return im.rgba[offset(im,mirror(x,im.w),mirror(y,im.h))+c]}
function sample(textures,name,x,y,seed,out){
 let variants=textures[name];if(!variants?.length)throw Error("missing texture "+name);
 const [a,b,u]=axis(x+.5,96,32),[c,d,v]=axis(y+.5,96,32);
 for(const [gx,gy,k] of [[a,c,(1-u)*(1-v)],[b,c,u*(1-v)],[a,d,(1-u)*v],[b,d,u*v]]){
  if(!k)continue;const h=hash(gx,gy,seed),im=variants[h%variants.length],sx=x+((h>>>8)&63),sy=y+((h>>>16)&63);
  for(let j=0;j<3;j++)out[j]+=k*texel(im,sx,sy,j);
 }
}
export function renderTerrain(at,textures,x0,y0,w,h,seed=2701,waterField=null){
 const out=blank(w,h),land=[0,0,0],tmp=[0,0,0],wet=[0,0,0];const x1=Math.floor(x0/TILE)-1,y1=Math.floor(y0/TILE)-1,cols=Math.ceil((x0+w)/TILE)-x1+1,rows=Math.ceil((y0+h)/TILE)-y1+1,halo=Array.from({length:cols*rows},(_,i)=>at(x1+i%cols,y1+Math.floor(i/cols)));const read=(x,y)=>halo[(y-y1)*cols+x-x1];
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const x=x0+i,y=y0+j,[a,b,u]=axis(x+.5,TILE,12),[c,d,v]=axis(y+.5,TILE,12);
  land.fill(0);let weight=0,water=0;
  for(const [tx,ty,k] of [[a,c,(1-u)*(1-v)],[b,c,u*(1-v)],[a,d,(1-u)*v],[b,d,u*v]]){
   if(!k)continue;let m=read(tx,ty);if(m==="water"){water+=k;continue}tmp.fill(0);sample(textures,m,x,y,seed,tmp);for(let z=0;z<3;z++)land[z]+=tmp[z]*k;weight+=k;
  }
  if(!weight){sample(textures,"sand",x,y,seed,land);weight=1}
  if(waterField){const dist=waterField(x+.5,y+.5);water=1-smooth((dist+5)/10);const bank=(1-water)*(1-smooth((dist-2)/15));if(bank>0){tmp.fill(0);sample(textures,"sand",x,y,seed,tmp);for(let z=0;z<3;z++)land[z]=land[z]*(1-bank)+tmp[z]*weight*bank}}
  wet.fill(0);if(water){sample(textures,"water",x,y,seed,wet);if(waterField&&textures.shallow){const deep=smooth((-waterField(x+.5,y+.5)-3)/25);tmp.fill(0);sample(textures,"shallow",x,y,seed,tmp);for(let z=0;z<3;z++)wet[z]=wet[z]*deep+tmp[z]*(1-deep)}}
  const p=offset(out,i,j);for(let z=0;z<3;z++)out.rgba[p+z]=Math.round(land[z]/weight*(1-water)+wet[z]*water);out.rgba[p+3]=255;
 }
 return out;
}
export function makeLayout(scene="village",seed=2701){
 const width=48*32,height=32*32,riverCenter=y=>width/2+48*Math.sin(y/145)+25*Math.sin(y/71),half=48;
 const waterField=(x,y)=>Math.abs(x-riverCenter(y))-half;
 const bridges=[["wood",160],["stone",384],["rope",640],["garden",864]].map(([kind,y])=>{const center=riverCenter(y);return {kind,x:Math.floor((center-half-64)/32)*32,y,w:Math.ceil((half*2+160)/32)*32,h:64}});
 // Bridge portals are dry over the whole 64px deck width; deck rectangle is the only water override.
 const items=[],add=(id,x,y,type,extra={})=>items.push({id,x,y,type,...extra});
 const millX=Math.floor(riverCenter(555)-half-48),millRoadX=bridges[2].x-32;
 const buildings=scene==="village"?[
  {id:"cottage",x:240,y:310,doorX:240,roadY:384},
  {id:"shop",x:1120,y:325,doorX:1120,roadY:384},
  {id:"mill",x:millX,y:576,doorX:millX-32,roadY:640,wheelX:millX+50,wheelY:555,roadX:millRoadX},
  {id:"market",x:370,y:570,doorX:370,roadY:640},
  {id:"tower",x:1270,y:810,doorX:1270,roadY:864}
 ].map(b=>({...b,access:b.roadX===undefined?[[b.doorX,b.y+8],[b.doorX,b.roadY]]:[[b.doorX,b.y+8],[b.doorX,b.y+16],[b.roadX,b.y+16],[b.roadX,b.roadY]]})):[];
 const accessRoad=(x,y)=>buildings.some(b=>b.access.slice(1).some(([ex,ey],i)=>{const [sx,sy]=b.access[i];return x>=Math.min(sx,ex)-17&&x<=Math.max(sx,ex)+17&&y>=Math.min(sy,ey)-17&&y<=Math.max(sy,ey)+17}));
 const roads=(x,y)=>bridges.some(b=>Math.abs(y-b.y)<32)||Math.abs(x-416)<24||Math.abs(x-1120)<24||accessRoad(x,y);
 const at=(tx,ty)=>{const x=tx*32+16,y=ty*32+16;if(waterField(x,y)<0)return "water";if(roads(x,y))return scene==="village"?"stone":"dirt";if(waterField(x,y)<25)return "sand";if(scene==="village"){if(buildings.some(b=>Math.abs(x-b.x)<48&&y>=b.y-16&&y<=b.y+16))return "foundation";if(x>160&&x<320&&y>250&&y<460)return "yard";if(x>1120&&x<1344&&y>550&&y<720)return "brick";if(y>770&&x<400)return "dirt";return "grass"}if(x<480&&y<510)return "forest";if(x>1070&&y<500)return "hill";if(x<440&&y>620)return "wetland";return "grass"};
 if(scene==="village"){for(const b of buildings)add(b.id,b.x,b.y,"building",{doorX:b.doorX,roadY:b.roadY,access:b.access,wheelX:b.wheelX,wheelY:b.wheelY});for(let i=0;i<5;i++)add("fence",200+i*64,790,"fence");add("gate_closed",520,790,"gate");for(let i=0;i<4;i++)add("wall",1100+i*64,925,"fence");for(const [i,id] of ["barrel","flowers","box","notice","lamp","sign","flowerbed","bench","wood_steps","stone_steps","gate_stone","fence2","wall2"].entries())add(id,160+(i%5)*94,460+Math.floor(i/5)*205,"prop")}
 for(let y=100;y<height-40;y+=128)for(let x=90;x<width-50;x+=128){const n=hash(x,y,seed),xx=x+(n%23)-11,yy=y+((n>>>8)%23)-11;if(waterField(xx,yy)<105||roads(xx,yy)||items.some(o=>Math.hypot(o.x-xx,o.y-yy)<105))continue;if(scene==="village"&&n%3!==0)continue;add(TREE_TYPES[n%4],xx,yy,"tree")}
 const spawn={x:416,y:160};
 function blocked(x,y,open=false){if(x<10||y<10||x>width-10||y>height-10)return true;const onDeck=bridges.some(b=>x>=b.x&&x<=b.x+b.w&&Math.abs(y-b.y)<b.h/2-7);if(!onDeck&&[[-5,0],[5,0],[0,-5],[0,5],[0,0]].some(([dx,dy])=>waterField(x+dx,y+dy)<0))return true;if(bridges.some(b=>x>b.x+4&&x<b.x+b.w-4&&Math.abs(Math.abs(y-b.y)-b.h/2)<7))return true;return items.some(o=>o.type==="tree"?Math.abs(x-o.x)<12&&Math.abs(y-o.y)<11:o.type==="building"?Math.abs(x-o.x)<(o.id==="tower"?25:45)&&y>o.y-50&&y<o.y-5:o.type==="fence"||o.type==="gate"&&!open?Math.abs(x-o.x)<30&&Math.abs(y-o.y)<8:false)}
 return {width,height,bridges,items,spawn,at,waterField,blocked};
}
export function move(layout,x,y,dx,dy,open=false){let n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));for(let i=0;i<n;i++){const a=dx/n,b=dy/n;if(!layout.blocked(x+a,y,open))x+=a;if(!layout.blocked(x,y+b,open))y+=b}return {x,y}}
