import {blank} from "../../../src/world/asset-review-core.mjs";
// 1024px atlas pages, 2px extruded padding. No rescaling or rotation.
export function packSprites(images,size=1024,pad=2){
 const pages=[],records={};let page,x,y,row;
 function next(){page={id:"sprites_"+pages.length,image:blank(size,size),frames:{}};pages.push(page);x=pad;y=pad;row=0}
 next();
 for(const [id,im] of Object.entries(images).sort((a,b)=>b[1].h-a[1].h||b[1].w-a[1].w||a[0].localeCompare(b[0]))){
  const w=im.w,h=im.h;if(w+2*pad>size||h+2*pad>size)throw Error("oversize sprite "+id);
  if(x+w+pad>size){x=pad;y+=row+2*pad;row=0}
  if(y+h+pad>size)next();
  for(let j=-pad;j<h+pad;j++)for(let i=-pad;i<w+pad;i++){
   const sx=Math.max(0,Math.min(w-1,i)),sy=Math.max(0,Math.min(h-1,j)),s=(sy*w+sx)*4,d=((y+j)*size+x+i)*4;
   page.image.rgba.set(im.rgba.subarray(s,s+4),d);
  }
  page.frames[id]={frame:{x,y,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};
  records[id]={page:page.id,frame:id};x+=w+2*pad;row=Math.max(row,h);
 }
 return {pages,records};
}
