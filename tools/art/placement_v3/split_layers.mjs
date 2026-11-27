// Export disjoint source-pixel layers. No runtime masks, no resampling.
// Preserve source canvas and every visible RGBA pixel. Hidden surfaces cannot be recovered.
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
export function splitSprite(im,spec){let {w,h,rgba}=im,layers=Object.fromEntries(spec.order.map(n=>[n,{w,h,rgba:new Uint8Array(rgba.length)}]));let fallback=spec.order.find(n=>!spec.polygons[n]);if(!fallback)throw Error("missing base");
for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=(y*w+x)*4;if(!rgba[p+3])continue;let layer=fallback;for(const n of spec.order)if(spec.polygons[n]?.some(poly=>inside(x+.5,y+.5,poly)))layer=n;
// For trees, let visible bark under the foliage boundary remain in trunk, but retain green foliage.
if(layer==="canopy"&&y>h*.62){let r=rgba[p],g=rgba[p+1],b=rgba[p+2];if(r>=g*.98&&r>b*1.12&&g>b*.94)layer="trunk";}
layers[layer].rgba.set(rgba.subarray(p,p+4),p);}
return layers}
export function verifySplit(im,layers){let counts={},total=0;for(let n of Object.keys(layers))counts[n]=0;for(let i=0;i<im.rgba.length;i+=4){let nonzero=Object.keys(layers).filter(n=>layers[n].rgba[i+3]);if(im.rgba[i+3]===0){if(nonzero.length)throw Error("transparent pixel introduced");continue}if(nonzero.length!==1)throw Error("pixel overlap or loss");let n=nonzero[0];counts[n]++;total++;for(let c=0;c<4;c++)if(layers[n].rgba[i+c]!==im.rgba[i+c])throw Error("RGBA mismatch");}if(Object.values(counts).some(n=>!n))throw Error("empty layer");return {counts,visiblePixels:total,exactVisibleRGBA:true,disjoint:true}}
