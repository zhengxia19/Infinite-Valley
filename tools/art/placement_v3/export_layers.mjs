import {readFile,writeFile,mkdir} from "node:fs/promises";
import {join,resolve} from "node:path";
import {specs} from "./layer_specs.mjs";
import {splitSprite,verifySplit} from "./split_layers.mjs";
import {decodePNG,encodePNG} from "./png.mjs";
const root=resolve(process.argv[2]||"."),out=resolve(process.argv[3]||join(root,"assets/derived/environment_layers_v1"));
await mkdir(out,{recursive:true});
for(const [name,spec] of Object.entries(specs)){const im=decodePNG(await readFile(join(root,spec.source))),layers=splitSprite(im,spec);console.log(name,verifySplit(im,layers));for(const [part,layer] of Object.entries(layers))await writeFile(join(out,name+"_"+part+".png"),encodePNG(layer));}
