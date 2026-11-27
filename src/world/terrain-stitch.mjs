// Shared, deterministic raster autotiling. Global pixel coordinates, 32px logical cells.
// Pure data -> RGBA; independent of rendering engine and collision authority.
export const TILE=32;
export const Material=Object.freeze({Water:0,Sand:1,Grass:2,Forest:3,Hill:4,Wetland:5,Road:6});
export const texturePaths={
 water:"assets/source/environment/water_v3/water_deep.png",
 shallow:"assets/source/environment/water_v3/water_shallow.png",
 sand:"assets/candidates/environment_v1/sprites/sand_01.png",
 grass:"assets/source/environment/environment_v4/grass_patch_01.png",
 forest:"assets/source/environment/environment_v4/grass_patch_04.png",
 hill:"assets/source/environment/environment_v4/grass_patch_06.png",
 wetland:"assets/candidates/environment_v1/sprites/wetland_01.png",
 road:"assets/candidates/environment_v1/sprites/dirt_01.png"
};
const NAMES=["water","sand","grass","forest","hill","wetland","road"];
const BAND=8;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{let t=clamp((v-a)/(b-a));return t*t*(3-2*t)};
const mod=(v,n)=>((v%n)+n)%n;
function axis(p,band=BAND){let a=Math.floor(p/TILE),r=p-a*TILE;if(r<band)return [a-1,a,smooth(-band,band,r)];if(r>TILE-band)return [a,a+1,smooth(-band,band,r-TILE)];return [a,a,0]}
export function weightsAt(at,x,y,band=BAND){let [a,b,tx]=axis(x,band),[c,d,ty]=axis(y,band),w=new Float64Array(7);for(const [cx,cy,k] of [[a,c,(1-tx)*(1-ty)],[b,c,tx*(1-ty)],[a,d,(1-tx)*ty],[b,d,tx*ty]]){if(k){let id=at(cx,cy);if(!Number.isInteger(id)||id<0||id>=7)throw Error("unknown material "+id);w[id]+=k}}return w}
// Mirror repeats share edge samples exactly, including negative world coordinates.
function mirror(x,n){let m=mod(x,2*n);return m<n?m:2*n-1-m}
function texel(im,x,y){return (mirror(y,im.h)*im.w+mirror(x,im.w))*4}
function deepFactor(at,x,y){let cx=Math.floor(x/TILE),cy=Math.floor(y/TILE),min=Infinity;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(at(cx+dx,cy+dy)===0)continue;let l=(cx+dx)*TILE,t=(cy+dy)*TILE,ex=Math.max(l-x,0,x-(l+TILE)),ey=Math.max(t-y,0,y-(t+TILE));min=Math.min(min,ex*ex+ey*ey)}return smooth(4,27,Math.sqrt(min))}
function hash(x,y,seed){let h=(seed^Math.imul(x,0x9e3779b1)^Math.imul(y,0x85ebca77))|0;h=Math.imul(h^(h>>>16),0x7feb352d);return ((h^(h>>>15))>>>0)/4294967295}
function noise(x,y,seed){let a=Math.floor(x/12),b=Math.floor(y/12),u=smooth(0,1,x/12-a),v=smooth(0,1,y/12-b);return ((hash(a,b,seed)*(1-u)+hash(a+1,b,seed)*u)*(1-v)+(hash(a,b+1,seed)*(1-u)+hash(a+1,b+1,seed)*u)*v)*2-1}
export function renderRegion(at,textures,x0,y0,w,h,seed=0){
 if(![x0,y0,w,h,seed].every(Number.isSafeInteger)||w<=0||h<=0||w*h>4194304)throw Error("invalid raster region");
 for(const n of [...NAMES,"shallow"]){const im=textures[n];if(!im||im.w<=0||im.h<=0||im.rgba.length!==im.w*im.h*4)throw Error("missing texture "+n)}
 // Cache the global neighborhood including 2-cell water-depth halo. Not a chunk-local seed.
 let minX=Math.floor(x0/TILE)-2,minY=Math.floor(y0/TILE)-2,maxX=Math.floor((x0+w-1)/TILE)+2,maxY=Math.floor((y0+h-1)/TILE)+2,cols=maxX-minX+1,rows=maxY-minY+1,halo=new Uint8Array(cols*rows);
 for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){let id=at(x,y);if(!Number.isInteger(id)||id<0||id>=7)throw Error("unknown material "+id);halo[(y-minY)*cols+x-minX]=id}
 const read=(x,y)=>halo[(y-minY)*cols+x-minX],rgba=new Uint8Array(w*h*4);
 for(let iy=0;iy<h;iy++)for(let ix=0;ix<w;ix++){let x=x0+ix,y=y0+iy,px=x+.5,py=y+.5,ws=weightsAt(read,px,py),ww=weightsAt(read,px,py,TILE/2)[0],land=1-ws[0];
 let jitter=noise(px,py,seed)*.07;let water=smooth(.42+jitter,.58+jitter,ww);
 let bank=(1-water)*smooth(.03,.40,ww)*.56;
 let deep=water>0?deepFactor(read,px,py):0;
 let i=(iy*w+ix)*4,landRGB=[0,0,0];
 for(let m=1;m<7;m++){if(!ws[m])continue;let im=textures[NAMES[m]],p=texel(im,x,y);for(let c=0;c<3;c++)landRGB[c]+=im.rgba[p+c]*ws[m]/land}
 let sand=textures.sand,si=texel(sand,x,y),sh=textures.shallow,shi=texel(sh,x,y),wa=textures.water,wi=texel(wa,x,y);
 for(let c=0;c<3;c++){let dry=land>0?landRGB[c]*(1-bank)+sand.rgba[si+c]*bank:sand.rgba[si+c];let wet=sh.rgba[shi+c]*(1-deep)+wa.rgba[wi+c]*deep;rgba[i+c]=Math.round(dry*(1-water)+wet*water)}rgba[i+3]=255;
 }return {w,h,rgba}
}
// Roads are a rendering material override only on nonwater cells. Never modifies collision.
export function withRoads(terrainAt,isRoad){return (x,y)=>{let t=terrainAt(x,y);return t!==Material.Water&&isRoad(x,y)?Material.Road:t}}
