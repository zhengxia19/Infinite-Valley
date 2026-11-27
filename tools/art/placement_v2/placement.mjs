// 离线区域组合研究；不修改正式世界生成器。
const W=1152,H=768,T=32;
const bridges={
  "bridge_vertical": {
    "entry": [
      [
        48,
        25
      ],
      [
        48,
        77
      ]
    ],
    "deck": [
      [
        34,
        24
      ],
      [
        62,
        24
      ],
      [
        62,
        78
      ],
      [
        34,
        78
      ]
    ],
    "support": [
      [
        20,
        22
      ],
      [
        76,
        22
      ],
      [
        20,
        80
      ],
      [
        76,
        80
      ]
    ],
    "rail": [
      [
        11,
        12
      ],
      [
        28,
        12
      ],
      [
        28,
        94
      ],
      [
        11,
        94
      ]
    ],
    "axis": "NS",
    "max": 42
  },
  "stone_arch_bridge": {
    "entry": [
      [
        29,
        75
      ],
      [
        132,
        51
      ]
    ],
    "deck": [
      [
        22,
        70
      ],
      [
        52,
        45
      ],
      [
        83,
        37
      ],
      [
        112,
        37
      ],
      [
        138,
        44
      ],
      [
        137,
        57
      ],
      [
        112,
        51
      ],
      [
        86,
        50
      ],
      [
        60,
        57
      ],
      [
        32,
        83
      ]
    ],
    "support": [
      [
        24,
        85
      ],
      [
        137,
        75
      ]
    ],
    "rail": [
      [
        12,
        47
      ],
      [
        29,
        40
      ],
      [
        40,
        56
      ],
      [
        64,
        39
      ],
      [
        85,
        28
      ],
      [
        113,
        24
      ],
      [
        145,
        30
      ],
      [
        145,
        55
      ],
      [
        135,
        63
      ],
      [
        112,
        50
      ],
      [
        86,
        52
      ],
      [
        58,
        66
      ],
      [
        29,
        91
      ],
      [
        12,
        95
      ]
    ],
    "axis": "EW",
    "max": 84
  },
  "rope_bridge": {
    "entry": [
      [
        28,
        69
      ],
      [
        129,
        45
      ]
    ],
    "deck": [
      [
        23,
        61
      ],
      [
        119,
        38
      ],
      [
        133,
        41
      ],
      [
        134,
        51
      ],
      [
        31,
        78
      ]
    ],
    "support": [
      [
        27,
        81
      ],
      [
        126,
        65
      ]
    ],
    "rail": [
      [
        15,
        52
      ],
      [
        29,
        46
      ],
      [
        31,
        65
      ],
      [
        55,
        58
      ],
      [
        78,
        48
      ],
      [
        103,
        40
      ],
      [
        131,
        29
      ],
      [
        139,
        32
      ],
      [
        139,
        53
      ],
      [
        105,
        60
      ],
      [
        79,
        67
      ],
      [
        53,
        78
      ],
      [
        30,
        89
      ],
      [
        15,
        84
      ]
    ],
    "axis": "EW",
    "max": 80
  },
  "garden_bridge": {
    "entry": [
      [
        25,
        100
      ],
      [
        117,
        49
      ]
    ],
    "deck": [
      [
        19,
        95
      ],
      [
        38,
        68
      ],
      [
        69,
        41
      ],
      [
        101,
        33
      ],
      [
        125,
        43
      ],
      [
        122,
        53
      ],
      [
        100,
        47
      ],
      [
        76,
        52
      ],
      [
        51,
        78
      ],
      [
        32,
        109
      ]
    ],
    "support": [
      [
        23,
        112
      ],
      [
        120,
        75
      ]
    ],
    "rail": [
      [
        12,
        70
      ],
      [
        31,
        53
      ],
      [
        45,
        47
      ],
      [
        64,
        28
      ],
      [
        90,
        10
      ],
      [
        116,
        15
      ],
      [
        135,
        35
      ],
      [
        135,
        50
      ],
      [
        123,
        62
      ],
      [
        103,
        43
      ],
      [
        78,
        58
      ],
      [
        52,
        85
      ],
      [
        34,
        112
      ],
      [
        12,
        115
      ]
    ],
    "axis": "EW",
    "max": 68
  }
};
const buildings={
  "cottage": {
    "size": [
      192,
      192
    ],
    "entry": [
      84,
      181
    ],
    "foot": [
      [
        12,
        111
      ],
      [
        181,
        111
      ],
      [
        181,
        169
      ],
      [
        118,
        174
      ],
      [
        118,
        164
      ],
      [
        60,
        164
      ],
      [
        60,
        179
      ],
      [
        12,
        179
      ]
    ],
    "roof": [
      [
        15,
        23
      ],
      [
        98,
        40
      ],
      [
        125,
        7
      ],
      [
        151,
        7
      ],
      [
        184,
        82
      ],
      [
        171,
        113
      ],
      [
        104,
        123
      ],
      [
        21,
        104
      ]
    ]
  },
  "blue_roof_shop": {
    "size": [
      192,
      160
    ],
    "entry": [
      126,
      147
    ],
    "foot": [
      [
        12,
        100
      ],
      [
        177,
        100
      ],
      [
        177,
        139
      ],
      [
        142,
        139
      ],
      [
        142,
        138
      ],
      [
        108,
        138
      ],
      [
        108,
        150
      ],
      [
        12,
        150
      ]
    ],
    "roof": [
      [
        14,
        18
      ],
      [
        88,
        22
      ],
      [
        121,
        8
      ],
      [
        141,
        8
      ],
      [
        184,
        64
      ],
      [
        180,
        84
      ],
      [
        118,
        92
      ],
      [
        85,
        78
      ],
      [
        13,
        97
      ]
    ]
  },
  "market_stall": {
    "size": [
      96,
      88
    ],
    "entry": [
      48,
      84
    ],
    "foot": [
      [
        10,
        49
      ],
      [
        86,
        49
      ],
      [
        86,
        73
      ],
      [
        10,
        73
      ]
    ],
    "roof": [
      [
        6,
        0
      ],
      [
        90,
        0
      ],
      [
        91,
        44
      ],
      [
        8,
        44
      ]
    ]
  }
};
export const assets={
  "grass": "assets/source/environment/environment_v4/grass_patch_01.png",
  "grass2": "assets/source/environment/environment_v4/grass_patch_04.png",
  "water": "assets/source/environment/water_v3/water_deep.png",
  "shallow": "assets/source/environment/water_v3/water_shallow.png",
  "dirt": "assets/candidates/environment_v1/sprites/dirt_01.png",
  "cottage": "assets/candidates/environment_v1/sprites/cottage.png",
  "blue_roof_shop": "assets/source/environment/environment_v4/blue_roof_shop.png",
  "market_stall": "assets/source/environment/environment_v4/market_stall.png",
  "bridge_vertical": "assets/candidates/environment_v1/sprites/bridge_vertical.png",
  "stone_arch_bridge": "assets/source/environment/environment_v4/stone_arch_bridge.png",
  "rope_bridge": "assets/source/environment/environment_v4/rope_bridge.png",
  "garden_bridge": "assets/source/environment/environment_v4/garden_bridge.png",
  "oak_mature": "assets/candidates/environment_v1/sprites/oak_mature.png",
  "pine_mature": "assets/candidates/environment_v1/sprites/pine_mature.png",
  "giant_boulder": "assets/source/environment/environment_v4/giant_boulder.png",
  "fungus_amanita": "assets/source/environment/environment_v4/fungus_amanita.png",
  "male": "assets/source/characters/character_v2/male/default.png",
  "female": "assets/source/characters/character_v2/female/default.png"
};
function rand(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}

