export function drawCrop(id,stage){
 const w=32,h=48,rgba=new Uint8Array(w*h*4);
 const p=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||x>=w||y<0||y>=h)return;const k=(y*w+x)*4;for(let i=0;i<3;i++)rgba[k+i]=parseInt(c.slice(i*2,i*2+2),16);rgba[k+3]=255};
 const line=(x,y,X,Y,c)=>{let n=Math.max(Math.abs(X-x),Math.abs(Y-y),1);for(let i=0;i<=n;i++)p(x+(X-x)*i/n,y+(Y-y)*i/n,c)};
 function oval(cx,cy,rx,ry,colors,angle=0,taper=0){
 const a=angle*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
 for(let y=Math.max(0,Math.floor(cy-rx-ry));y<=Math.min(h-1,Math.ceil(cy+rx+ry));y++)for(let x=Math.max(0,Math.floor(cx-rx-ry));x<=Math.min(w-1,Math.ceil(cx+rx+ry));x++){const dx=x-cx,dy=y-cy,u=(dx*co+dy*si)/rx,v=(-dx*si+dy*co)/ry,t=u*u+v*v/Math.max(.35,1+taper*u)**2;if(t>1)continue;let k=t>.75?0:(dx/(rx+ry)+dy/(rx+ry)>.22?1:dx/(rx+ry)+dy/(rx+ry)<-.25?3:2);if((x*13+y*7)%19===0&&k===2)k=3;p(x,y,colors[k])}}
 const g=["38563a","537a42","73994d","a4be72"],s=["315443","45744b","609552","96b96e"],c=["3d6540","648840","82a64e","b2c777"];
 function leaf(x,y,X,Y,width,pal=g,taper=.15){const dx=X-x,dy=Y-y,len=Math.hypot(dx,dy);oval(x+dx*.55,y+dy*.55,len*.56,width,pal,Math.atan2(dy,dx)*180/Math.PI,taper);line(x,y,X,Y,pal[1]);line(x,y,x+dx*.56,y+dy*.56,pal[3]);if(len>8)for(const t of [.35,.65]){let vx=x+dx*t,vy=y+dy*t;line(vx,vy,vx-dy/len*width*.63+dx*.10,vy+dx/len*width*.63+dy*.10,pal[2])}}
 const stem=(x,y,X,Y)=>{line(x,y,X,Y,"38563a");line(x-1,y,X-1,Y,"94b665")};
 oval(16,45,stage===0?4:stage===1?5:9,stage===0?1.4:2,["654c37","78593d","886445","aa8058"]);
 if(stage===0){oval(16,43,4,2,["654c37","886445","b58a5c","cfaa77"]);const seed={radish:"ab7955",cucumber:"e2cca3",carrot:"926f4a",spinach:"b7aa76"}[id];p(15,42,seed);p(16,42,seed);p(17,43,seed);return {w,h,rgba}}
 if(stage===1){stem(16,44,16,36);let q=["radish","cucumber","carrot","spinach"].indexOf(id);leaf(16,39,10-q%2,35-q%2,2,g);leaf(16,38,21+q%2,33-q%2,2,q>1?s:c);p(15,36,"b8c981");return {w,h,rgba}}
 const d=stage-2;
 if(id==="radish"){if(stage>=3)oval(16,42,stage===4?6:4,stage===4?4:3,["8d4648","b96064","d77d79","f0ab91"],-12);if(stage===4){p(16,46,"e2cca3");p(14,45,"f3e9d0");p(15,45,"f3e9d0")}leaf(16,42,10-d*2,31-d*3,3+d*.5,g);leaf(16,41,20+d*2,30-d*3,3+d*.5,c);leaf(16,41,15,25-d*3,3.2+d*.5,g);leaf(16,42,8-d,37-d*2,3,g);if(stage>=3)leaf(16,41,25+d,36-d*2,3.5,c)}
 else if(id==="carrot"){if(stage>=3){oval(16,42,stage===4?4:3,stage===4?4:3,["9e643d","c87b42","e8a354","f2c17d"],85,-.34);p(15,40,"f2c17d");p(18,43,"ad6a39")}for(const [ex,ey] of [[8-d,28-d*3],[14,21-d*3],[21+d,26-d*3],[25+d,34-d*2],[8,36-d]]){stem(16,42,ex,ey);for(const t of [.35,.60,.80]){const xx=16+(ex-16)*t,yy=42+(ey-42)*t;leaf(xx,yy,xx-3-d*.5,yy-4,1.25,g);leaf(xx,yy,xx+3+d*.5,yy-3,1.15,c)}}}
 else if(id==="spinach"){const ends=[[7-d,35-d],[10-d,29-d*2],[16,26-d*3],[23+d,30-d*2],[26+d,37-d],[16,34-d*2]];for(let i=0;i<ends.length;i++)leaf(16,43,...ends[i],3.3+d*.8,i%2?s:g,-.18);if(stage>=3){leaf(16,43,10,39,3.7,s);leaf(16,42,23,39,4,s)}}
 else if(id==="cucumber"){const top=27-d*7;for(const x of [6,25]){line(x,44,x+1,top,"5c4436");line(x+1,44,x+2,top,"b38150");line(x+2,43,x+3,top,"93633f")}line(7,top+1,27,top+1,"5c4436");line(7,top,27,top,"cc9f6b");line(8,top+8,26,top+8,"aa8058");stem(16,44,11,36);stem(11,36,20,28);if(stage>=3)stem(20,28,13,top+3);if(stage===4)stem(13,top+3,22,top+1);for(const v of [[15,40,8,35],[12,35,19,35],[18,30,24,25],[18,29,10,25]])leaf(...v,3.5,c,-.15);if(stage>=3){leaf(14,top+7,8,top+3,3.5,g);leaf(15,top+7,23,top+4,4,c);p(20,31,"e4be63");p(21,30,"ebd88b");p(22,31,"e4be63");p(21,32,"e4be63")}if(stage===4){leaf(18,top+4,26,top-1,3.5,g);oval(21,34,3,6,["36573a","537a42","73994d","a4be72"],-15);oval(11,27,2.5,5,["36573a","537a42","73994d","a4be72"],12);p(21,29,"b8c981");p(20,35,"94b665");p(10,25,"94b665")}}
 return {w,h,rgba}
}
