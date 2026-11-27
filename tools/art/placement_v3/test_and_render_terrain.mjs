import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,join} from "node:path";
import * as api from "../../../src/world/terrain-stitch.mjs";
import {decodePNG,encodePNG} from "./png.mjs";
import {verifyTerrain} from "./terrain_test.mjs";
import {fixture} from "./terrain_fixture.mjs";
const root=resolve(process.argv[2]||"."),out=resolve(process.argv[3]||"/tmp/iv-placement-v3");
const textures={};
for(const [name,path] of Object.entries(api.texturePaths)){const im=decodePNG(await readFile(join(root,path)));if(im.rgba.some((v,i)=>i%4===3&&v!==255))throw Error("nonopaque texture "+name);textures[name]=im}
await mkdir(out,{recursive:true});
console.log(verifyTerrain(api,textures));
await writeFile(join(out,"terrain.png"),encodePNG(api.renderRegion(fixture,textures,0,0,640,384,2701)));