function check(ok,msg){if(!ok)throw Error(msg)}

function inside(p,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}

function samples(a,b,step=2){let n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step));return Array.from({length:n+1},(_,i)=>[a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n])}

function shift(points,o){return points.map(p=>[p[0]+o[0],p[1]+o[1]])}

function river(seed,axis,cross,mid,half){let phase=(seed%79)/11;let wave=t=>39*Math.sin(t/181+phase)+12*Math.sin(t/67+phase*2);return {axis,cross,mid,half,center:t=>mid+wave(t)-wave(cross),width:t=>half+3*Math.sin((t-cross)/90),distance:(x,y)=>{let t=axis==="NS"?x:y,u=axis==="NS"?y:x;return Math.abs(u-mid-wave(t)+wave(cross))-(half+3*Math.sin((t-cross)/90))}}}

function center(c){return [c[0]*T+T/2,c[1]*T+T/2]}

function route(start,goal,allowed){let q=[start],prev=new Map([[start.join(),null]]);for(let i=0;i<q.length;i++){let p=q[i];if(p.join()===goal.join()){let result=[];for(let k=p;k;k=prev.get(k.join()))result.push(k);return result.reverse()}for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){let n=[p[0]+dx,p[1]+dy],key=n.join();if(n[0]>=0&&n[0]<W/T&&n[1]>=0&&n[1]<H/T&&!prev.has(key)&&allowed(p,n)){prev.set(key,p);q.push(n)}}}return null}

