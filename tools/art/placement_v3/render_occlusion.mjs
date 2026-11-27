import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {decodePNG,encodePNG} from "./png.mjs";
import * as api from "./occlusion.mjs";
const root=resolve(process.argv[2]||"."),out=resolve(process.argv[3]||"/tmp/iv-placement-v3");
const read=async path=>decodePNG(await readFile(join(root,path)));
const actor=api.crop(await read("assets/source/characters/character_v2/male/default.png"),0,64,48,64);
const cfg=[["cottage",["base","roof"],[60,40],"behind"],["oak_mature",["trunk","canopy"],[24,38],"behind"],["stone_arch_bridge",["back_rail","deck","front_rail"],[60,-10],"on_bridge"]];
const board=api.blank(660,420,[107,134,92,255]);
for(let i=0;i<cfg.length;i++){let [name,names,pos,mode]=cfg[i],parts={};for(let n of names)parts[n]=await read("assets/derived/environment_layers_v1/"+name+"_"+n+".png");let upper=parts[names[names.length-1]],cnt=api.intersectionCount(actor,upper,...pos);if(!cnt)throw Error("actor not overlapping "+name);let x=i*220+Math.round((220-upper.w)/2);let before=api.orderedParts(parts,actor,pos,"front"),after=api.orderedParts(parts,actor,pos,mode);api.drawRecords(board,before,[x,8]);api.drawRecords(board,after,[x,218]);console.log(name,cnt,after.map(r=>r.part))}
await mkdir(out,{recursive:true});await writeFile(join(out,"occlusion.png"),encodePNG(board));
