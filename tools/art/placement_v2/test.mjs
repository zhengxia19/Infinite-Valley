import assert from "node:assert/strict";
import {generate} from "./placement.mjs";
for(const name of ["bridge_vertical","stone_arch_bridge","rope_bridge","garden_bridge"]){let passed=0;for(let seed=2701;seed<2713;seed++){const a=generate(seed,name);assert.deepEqual(a,generate(seed,name));passed++;}console.log(name,passed+"/12");}