function nearest(p,dry,blocked){let cells=[];for(let y=0;y<H/T;y++)for(let x=0;x<W/T;x++){let c=[x,y],v=center(c),d=Math.hypot(v[0]-p[0],v[1]-p[1]);if(d<85&&samples(p,v).every(z=>dry(z)&&!blocked(z)))cells.push({c,d})}cells.sort((a,b)=>a.d-b.d);return cells[0]?.c}

function generate(seed,name){
 let rng=rand(seed),spec=bridges[name],axis=spec.axis;
 let cross=Math.round((axis==="NS"?W:H)*(.43+rng()*.14)),mid=Math.round((axis==="NS"?H:W)*(.43+rng()*.14));
 let midpoint=spec.entry[0].map((v,i)=>(v+spec.entry[1][i])/2);
 let origin=axis==="NS"?[cross-midpoint[0],mid-midpoint[1]]:[mid-midpoint[0],cross-midpoint[1]];origin=origin.map(Math.round);
 let rv=river(seed,axis,cross,mid,axis==="NS"?13:23),dry=p=>rv.distance(...p)>0;
 let bridge={id:"preview:"+seed+":"+name+":"+origin.join(":"),name,origin,entry:shift(spec.entry,origin),deck:shift(spec.deck,origin),support:shift(spec.support,origin)};
 check(bridge.entry.every(dry)&&bridge.support.every(dry),"wet entrance or support");
 let [a,b]=bridge.entry;
 let q=[a],prev=new Map([[a.join(),null]]);for(let i=0;i<q.length;i++){let p=q[i];if(p.join()===b.join())break;for(let [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){let n=[p[0]+dx,p[1]+dy],k=n.join();if(!prev.has(k)&&(inside(n,bridge.deck)||k===b.join())){prev.set(k,p);q.push(n)}}}
 check(prev.has(b.join()),"deck disconnected");bridge.path=[];for(let p=b;p;p=prev.get(p.join()))bridge.path.push(p);bridge.path.reverse();
 check(bridge.path.some(p=>!dry(p))&&bridge.path.filter(p=>!dry(p)).length<=spec.max*2,"invalid span");
 check(samples(a,b).filter(p=>!dry(p)).length*2<=spec.max,"span too long");
 let placed=[],roads=[],props=[];
 let blocked=p=>placed.some(o=>inside(p,o.foot));
 let walk=(p,n)=>samples(center(p),center(n)).every(z=>dry(z)&&!blocked(z));
 let portals=bridge.entry.map(p=>nearest(p,dry,blocked));check(portals.every(Boolean),"no dry grid portal");
 check(!route(portals[0],portals[1],walk),"banks connected without bridge");
 bridge.portals=portals;
 for(let i=0;i<2;i++)roads.push([bridge.entry[i],center(portals[i])]);
 for(const [index,kind] of ["cottage","blue_roof_shop","market_stall"].entries()){
   let s=buildings[kind],side=index%2,bank=bridge.entry[side],target=portals[side],found=false;
   let candidates=[];for(let y=16;y+s.size[1]+32<H;y+=24)for(let x=16;x+s.size[0]+16<W;x+=24)candidates.push([x,y]);
   candidates=candidates.map(o=>({o,k:rng()})).sort((a,b)=>a.k-b.k);
   for(const {o} of candidates){
     let entry=shift([s.entry],o)[0],foot=shift(s.foot,o);
     let yard=[entry[0]-28,entry[1]-2,entry[0]+28,entry[1]+25];
     let rect=[o[0]-8,o[1]-8,o[0]+s.size[0]+8,o[1]+s.size[1]+30];
     if(Math.hypot(entry[0]-bank[0],entry[1]-bank[1])>480||Math.hypot(entry[0]-bank[0],entry[1]-bank[1])<95)continue;
     if(placed.some(v=>rect[0]<v.rect[2]&&rect[2]>v.rect[0]&&rect[1]<v.rect[3]&&rect[3]>v.rect[1]))continue;
     if(bridge.entry.some(p=>p[0]>rect[0]-18&&p[0]<rect[2]+18&&p[1]>rect[1]-18&&p[1]<rect[3]+18))continue;
     let safe=true;for(let y=o[1]+Math.min(...s.foot.map(p=>p[1]));y<=yard[3];y+=4)for(let x=o[0]+8;x<=o[0]+s.size[0]-8;x+=4)if(!dry([x,y]))safe=false;
     if(!safe||!dry(entry)||inside(entry,foot))continue;
     if(roads.some(line=>line.slice(1).some((p,j)=>samples(line[j],p).some(z=>inside(z,foot)))))continue;
     let item={name:kind,origin:o,entry,foot,rect,yard};placed.push(item);
     if(bridge.entry.some((p,i)=>!samples(p,center(portals[i])).every(z=>dry(z)&&!blocked(z)))){placed.pop();continue}
     let cell=nearest(entry,dry,blocked),path=cell&&route(cell,target,walk);
     if(!path){placed.pop();continue}
     roads.push([entry,...path.map(center)]);found=true;break;
   }check(found,"no site "+kind);
 }
 check(roads.every(line=>line.slice(1).every((p,j)=>samples(line[j],p).every(z=>dry(z)&&!blocked(z)))),"road collision");
 for(let i=0;i<90;i++){let p=[Math.round(28+rng()*(W-56)),Math.round(40+rng()*(H-68))],kind=["oak_mature","pine_mature","giant_boulder","fungus_amanita"][Math.floor(rng()*4)];
  if(rv.distance(...p)<22||placed.some(o=>p[0]>o.rect[0]-30&&p[0]<o.rect[2]+30&&p[1]>o.rect[1]-30&&p[1]<o.rect[3]+30)||bridge.entry.some(a=>Math.hypot(a[0]-p[0],a[1]-p[1])<95))continue;
  if(roads.some(l=>l.slice(1).some((v,j)=>samples(l[j],v,8).some(z=>Math.hypot(z[0]-p[0],z[1]-p[1])<32)))||props.some(o=>Math.hypot(o.p[0]-p[0],o.p[1]-p[1])<48))continue;
  props.push({name:kind,p});
 }
 return {seed,name,river:{axis,cross,mid,half:rv.half},bridge,buildings:placed,roads,props};
}

function render(scene,images,debug=false){
 let {seed,river:r,bridge,buildings:bs,roads,props}=scene,rv=river(seed,r.axis,r.cross,r.mid,r.half),spec=bridges[bridge.name];
 let axis=r.axis,extent=axis==="NS"?W:H,contour=(offset)=>{let a=[],b=[];for(let t=-4;t<=extent+4;t+=4){let c=rv.center(t),h=Math.max(0,rv.width(t)+offset);a.push(axis==="NS"?[t,c-h]:[c-h,t]);b.push(axis==="NS"?[t,c+h]:[c+h,t])}return [...a,...b.reverse()].map(p=>p.map(v=>v.toFixed(2)).join(",")).join(" ")};
 let defs=[],body=[],layers=[],points=p=>p.map(a=>a.join(",")).join(" ");
 for(const [name,a] of Object.entries(images))defs.push(`<image id="im-${name}" width="${a.w}" height="${a.h}" href="${a.href}"/>`);
 function use(name,x,y){return `<use href="#im-${name}" x="${x}" y="${y}"/>`}
 for(const n of ["grass","grass2","water","shallow","dirt"]){let a=images[n];defs.push(`<pattern id="p-${n}" width="${a.w}" height="${a.h}" patternUnits="userSpaceOnUse">${use(n,0,0)}</pattern>`)}
 defs.push(`<radialGradient id="fade"><stop offset="0" stop-color="white"/><stop offset=".65" stop-color="#aaa"/><stop offset="1" stop-color="black"/></radialGradient>`);
 let rng=rand(seed+911),blobs="";for(let i=0;i<13;i++)blobs+=`<ellipse cx="${rng()*W}" cy="${rng()*H}" rx="${90+rng()*180}" ry="${70+rng()*120}" fill="url(#fade)"/>`;
 defs.push(`<mask id="grassMix"><rect width="${W}" height="${H}" fill="black"/>${blobs}</mask>`);
 body.push(`<rect width="${W}" height="${H}" fill="url(#p-grass)"/><rect width="${W}" height="${H}" fill="url(#p-grass2)" mask="url(#grassMix)"/>`);
 for(const [d,fill,op] of [[9,"url(#p-dirt)",.34],[4,"#b5b18a",.68],[0,"url(#p-shallow)",1],[-8,"url(#p-water)",.48],[-12,"url(#p-water)",.65]])body.push(`<polygon points="${contour(d)}" fill="${fill}" opacity="${op}"/>`);
 for(const line of roads){let p=points(line);body.push(`<polyline points="${p}" fill="none" stroke="#a9a16b" stroke-opacity=".55" stroke-width="25" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${p}" fill="none" stroke="url(#p-dirt)" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>`)}
 for(const b of bs){let [x,y]=b.entry;let [l,t,rr,bb]=b.yard;
 body.push(`<rect x="${l-4}" y="${t-2}" width="${rr-l+8}" height="${bb-t+6}" rx="8" fill="#b5ab7e" opacity=".5"/><rect x="${l}" y="${t}" width="${rr-l}" height="${bb-t}" rx="5" fill="url(#p-dirt)"/>`);
 for(let row=0;row<3;row++)for(let col=0;col<5;col++){let xx=x-24+col*10+(row%2)*2,yy=y+5+row*6;body.push(`<rect x="${xx}" y="${yy}" width="9" height="5" rx="1" fill="${["#b8b39b","#a9a18b","#c4bca2"][(row+col)%3]}" stroke="#77705b" stroke-width=".7"/>`)}
 body.push(`<path d="M${x-17} ${y-1}h34v4h-34z" fill="#d0c4a4" stroke="#81755c" stroke-width="1"/><path d="M${x-20} ${y+3}h40v4h-40z" fill="#b4a98d" stroke="#81755c" stroke-width="1"/>`);
 }
 function split(name,o,poly,depth){let id="clip"+layers.length,absolute=shift(poly,o);defs.push(`<clipPath id="${id}"><polygon points="${points(absolute)}"/></clipPath><mask id="${id}-base"><rect width="${W}" height="${H}" fill="white"/><polygon points="${points(absolute)}" fill="black"/></mask>`);let v=use(name,...o);layers.push({depth,html:`<g mask="url(#${id}-base)">${v}</g>`},{depth:depth+.1,html:`<g clip-path="url(#${id})">${v}</g>`});}
 let bo=bridge.origin,rail=shift(spec.rail,bo);defs.push(`<clipPath id="rail"><polygon points="${points(rail)}"/></clipPath><mask id="bridgeBase"><rect width="${W}" height="${H}" fill="white"/><polygon points="${points(rail)}" fill="black"/></mask>`);body.push(`<g mask="url(#bridgeBase)">${use(bridge.name,...bo)}</g>`);
 for(const b of bs)split(b.name,b.origin,buildings[b.name].roof,b.entry[1]);
 for(const p of props){let a=images[p.name],o=[p.p[0]-a.w/2,p.p[1]-a.h+3];if(p.name.includes("mature"))split(p.name,o,[[0,0],[a.w,0],[a.w,a.h*.67],[0,a.h*.67]],p.p[1]);else layers.push({depth:p.p[1],html:use(p.name,...o)});}
 function actor(name,p,row,depth){layers.push({depth,html:`<svg x="${p[0]-24}" y="${p[1]-61}" width="48" height="64" viewBox="0 ${row*64} 48 64" overflow="hidden">${use(name,0,0)}</svg>`})}
 actor("male",bridge.path[Math.floor(bridge.path.length/2)],1,bridge.entry[0][1]);for(const [i,b] of bs.entries())actor(i%2?"female":"male",[b.entry[0],b.entry[1]+12],0,b.entry[1]+12);
 layers.push({depth:Math.max(...bridge.entry.map(p=>p[1]))+1,html:`<g clip-path="url(#rail)">${use(bridge.name,...bo)}</g>`});
 body.push(...layers.sort((a,b)=>a.depth-b.depth).map(o=>o.html));
 if(debug){body.push(`<polygon points="${points(bridge.deck)}" fill="none" stroke="#ffec94" stroke-width="2"/><polyline points="${points(bridge.path)}" fill="none" stroke="#ffbb43" stroke-width="2"/>`);for(const p of bridge.entry)body.push(`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#64ffb5"/>`);for(const b of bs)body.push(`<polygon points="${points(b.foot)}" fill="none" stroke="#ffec94" stroke-width="2"/>`)}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join("")}</defs>${body.join("")}</svg>`;
}
export {generate,render,river,route};
