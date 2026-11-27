import * as Phaser from "phaser";
import {makeLayout,move,SEASONS,type Layout,type Item} from "../world/asset-review-core.mjs";
type Meta={w:number;h:number;anchor:[number,number];page:string;frame:string};
type Chunk={id:string;x:number;y:number;w:number;h:number};
type Manifest={cropBatch:string;cropCount:number;sourceCount:number;atlasPages:string[];records:Record<string,Meta>;registrations:Record<string,unknown>;layouts:Record<string,{chunks:Chunk[]}>;seed:number};
const url=(path:string)=>new URL("asset-review/"+path,document.baseURI).href;
const hud=document.getElementById("hud")!;
export async function startAssetReview(held:Set<string>){
 const response=await fetch(url("manifest.json"));
 if(!response.ok)throw Error("资产构建产物缺失，请先运行 npm run assets:review");
 const manifest:Manifest=await response.json();
 if(manifest.sourceCount!==163)throw Error("素材清单不完整");
 const controls=document.createElement("div");
 controls.style.cssText="position:fixed;top:12px;right:12px;display:flex;flex-wrap:wrap;gap:6px;max-width:60vw;z-index:5";
 const select=(name:string,values:string[][])=>{const e=document.createElement("select");e.setAttribute("aria-label",name);e.style.cssText="background:#263b30;color:#f0e6c9;padding:7px;border:1px solid #a9ba8b";for(const [value,label] of values){const o=document.createElement("option");o.value=value;o.textContent=label;e.append(o)}controls.append(e);return e};
 const scene=select("场景",[["village","田园村庄"],["nature","自然生态"]]);
 const season=select("季节",SEASONS.map((s,i)=>[s,["春季","夏季","秋季","冬季"][i]]));season.value="summer";
 const zoom=select("缩放",[["1","1×"],["2","2×"],["3","3×"]]);
 const gate=document.createElement("button");gate.textContent="开启围栏门";gate.style.fontSize="14px";controls.append(gate);
 const farm=document.createElement("button");farm.textContent="查看农田样片";farm.style.fontSize="14px";controls.append(farm);
 const reset=document.createElement("button");reset.textContent="回到起点";reset.style.fontSize="14px";controls.append(reset);
 document.body.append(controls);
 class Review extends Phaser.Scene{
  private layout!:Layout;private px=0;private py=0;private open=false;private player!:Phaser.GameObjects.Sprite;
  private props:{item:Item;lower:Phaser.GameObjects.Image;upper?:Phaser.GameObjects.Image}[]=[];
  private layerObjects:Phaser.GameObjects.GameObject[]=[];
  private frameTime=0;private direction=0;private moving=false;private target:{x:number;y:number}|null=null;
  private initialized=false;
  constructor(){super("asset-review")}
  preload(){
   for(const id of manifest.atlasPages)this.load.atlas(id,url("atlas/"+id+".png"),url("atlas/"+id+".json"));
   for(const data of Object.values(manifest.layouts))for(const c of data.chunks)this.load.image(c.id,url("terrain/"+c.id+".png"));
   this.load.spritesheet("approved-actor",url("actor.png"),{frameWidth:48,frameHeight:64});
   this.load.on("loaderror",(file:{key:string})=>{hud.textContent="素材加载失败："+file.key;this.initialized=false});
  }
  private image(id:string,x:number,y:number,depth:number,originY=1){
   const m=manifest.records[id];if(!m)throw Error("missing sprite "+id);
   const obj=this.add.image(Math.round(x),Math.round(y),m.page,m.frame).setOrigin(.5,originY).setDepth(depth);
   this.layerObjects.push(obj);return obj;
  }
  private makeProp(item:Item){
   const id=item.type==="tree"?item.id+"_"+season.value:item.id;
   const layered=!!manifest.registrations[id],lower=this.image(layered?id+"_lower":id,item.x,item.y,item.y);
   const upper=layered?this.image(id+"_upper",item.x,item.y,item.y+.25):undefined;
   this.props.push({item,lower,upper});
  }
  private build(){
   for(const o of this.layerObjects)o.destroy();this.layerObjects=[];this.props=[];
   this.layout=makeLayout(scene.value,manifest.seed);this.target=null;this.open=false;gate.textContent="开启围栏门";
   for(const c of manifest.layouts[scene.value].chunks){const o=this.add.image(c.x,c.y,c.id).setOrigin(0).setDepth(-10000);this.layerObjects.push(o)}
   for(const b of this.layout.bridges){
    for(let x=b.x;x<b.x+b.w;x+=64)this.image(b.kind+"_pier",x+32,b.y+34,-30);
    for(let x=b.x;x<b.x+b.w;x+=32)for(let y=b.y-32;y<b.y+32;y+=32)this.image(b.kind+"_deck",x+16,y+32,-20);
    for(let x=b.x;x<b.x+b.w;x+=64){this.image(b.kind+"_rail",x+32,b.y-25,b.y-33);this.image(b.kind+"_rail",x+32,b.y+36,b.y+32)}
   }
   for(const item of this.layout.items)this.makeProp(item);
   this.cameras.main.setBounds(0,0,this.layout.width,this.layout.height);this.resetPosition();
  }
  private resetPosition(){this.px=this.layout.spawn.x;this.py=this.layout.spawn.y;this.target=null;this.cameras.main.centerOn(this.px,this.py)}
  create(){
   if(!Object.values(manifest.records).every(m=>this.textures.exists(m.page)&&this.textures.get(m.page).has(m.frame))||!this.textures.exists("approved-actor")||!Object.values(manifest.layouts).every(l=>l.chunks.every(c=>this.textures.exists(c.id)))){hud.textContent="实际素材加载不完整";return}
   this.player=this.add.sprite(0,0,"approved-actor",0).setOrigin(.5,61/64);
   this.build();this.initialized=true;hud.dataset.reviewReady="true";
   scene.onchange=()=>this.build();season.onchange=()=>{for(const p of this.props){if(p.item.type!=="tree")continue;const id=p.item.id+"_"+season.value,layered=!!manifest.registrations[id];const m=manifest.records[layered?id+"_lower":id];p.lower.setTexture(m.page,m.frame);if(p.upper){this.layerObjects=this.layerObjects.filter(o=>o!==p.upper);p.upper.destroy()}p.upper=layered?this.image(id+"_upper",p.item.x,p.item.y,p.item.y+.25):undefined}};
   zoom.onchange=()=>this.cameras.main.setZoom(Number(zoom.value));
   gate.onclick=()=>{this.open=!this.open;gate.textContent=this.open?"关闭围栏门":"开启围栏门";for(const p of this.props)if(p.item.type==="gate"){const m=manifest.records[this.open?"gate_open":"gate_closed"];p.lower.setTexture(m.page,m.frame)}};
   reset.onclick=()=>this.resetPosition();
   farm.onclick=()=>{if(scene.value!=="village"){scene.value="village";this.build()}this.px=224;this.py=200;this.target=null;this.cameras.main.centerOn(this.px,this.py)};
   this.input.on("pointerdown",(pointer:Phaser.Input.Pointer)=>{const p=this.cameras.main.getWorldPoint(pointer.x,pointer.y);this.target={x:p.x,y:p.y}});
  }
  update(_time:number,delta:number){
   if(!this.initialized)return;
   let dx=Number(held.has("right"))-Number(held.has("left")),dy=Number(held.has("down"))-Number(held.has("up"));
   if(dx||dy)this.target=null;
   else if(this.target){const x=this.target.x-this.px,y=this.target.y-this.py,d=Math.hypot(x,y);if(d<3)this.target=null;else{dx=x/d;dy=y/d}}
   const len=Math.hypot(dx,dy),step=Math.min(delta,50)*.12;
   const oldX=this.px,oldY=this.py;
   if(len){const p=move(this.layout,this.px,this.py,dx/len*step,dy/len*step,this.open);this.px=p.x;this.py=p.y;if(Math.abs(dx)>Math.abs(dy))this.direction=dx<0?2:3;else this.direction=dy<0?1:0}
   this.moving=Math.hypot(this.px-oldX,this.py-oldY)>.01;
   this.frameTime+=Math.min(delta,50);const f=this.moving?4+Math.floor(this.frameTime/110)%8:Math.floor(this.frameTime/240)%4;
   this.player.setFrame(this.direction*12+f).setPosition(Math.round(this.px),Math.round(this.py)).setDepth(this.py+.1);
   for(const p of this.props){if(!p.upper)continue;const near=this.py<p.item.y&&this.py>p.item.y-p.upper.height&&Math.abs(this.px-p.item.x)<p.upper.width/2; p.upper.setAlpha(near?.45:1)}
   this.cameras.main.centerOn(Math.round(this.px),Math.round(this.py));
   hud.dataset.cropCount=String(this.props.filter(p=>p.item.type==="crop").length);hud.dataset.scene=scene.value;hud.dataset.season=season.value;hud.dataset.x=String(this.px);hud.dataset.y=String(this.py);hud.dataset.gate=String(this.open);hud.dataset.zoom=zoom.value;hud.dataset.frame=String(this.direction*12+f);hud.dataset.occluded=String(this.props.filter(p=>p.upper&&p.upper.alpha<1).length);
   hud.textContent="环境素材 Phaser 验收预览（非正式世界）\n"+scene.value+" · "+season.value+" · "+manifest.sourceCount+" 个环境源组件 · "+manifest.cropCount+" 个作物候选\n农田自上而下：萝卜、黄瓜、胡萝卜、菠菜；从左至右五阶段\n坐标 "+Math.round(this.px)+", "+Math.round(this.py)+" · WASD / 方向键 / 触屏";
  }
 }
 return new Phaser.Game({type:Phaser.AUTO,parent:"game",width:960,height:640,backgroundColor:"#38563a",pixelArt:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[Review]});
}
