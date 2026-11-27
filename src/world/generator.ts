// Deterministic base terrain; no renderer, player save or mutable world state.
export const CHUNK_SIZE = 32;
export const REGION_SIZE = 512;
export const LIMIT = 1_000_000;
export const GENERATOR_VERSION = "prototype-0.1";
export const PREVIEW_SEED = "infinite-valley-preview-v1";
export const Terrain = { Water:0, Sand:1, Grass:2, Forest:3, Hill:4, Wetland:5 } as const;
export type Resource = {id:string; x:number; y:number; kind:"tree"|"stone"};
export type ChunkBase = {generatorVersion:string; cx:number; cy:number; terrain:Uint16Array; flags:Uint8Array; biome:Uint8Array; edges:Uint8Array; staticEntities:Resource[]};
export function splitTile(n: number) {
  if(!Number.isSafeInteger(n)) throw new RangeError("invalid tile");
  const chunk=Math.floor(n/32);
  return {chunk,local:n-chunk*32};
}
export function seedHash(seed: string): number {
  let h=2166136261;
  const encoded=encodeURIComponent(seed.normalize("NFC"));
  for(let i=0;i<encoded.length;i++){
    const escaped=encoded[i]==="%";
    const byte=escaped?parseInt(encoded.slice(i+1,i+3),16):encoded.charCodeAt(i);
    if(escaped)i+=2;
    h=Math.imul(h^byte,16777619);
  }
  return h>>>0;
}
export function hash(seed: number,x: number,y: number,salt: number): number {
  let h=seed^Math.imul(x,0x9e3779b1)^Math.imul(y,0x85ebca77)^Math.imul(salt,0xc2b2ae3d);
  h=Math.imul(h^(h>>>16),0x7feb352d);
  h=Math.imul(h^(h>>>15),0x846ca68b);
  return (h^(h>>>16))>>>0;
}
const G=[[1,0],[-1,0],[0,1],[0,-1],[.7071067811865476,.7071067811865476],[-.7071067811865476,.7071067811865476],[.7071067811865476,-.7071067811865476],[-.7071067811865476,-.7071067811865476]];
const F2=.3660254037844386,G2=.21132486540518713;
function dot(seed: number,i: number,j: number,x: number,y: number,salt: number): number {
  const t=.5-x*x-y*y;
  if(t<=0)return 0;
  const g=G[hash(seed,i,j,salt)&7];
  return t*t*t*t*(g[0]*x+g[1]*y);
}
function simplex(seed: number,x: number,y: number,salt: number): number {
  const s=(x+y)*F2,i=Math.floor(x+s),j=Math.floor(y+s),u=(i+j)*G2;
  const a=x-i+u,b=y-j+u,i1=a>b?1:0,j1=1-i1;
  return 70*(dot(seed,i,j,a,b,salt)+dot(seed,i+i1,j+j1,a-i1+G2,b-j1+G2,salt)+dot(seed,i+1,j+1,a-1+2*G2,b-1+2*G2,salt));
}
function field(seed: number,x: number,y: number,salt: number): number {
  let sum=0,w=1,scale=1024;
  for(let k=0;k<4;k++){sum+=w*simplex(seed,x/scale,y/scale,salt+k);w/=2;scale/=4;}
  return Math.round(sum/1.875*10000);
}
export function terrainAt(seed: number,x: number,y: number): number {
  if(Math.abs(x)>LIMIT||Math.abs(y)>LIMIT)return Terrain.Water;
  const h=field(seed,x,y,1),m=field(seed,x,y,20),t=field(seed,x,y,40);
  if(h < -1900)return Terrain.Water;
  if(h < -1450)return Terrain.Sand;
  if(h < -900 && m>1100)return Terrain.Wetland;
  if(h>2600)return Terrain.Hill;
  return m+t*.18>500?Terrain.Forest:Terrain.Grass;
}
export function resourceAt(seed: number,x: number,y: number,t: number): Resource|null {
  if(t!==Terrain.Grass&&t!==Terrain.Forest&&t!==Terrain.Hill)return null;
  const gx=Math.floor(x/5),gy=Math.floor(y/5),h=hash(seed,gx,gy,90);
  if(x!==gx*5+1+h%3||y!==gy*5+1+((h>>>8)%3))return null;
  const roll=(h>>>16)%100;
  if((t===Terrain.Forest&&roll<92)||(t===Terrain.Grass&&roll<25))
    return {id:GENERATOR_VERSION+":"+seed+":tree:"+x+":"+y,x,y,kind:"tree"};
  if((t===Terrain.Hill&&roll<75)||(t===Terrain.Grass&&roll>=25&&roll<32))
    return {id:GENERATOR_VERSION+":"+seed+":stone:"+x+":"+y,x,y,kind:"stone"};
  return null;
}
export function generateChunk(seed: number,cx: number,cy: number): ChunkBase {
  if(![cx,cy].every(Number.isSafeInteger)||Math.abs(cx)>Math.ceil(LIMIT/32)||Math.abs(cy)>Math.ceil(LIMIT/32))throw new RangeError("chunk out of bounds");
  const terrain=new Uint16Array(1024),flags=new Uint8Array(1024),biome=new Uint8Array(1024),edges=new Uint8Array(1024);
  const staticEntities: Resource[]=[];
  const halo=new Uint8Array(34*34);
  for(let j=0;j<34;j++)for(let i=0;i<34;i++)halo[j*34+i]=terrainAt(seed,cx*32+i-1,cy*32+j-1);
  for(let j=0;j<32;j++)for(let i=0;i<32;i++){
    const idx=j*32+i,a=(j+1)*34+i+1,t=halo[a];
    terrain[idx]=t;biome[idx]=t===Terrain.Water?Terrain.Wetland:t;
    const n=halo[a-34]===t,e=halo[a+1]===t,s=halo[a+34]===t,w=halo[a-1]===t;
    edges[idx]=(n?1:0)|(e?2:0)|(s?4:0)|(w?8:0)|(n&&e&&halo[a-33]===t?16:0)|(e&&s&&halo[a+35]===t?32:0)|(s&&w&&halo[a+33]===t?64:0)|(w&&n&&halo[a-35]===t?128:0);
    const r=resourceAt(seed,cx*32+i,cy*32+j,t);
    if(r)staticEntities.push(r);
    flags[idx]=t===Terrain.Water||r?1:0;
  }
  return {generatorVersion:GENERATOR_VERSION,cx,cy,terrain,flags,biome,edges,staticEntities};
}
export class ChunkCache {
  readonly seed: number;
  readonly chunks=new Map<string,ChunkBase>();
  constructor(seed: number){this.seed=seed;}
  update(cx: number,cy: number){
    const keep=new Set<string>();
    for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++){
      if(Math.abs(x)>Math.ceil(LIMIT/32)||Math.abs(y)>Math.ceil(LIMIT/32))continue;
      const key=x+","+y;keep.add(key);
      if(!this.chunks.has(key))this.chunks.set(key,generateChunk(this.seed,x,y));
    }
    for(const key of this.chunks.keys())if(!keep.has(key))this.chunks.delete(key);
  }
  walkable(x: number,y: number): boolean{
    const a=splitTile(Math.floor(x)),b=splitTile(Math.floor(y));
    const c=this.chunks.get(a.chunk+","+b.chunk);
    return !!c&&!c.flags[b.local*32+a.local];
  }
}
export function previewSpawn(seed: number){
  for(let r=0;r<=256;r+=8)for(let y=-r;y<=r;y+=8)for(let x=-r;x<=r;x+=8){
    if(Math.max(Math.abs(x),Math.abs(y))!==r)continue;
    let clear=true;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const t=terrainAt(seed,x+dx,y+dy);
      if(t!==Terrain.Grass||resourceAt(seed,x+dx,y+dy,t))clear=false;
    }
    if(clear)return {x:x+.5,y:y+.5};
  }
  return null;
}
