import * as Phaser from "phaser";
import { CHUNK_SIZE,Terrain,ChunkCache,seedHash,hash,splitTile,previewSpawn,PREVIEW_SEED,type ChunkBase } from "../world/generator.ts";

const TILE=32,SIZE=CHUNK_SIZE*TILE;
const seed=seedHash(PREVIEW_SEED),cache=new ChunkCache(seed);
const palette=[0x46879a,0xc6a477,0x94b665,0x73994d,0xa6ad79,0x789f84];
const hud=document.getElementById("hud")!;
const keys:Record<string,string>={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right"};
const physical=new Set<string>(),touches=new Map<number,string>(),held=new Set<string>();
function syncInput(){
  held.clear();
  for(const code of physical)held.add(keys[code]);
  for(const direction of touches.values())held.add(direction);
}
window.addEventListener("keydown",e=>{if(keys[e.code]){e.preventDefault();physical.add(e.code);syncInput();}});
window.addEventListener("keyup",e=>{if(keys[e.code]){physical.delete(e.code);syncInput();}});
function clearInput(){physical.clear();touches.clear();syncInput();}
window.addEventListener("blur",clearInput);
document.addEventListener("visibilitychange",()=>{if(document.hidden)clearInput();});
for(const el of document.querySelectorAll<HTMLButtonElement>("[data-key]")){
  el.addEventListener("pointerdown",e=>{e.preventDefault();el.setPointerCapture(e.pointerId);touches.set(e.pointerId,el.dataset.key!);syncInput();});
  for(const event of ["pointerup","pointercancel","lostpointercapture"])el.addEventListener(event,e=>{touches.delete((e as PointerEvent).pointerId);syncInput();});
}
class Explore extends Phaser.Scene{
  private px=0;private py=0;private cx=Number.NaN;private cy=Number.NaN;
  private ground=new Map<string,Phaser.GameObjects.Graphics>();
  private props=new Map<string,Phaser.GameObjects.Graphics>();
  private player!:Phaser.GameObjects.Graphics;
  private ready=false;
  constructor(){super("explore");}
  create(){
    const spawn=previewSpawn(seed);
    if(!spawn){hud.textContent="技术预览：未找到可行出生点";return;}
    this.px=spawn.x;this.py=spawn.y;
    this.player=this.add.graphics();
    this.player.fillStyle(0x38563a,.35).fillEllipse(0,7,20,8);
    this.player.fillStyle(0x654c37).fillRect(-7,-6,14,15);
    this.player.fillStyle(0xe4be63).fillRect(-9,-18,18,9);
    this.player.fillStyle(0xf0d4a3).fillRect(-5,-9,10,8);
    this.refresh();this.ready=true;
  }
  private paint(c:ChunkBase){
    const g=this.add.graphics().setDepth(0);
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){
      const i=y*32+x,t=c.terrain[i],sx=x*TILE,sy=y*TILE,v=hash(seed,c.cx*32+x,c.cy*32+y,101)%7;
      g.fillStyle(palette[t]).fillRect(sx,sy,TILE,TILE);
      if(t===Terrain.Water){
        if(v===0)g.fillStyle(0x8dc6c8,.6).fillRect(sx+4,sy+12,14,2);
        const m=c.edges[i];g.fillStyle(0x8dc6c8);
        if(!(m&1))g.fillRect(sx,sy,32,3);
        if(!(m&2))g.fillRect(sx+29,sy,3,32);
        if(!(m&4))g.fillRect(sx,sy+29,32,3);
        if(!(m&8))g.fillRect(sx,sy,3,32);
      }else{
        if(v<3)g.fillStyle(t===Terrain.Sand?0xe2cca3:0xb8c981,.65).fillRect(sx+5+v*6,sy+7,3,3);
        if(v===4&&t!==Terrain.Sand)g.fillStyle(0x537a42,.65).fillRect(sx+22,sy+21,3,5);
      }
    }
    return g;
  }
  private paintResource(kind:"tree"|"stone"){
    const g=this.add.graphics();
    if(kind==="tree"){
      g.fillStyle(0x38563a,.25).fillEllipse(5,5,37,13);
      g.fillStyle(0x654c37).fillRect(-4,-18,8,20);
      g.fillStyle(0x38563a).fillRect(-19,-47,38,30);
      g.fillStyle(0x537a42).fillRect(-24,-39,47,18);
      g.fillStyle(0x73994d).fillRect(-17,-51,26,25);
      g.fillStyle(0x94b665).fillRect(-12,-49,15,7);
    }else{
      g.fillStyle(0x716a59).fillRect(-12,-10,24,15);
      g.fillStyle(0xa8a18c).fillRect(-9,-14,17,9);
    }
    return g;
  }
  private refresh(){
    const cx=splitTile(Math.floor(this.px)).chunk,cy=splitTile(Math.floor(this.py)).chunk;
    if(cx===this.cx&&cy===this.cy)return;
    this.cx=cx;this.cy=cy;cache.update(cx,cy);
    const keep=new Set<string>(),entities=new Set<string>();
    for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++){
      const key=x+","+y,c=cache.chunks.get(key);
      if(!c)continue;
      keep.add(key);
      let g=this.ground.get(key);
      if(!g){g=this.paint(c);this.ground.set(key,g);}
      g.setPosition((x-cx)*SIZE,(y-cy)*SIZE);
      for(const e of c.staticEntities){
        entities.add(e.id);
        let p=this.props.get(e.id);
        if(!p){p=this.paintResource(e.kind);this.props.set(e.id,p);}
        const ly=(e.y+.5-cy*32)*TILE;
        p.setPosition((e.x+.5-cx*32)*TILE,ly).setDepth(2048+ly);
      }
    }
    for(const [key,g] of this.ground)if(!keep.has(key)){g.destroy();this.ground.delete(key);}
    for(const [key,g] of this.props)if(!entities.has(key)){g.destroy();this.props.delete(key);}
  }
  update(_time:number,delta:number){
    if(!this.ready)return;
    let dx=Number(held.has("right"))-Number(held.has("left")),dy=Number(held.has("down"))-Number(held.has("up"));
    const length=Math.hypot(dx,dy);
    if(length){
      const step=Math.min(delta,50)/1000*4/length;dx*=step;dy*=step;
      // 只读探索预览。正式世界的移动必须由服务器验证。
      // 对角移动不穿越两个不可行的正交邻格。
      if(dx&&dy&&(!cache.walkable(this.px+dx,this.py)||!cache.walkable(this.px,this.py+dy))){
        if(cache.walkable(this.px+dx,this.py))this.px+=dx;
        else if(cache.walkable(this.px,this.py+dy))this.py+=dy;
      }else{
        if(cache.walkable(this.px+dx,this.py))this.px+=dx;
        if(cache.walkable(this.px,this.py+dy))this.py+=dy;
      }
    }
    this.refresh();
    const x=(this.px-this.cx*32)*TILE,y=(this.py-this.cy*32)*TILE;
    this.player.setPosition(Math.round(x),Math.round(y)).setDepth(2048+y);
    this.cameras.main.centerOn(Math.round(x),Math.round(y));
    hud.textContent="开放世界技术预览（非正式世界）\n坐标 "+Math.floor(this.px)+", "+Math.floor(this.py)+"  ·  区块 "+cache.chunks.size+"/25\nWASD / 方向键 / 触屏";
  }
}
if(new URLSearchParams(location.search).get("review")==="1"){
  import("./asset-review.ts").then(m=>m.startAssetReview(held)).catch(e=>{hud.textContent="素材验收预览启动失败："+String(e)});
}else new Phaser.Game({type:Phaser.AUTO,parent:"game",width:960,height:640,backgroundColor:"#38563a",pixelArt:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Explore]});
