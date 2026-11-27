import test from "node:test";
import assert from "node:assert/strict";
import {Terrain,splitTile,seedHash,terrainAt,resourceAt,generateChunk,ChunkCache,previewSpawn,PREVIEW_SEED} from "../src/world/generator.ts";
test("negative coordinates and UTF-8 NFC",()=>{
  assert.deepEqual(splitTile(-1),{chunk:-1,local:31});
  assert.deepEqual(splitTile(-32),{chunk:-1,local:0});
  assert.deepEqual(splitTile(-33),{chunk:-2,local:31});
  assert.equal(seedHash("e\u0301"),seedHash("é"));
  assert.equal(seedHash("hello"),0x4f9f2cab);
  assert.throws(()=>splitTile(.5),RangeError);
});
test("30 seeds, region boundaries, order independence and resource ownership",()=>{
  for(let i=0;i<30;i++){
    const seed=seedHash("world-"+i);
    for(const [x,y] of [[-17,-1],[-1,-17],[15,15],[0,0]]){
      const a=generateChunk(seed,x,y),b=generateChunk(seed,x+1,y),c=generateChunk(seed,x,y+1);
      assert.deepEqual(generateChunk(seed,x,y+1),c);
      assert.deepEqual(generateChunk(seed,x+1,y),b);
      assert.deepEqual(generateChunk(seed,x,y),a);
      for(let j=0;j<32;j++){
        const r=j*32+31,l=j*32,d=31*32+j;
        const horizontal=a.terrain[r]===b.terrain[l],vertical=a.terrain[d]===c.terrain[j];
        assert.equal(!!(a.edges[r]&2),horizontal);
        assert.equal(!!(b.edges[l]&8),horizontal);
        assert.equal(!!(a.edges[d]&4),vertical);
        assert.equal(!!(c.edges[j]&1),vertical);
        assert.equal(a.terrain[r],terrainAt(seed,x*32+31,y*32+j));
      }
      const ids=new Set();
      for(const ch of [a,b,c])for(const e of ch.staticEntities){
        assert.ok(!ids.has(e.id));ids.add(e.id);
        assert.equal(Math.floor(e.x/32),ch.cx);
        assert.equal(Math.floor(e.y/32),ch.cy);
        const idx=splitTile(e.y).local*32+splitTile(e.x).local;
        assert.equal(ch.flags[idx],1);
        assert.deepEqual(resourceAt(seed,e.x,e.y,ch.terrain[idx]),e);
      }
    }
  }
});
test("bounded cache and 1000 chunk traversal",()=>{
  const seed=seedHash(PREVIEW_SEED),cache=new ChunkCache(seed);
  cache.update(0,0);const original=cache.chunks.get("0,0");
  for(let i=1;i<=1000;i++){cache.update(i,0);assert.equal(cache.chunks.size,25);}
  assert.equal(cache.walkable(0,0),false);
  cache.update(0,0);assert.deepEqual(cache.chunks.get("0,0"),original);
  const spawn=previewSpawn(seed);assert.ok(spawn);
  cache.update(splitTile(Math.floor(spawn.x)).chunk,splitTile(Math.floor(spawn.y)).chunk);
  assert.ok(cache.walkable(spawn.x,spawn.y));
});
test("world limit",()=>{
  const seed=seedHash("limit");
  assert.equal(terrainAt(seed,1000001,0),Terrain.Water);
  assert.throws(()=>generateChunk(seed,99999,0),RangeError);
});
