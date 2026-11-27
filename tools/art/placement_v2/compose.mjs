import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import {generate,render,assets} from "./placement.mjs";
const root=resolve(process.argv[2]||"."),out=resolve(process.argv[3]||"/tmp/iv-placement-v2"),seed=Number(process.argv[4]||2701);
await mkdir(out,{recursive:true});
for(const name of ["bridge_vertical","stone_arch_bridge","rope_bridge","garden_bridge"]){const s=generate(seed,name);const used=new Set(["grass","grass2","water","shallow","dirt","male","female",s.name,...s.buildings.map(b=>b.name),...s.props.map(o=>o.name)]);const images={};for(const n of used){const b=await readFile(join(root,assets[n]));images[n]={w:b.readUInt32BE(16),h:b.readUInt32BE(20),href:"data:image/png;base64,"+b.toString("base64")};}await writeFile(join(out,name+".svg"),render(s,images));await writeFile(join(out,name+"-debug.svg"),render(s,images,true));await writeFile(join(out,name+".json"),JSON.stringify(s,null,2));}
