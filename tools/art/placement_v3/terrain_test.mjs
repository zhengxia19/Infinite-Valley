// Exhaustively exercise every 2x2 multi-material junction and every binary 8-neighbor mask.
export function verifyTerrain(api,textures){
 const {weightsAt,renderRegion,Material,withRoads}=api,assert=(v,msg)=>{if(!v)throw Error(msg)},equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 let junctions=0,maskTests=0;
 for(let k=0;k<7**4;k++){let n=k,cells=[];for(let i=0;i<4;i++){cells.push(n%7);n=Math.floor(n/7)}const at=(x,y)=>cells[(y===1?2:0)+(x===1?1:0)];
 let w=weightsAt(at,32,32);assert(Math.abs(w.reduce((a,b)=>a+b,0)-1)<1e-12,"weight sum");for(let m=0;m<7;m++)assert(w[m]===cells.filter(c=>c===m).length/4,"junction mapping");for(const [x,y] of [[16,16],[48,16],[16,48],[48,48]])assert(weightsAt(at,x,y)[at(Math.floor(x/32),Math.floor(y/32))]===1,"center purity");junctions++;
 }
 const offsets=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
 for(let center of [0,2])for(let mask=0;mask<256;mask++){const at=(x,y)=>{if(x===0&&y===0)return center;let i=offsets.findIndex(p=>p[0]===x&&p[1]===y);return i>=0&&(mask&(1<<i))?0:2};
 for(const [x,y] of [[.5,.5],[31.5,.5],[.5,31.5],[31.5,31.5],[16,16],[.5,16],[31.5,16],[16,.5],[16,31.5]]){let w=weightsAt(at,x,y);assert(Math.abs(w[0]+w[2]-1)<1e-12&&w.every(v=>v>=0&&v<=1),"mask weights")}
 let r=renderRegion(at,textures,0,0,32,32,7);assert(r.rgba.length===4096&&r.rgba.every((v,i)=>i%4!==3||v===255),"mask raster");maskTests++;
 }
 const grid=(x,y,seed)=>{let ry=2+Math.round(1.5*Math.sin(x/3+seed));if(Math.abs(y-ry)<=1)return 0;if(y===ry+2)return 1;if(x%5===0)return 6;return 2+((Math.floor(x/3)*7+Math.floor(y/3)*3+seed)%4+4)%4};
 let seamCases=0,comparedPixels=0;
 for(const seed of [1,2701,39101])for(const [x,y] of [[-1024,-1024],[-64,-64],[992,992]]){
 const at=(a,b)=>grid(a,b,seed),full=renderRegion(at,textures,x,y,128,128,seed);for(let cy=0;cy<2;cy++)for(let cx=0;cx<2;cx++){let part=renderRegion(at,textures,x+cx*64,y+cy*64,64,64,seed);for(let j=0;j<64;j++){let p=((cy*64+j)*128+cx*64)*4;assert(equal(part.rgba.subarray(j*256,(j+1)*256),full.rgba.subarray(p,p+256)),"chunk seam mismatch");comparedPixels+=64}seamCases++;}
 }
 const roads=withRoads((x,y)=>x===0?Material.Water:Material.Grass,()=>true);assert(roads(0,0)===0&&roads(1,0)===6,"road overwrote water");
 return {junctions,binaryNeighborhoodRasters:maskTests,seamCases,comparedPixels,roadWaterPreserved:true};
}
