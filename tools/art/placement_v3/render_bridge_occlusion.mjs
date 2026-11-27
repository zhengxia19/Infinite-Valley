import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {decodePNG,encodePNG} from "./png.mjs";
import * as api from "./occlusion.mjs";
const root=resolve(process.argv[2]||"."),out=resolve(process.argv[3]||"/tmp/iv-placement-v3");
const read=async path=>decodePNG(await readFile(join(root,path)));
const actor=api.crop(await read("assets/source/characters/character_v2/male/default.png"),0,64,48,64);
const cases=[{"name":"bridge_vertical","actorPosition":[14,-10],"foot":[38,51],"insideDeck":true,"actorOverlapPixels":27,"changedPixels":27,"drawOrder":["back_rail","deck","actor","front_rail"]},{"name":"rope_bridge","actorPosition":[54,-4],"foot":[78,57],"insideDeck":true,"actorOverlapPixels":115,"changedPixels":115,"drawOrder":["back_rail","deck","actor","front_rail"]},{"name":"garden_bridge","actorPosition":[24,20],"foot":[48,81],"insideDeck":true,"actorOverlapPixels":23,"changedPixels":23,"drawOrder":["back_rail","deck","actor","front_rail"]}];
const board=api.blank(540,380,[107,134,92,255]);
for(let i=0;i<cases.length;i++){const test=cases[i],name=test.name,pos=test.actorPosition,parts={};for(const n of ["back_rail","deck","front_rail"])parts[n]=await read("assets/derived/environment_layers_v1/"+name+"_"+n+".png");let upper=parts.front_rail,overlap=api.intersectionCount(actor,upper,...pos);if(overlap!==test.actorOverlapPixels)throw Error(name+" overlap mismatch");let before=api.orderedParts(parts,actor,pos,"front"),after=api.orderedParts(parts,actor,pos,"on_bridge"),x=i*180+Math.round((180-upper.w)/2);api.drawRecords(board,before,[x,30]);api.drawRecords(board,after,[x,220]);let a=api.blank(upper.w,upper.h),b=api.blank(upper.w,upper.h);api.drawRecords(a,before);api.drawRecords(b,after);let changed=0;for(let k=0;k<a.rgba.length;k+=4)if(a.rgba.subarray(k,k+4).some((v,c)=>v!==b.rgba[k+c]))changed++;if(changed!==test.changedPixels)throw Error(name+" pixel mismatch");console.log(name,overlap,changed);}
await mkdir(out,{recursive:true});await writeFile(join(out,"bridge_occlusion.png"),encodePNG(board));
