// Visible-pixel occlusion compositor. Each part is a separately loaded PNG.
// World rendering can consume the same ordered draw records; no runtime clipping.
export function blank(w,h,color=[0,0,0,0]){let rgba=new Uint8Array(w*h*4);for(let i=0;i<rgba.length;i+=4)rgba.set(color,i);return {w,h,rgba}}
export function over(dst,src,x,y){x=Math.round(x);y=Math.round(y);for(let j=Math.max(0,-y);j<Math.min(src.h,dst.h-y);j++)for(let i=Math.max(0,-x);i<Math.min(src.w,dst.w-x);i++){let a=(j*src.w+i)*4,b=((y+j)*dst.w+x+i)*4,sa=src.rgba[a+3]/255;if(!sa)continue;let da=dst.rgba[b+3]/255,oa=sa+da*(1-sa);for(let c=0;c<3;c++)dst.rgba[b+c]=Math.round((src.rgba[a+c]*sa+dst.rgba[b+c]*da*(1-sa))/oa);dst.rgba[b+3]=Math.round(oa*255)}return dst}
export function crop(src,x,y,w,h){let out=blank(w,h);for(let j=0;j<h;j++)out.rgba.set(src.rgba.subarray(((y+j)*src.w+x)*4,((y+j)*src.w+x+w)*4),j*w*4);return out}
export function orderedParts(parts,actor,position,mode){let [x,y]=position;const obj=(name)=>({image:parts[name],x:0,y:0,part:name}),a={image:actor,x,y,part:"actor"};
 if(parts.back_rail){if(mode==="on_bridge")return [obj("back_rail"),obj("deck"),a,obj("front_rail")];if(mode==="behind")return [a,obj("back_rail"),obj("deck"),obj("front_rail")];return [obj("back_rail"),obj("deck"),obj("front_rail"),a]}
 const names=parts.roof?["base","roof"]:["trunk","canopy"];if(mode==="behind")return [a,...names.map(obj)];return [...names.map(obj),a]
}
export function drawRecords(dst,records,offset=[0,0]){for(const r of records)over(dst,r.image,r.x+offset[0],r.y+offset[1]);return dst}
export function intersectionCount(a,b,x,y){let count=0;for(let j=Math.max(0,-y);j<Math.min(a.h,b.h-y);j++)for(let i=Math.max(0,-x);i<Math.min(a.w,b.w-x);i++)if(a.rgba[(j*a.w+i)*4+3]&&b.rgba[((j+y)*b.w+i+x)*4+3])count++;return count}
