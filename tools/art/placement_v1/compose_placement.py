"""Deterministic offline placement diagnostic. Run: python compose_placement.py REPO OUT [SEED].
Requires Pillow, NumPy, SciPy. Not an authoritative world generator or Phaser renderer.
"""
from pathlib import Path
import sys, json, hashlib, random
from collections import deque
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, gaussian_filter1d, distance_transform_edt

T=32; W=1152; H=768
ROOT=Path(sys.argv[1]); OUT=Path(sys.argv[2]); OUT.mkdir(parents=True,exist_ok=True)
SEED=int(sys.argv[3]) if len(sys.argv)>3 else 2701
rng=random.Random(SEED); nr=np.random.default_rng(SEED)
A=ROOT/'assets'; env=A/'source/environment'; old=A/'candidates/environment_v1/sprites'
used={}
def load(name,group=None):
    dirs=[env/'environment_v4',env/'water_v3',env/'rocks_v3',old] if group is None else [group]
    p=next(p/(name+'.png') for p in dirs if (p/(name+'.png')).is_file())
    b=p.read_bytes(); used[str(p.relative_to(ROOT))]=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
    return Image.open(p).convert('RGBA')

def repeat(im,w,h):
    a=np.asarray(im); yy,xx=np.indices((h,w)); return a[yy%a.shape[0],xx%a.shape[1]].copy()

def ground(w,h,offset=0):
    # Region-scale blending avoids arbitrary independent tile choices. Original PNGs are unchanged.
    yy,xx=np.indices((h,w)); xx=xx+offset
    a=np.sin(xx/172)+.65*np.cos(yy/130)+.45*np.sin((xx+yy)/77)
    b=np.cos(xx/145-yy/173)
    weights=np.stack([np.exp(-((a-k)**2+(b-l)**2)/.70) for k,l in [(-.2,.1),(1.4,.0),(.4,-.9),(-1.6,.4),(-.6,-.7),(.8,1)]],axis=2)
    weights/=weights.sum(axis=2,keepdims=True)
    arr=np.zeros((h,w,3),float)
    for i in range(6):
        tex=repeat(load('grass_patch_%02d'%(i+1)),w,h)[:,:,:3]
        arr+=tex*weights[:,:,i,None]
    return Image.fromarray(np.uint8(np.clip(arr,0,255))).convert('RGBA')

def water_surface(canvas,wet):
    w,h=canvas.size; dist=distance_transform_edt(wet); shallow=repeat(load('water_shallow'),w,h); deep=repeat(load('water_deep'),w,h); clear=repeat(load('water_clear'),w,h)
    yy,xx=np.indices((h,w)); mix=np.clip((dist-4)/17,0,1)[...,None]; var=(.5+.5*np.sin(xx/58+yy/47))[...,None]*.45
    water=(shallow*(1-mix)+(deep*(1-var)+clear*var)*mix).astype('uint8')
    arr=np.array(canvas);arr[wet]=water[wet];return Image.fromarray(arr)

def road(canvas,wet,lines,width=24):
    w,h=canvas.size;m=Image.new('L',(w,h));d=ImageDraw.Draw(m)
    for line in lines:
        d.line(line,fill=255,width=width,joint='curve')
        for x,y in line:d.ellipse((x-width//2,y-width//2,x+width//2,y+width//2),fill=255)
    mask=np.asarray(m).copy(); mask[wet]=0
    feather=np.minimum(gaussian_filter(mask.astype(float),1.3),255).astype('uint8');feather[wet]=0
    canvas.paste(Image.fromarray(repeat(load('dirt_01'),w,h)),(0,0),Image.fromarray(feather))
    return mask>0

def place(canvas,im,origin):canvas.alpha_composite(im,tuple(map(int,origin)))
def polygon_mask(w,h,points):
    im=Image.new('L',(w,h));ImageDraw.Draw(im).polygon(points,fill=255);return np.asarray(im)>0

def bfs(grid,start,end):
    if not grid[start[1],start[0]] or not grid[end[1],end[0]]:return False
    q=deque([start]);seen={start};h,w=grid.shape
    while q:
        x,y=q.popleft()
        if (x,y)==end:return True
        for p in [(x+1,y),(x-1,y),(x,y+1),(x,y-1)]:
            if 0<=p[0]<w and 0<=p[1]<h and grid[p[1],p[0]] and p not in seen:seen.add(p);q.append(p)
    return False

def bridge_geometry(name,origin,w,h):
    # Pixel coordinates measured against the actual source deck, not the image bbox.
    spec={
        'bridge_vertical':{'entrances':[(48,25),(48,77)],'deck':[(34,24),(62,24),(62,78),(34,78)],'supports':[(20,22),(76,22),(20,80),(76,80)],'max_wet_run':42,'axis':'NS'},
        'stone_arch_bridge':{'entrances':[(29,75),(132,51)],'deck':[(22,70),(52,45),(83,37),(112,37),(138,44),(137,57),(112,51),(86,50),(60,57),(32,83)],'supports':[(24,85),(137,75)],'max_wet_run':84,'axis':'oblique'},
        'rope_bridge':{'entrances':[(28,69),(129,45)],'deck':[(23,61),(119,38),(133,41),(134,51),(31,78)],'supports':[(27,81),(126,65)],'max_wet_run':80,'axis':'oblique'},
        'garden_bridge':{'entrances':[(25,100),(117,49)],'deck':[(19,95),(38,68),(69,41),(101,33),(125,43),(122,53),(100,47),(76,52),(51,78),(32,109)],'supports':[(23,112),(120,75)],'max_wet_run':68,'axis':'oblique'}}[name]
    def world(p):return (p[0]+origin[0],p[1]+origin[1])
    return {**spec,'id':name,'origin':origin,'entrances':[world(p) for p in spec['entrances']],'deck':[world(p) for p in spec['deck']],'supports':[world(p) for p in spec['supports']]}

def validate_bridge(bridge,wet,roads,grid_mode=False):
    h,w=wet.shape; a,b=bridge['entrances']; deck=polygon_mask(w,h,bridge['deck']);
    if any(not(0<=x<w and 0<=y<h) for x,y in [a,b,*bridge['supports'],*bridge['deck']]):return False,'out_of_bounds'
    if grid_mode and bridge['axis']!='NS':return False,'unsupported_grid_orientation'
    if wet[a[1],a[0]] or wet[b[1],b[0]]:return False,'wet_entrance'
    if not (roads[a[1],a[0]] and roads[b[1],b[0]]):return False,'road_gap'
    if any(wet[y,x] for x,y in bridge['supports']):return False,'wet_support'
    if not (deck[a[1],a[0]] and deck[b[1],b[0]]):return False,'entrance_outside_deck'
    # Sample full entrance-to-entrance line; compare wet pixels to allowed span.
    n=max(abs(a[0]-b[0]),abs(a[1]-b[1]))+1; xs=np.rint(np.linspace(a[0],b[0],n)).astype(int);ys=np.rint(np.linspace(a[1],b[1],n)).astype(int)
    if not wet[ys,xs].any():return False,'no_water_crossing'
    if wet[ys,xs].sum()>bridge['max_wet_run']:return False,'span_too_short'
    if not bfs((~wet & roads)|deck,a,b):return False,'disconnected_deck'
    return True,'ok'

# Main diagnostic: global 32px water mask, a single 32px passage at the bridge.
# Select valid bridge from compatible candidates at the route crossing, never rotate assets.
yy,xx=np.indices((H,W)); tx=xx//T; ty=yy//T
upper=np.array([10+round(.9*np.sin(i/5)+.5*np.cos(i/3)) for i in range(W//T)]); lower=upper+2
# Global crossing at column 18; the narrow ford is determined before asset selection.
upper[16:21]=11;lower[16:21]=12
for i in [15,21]:upper[i]=11;lower[i]=13
# Pixel bank curves follow the coarse terrain field, preserve the grid-centre classifications.
centres=np.arange(W//T)*32+16
north=gaussian_filter1d(np.interp(np.arange(W),centres,upper*32),6)
south=gaussian_filter1d(np.interp(np.arange(W),centres,lower*32),6)
north[16*32+16:21*32-16]=352;south[16*32+16:21*32-16]=384
wet=(yy>=north[None,:])&(yy<south[None,:]);canvas=water_surface(ground(W,H),wet)
# Composite actual shoreline strip colours with softened vertical ends; no hard isolated rectangular tiles.
arr=np.array(canvas)
for side,curve in [('north',north),('south',south)]:
    bank_a=np.asarray(load('bank_'+side+'_green'));bank_b=np.asarray(load('bank_'+side+'_rock'))
    for x in range(W):
        if 552<=x<=632:continue # deck and landing unobstructed
        edge=int(curve[x]);mix=.5+.5*np.sin(x/61)
        strip=bank_a[:,x%64,:3]*mix+bank_b[:,x%64,:3]*(1-mix)
        for j in range(24):
            py=edge-12+j
            if 0<=py<H:
                alpha=min(1,(j+1)/6,(24-j)/6)*.88
                arr[py,x,:3]=np.uint8(arr[py,x,:3]*(1-alpha)+strip[j]*alpha)
canvas=Image.fromarray(arr)
# Calibrated visual anchors: building door is distinct from foot/collision polygon.
# Origins are chosen on land by the scenario; connector endpoints derive from source metadata.
buildings=[{'id':'cottage','origin':(736,55),'entry':(84,181),'foot':[(12,111),(181,111),(181,169),(118,174),(118,164),(60,164),(60,179),(12,179)]},
 {'id':'blue_roof_shop','origin':(457,80),'entry':(126,147),'foot':[(12,100),(177,100),(177,139),(142,139),(142,138),(108,138),(108,150),(12,150)]},
 {'id':'watermill','origin':(935,218),'entry':(147,133),'foot':[(12,87),(160,87),(160,123),(112,123),(112,130),(12,130)],'wheel':(45,141)},
 {'id':'market_stall','origin':(670,154),'entry':(48,84),'foot':[(10,49),(86,49),(86,73),(10,73)]}]
# Watermill uses north bank with its wheel at the river's actual wet pixel, body dry.
for b in buildings:
    if b['id']=='watermill':
        # Move to a reachable north bank; calculate y from wheel pixel and local water edge.
        x=b['origin'][0]; wx=x+b['wheel'][0]; edge=int(north[wx]);b['origin']=(x,edge-b['wheel'][1]+4)
    ox,oy=b['origin'];b['entryWorld']=(ox+b['entry'][0],oy+b['entry'][1]);b['footWorld']=[(ox+x,oy+y) for x,y in b['foot']]
# Primary deck centered on crossing tile; road endpoints derived from it.
bridge=bridge_geometry('bridge_vertical',(18*32+16-48,311),W,H); a,b=bridge['entrances'];
# Branch roads meet the central road; mill approach comes from east rather than across its wheel.
lines=[[(400,767),(475,665),(550,555),(592,465),b], [a,(592,300),(644,270),(700,268),(815,268)],[(815,268),buildings[0]['entryWorld']],[(592,300),buildings[1]['entryWorld']],[(700,268),buildings[3]['entryWorld']],[(815,268),(925,268),(925,buildings[2]['entryWorld'][1]),buildings[2]['entryWorld']]]
roads=road(canvas,wet,lines)
ok,reason=validate_bridge(bridge,wet,roads,True);assert ok,reason
# Collision is separate from graphics. Route must not intersect a building footprint.
blocked=np.zeros_like(wet); building_checks={}
for ob in buildings:
    foot=polygon_mask(W,H,ob['footWorld']);x,y=ob['entryWorld'];
    check={'dry_footprint':not (foot&wet).any(),'entry_on_road':bool(roads[y,x]),'entry_unblocked':not bool(foot[y,x]),'entry_dry':not bool(wet[y,x])}
    if 'wheel' in ob:
        wx,wy=[ob['origin'][i]+ob['wheel'][i] for i in range(2)];check['wheel_in_water']=bool(wet[wy,wx]);ob['wheelWorld']=[wx,wy]
    assert all(check.values()),(ob['id'],check);blocked|=foot;building_checks[ob['id']]=check
walk=((~wet & roads)|polygon_mask(W,H,bridge['deck'])) & ~blocked
for ob in buildings:
    building_checks[ob['id']]['connected_to_south']=bfs(walk,ob['entryWorld'],b)
    assert building_checks[ob['id']]['connected_to_south'],ob['id']
# Logical grid sample: the orthogonal bridge crosses one water tile; adjacent water tiles are blocked.
logical=~wet[16::32,16::32].copy();assert not logical[11,18];logical[11,18]=True; logical_without=logical.copy();logical_without[11,18]=False
assert bfs(logical,(18,10),(18,12)) and not bfs(logical_without,(18,10),(18,12))
# Deterministic scatter, reject objects whose contact region occupies roads/water/building footprint.
objects=[]; occupied=np.zeros_like(wet)
def prop(name,x,y,solid=False):
    im=load(name);radius=max(7,min(30,im.width//4)) if solid else max(5,min(13,im.width//3))
    if not(radius<=x<W-radius and radius<=y<H-radius):return False
    roi=np.s_[y-radius:y+radius+1,x-radius:x+radius+1]
    if (wet[roi]|roads[roi]|blocked[roi]|occupied[roi]).any():return False
    if any(abs(x-ob['entryWorld'][0])<im.width//2+18 and abs(y-ob['entryWorld'][1])<30 for ob in buildings):return False
    if solid:occupied[roi]=True
    objects.append((y,name,(x-im.width//2,y-im.height+3),im));return True
for cx,cy in [(115,140),(285,115),(95,665),(1010,690)]:
    for _ in range(23):
        x=int(rng.gauss(cx,90)); y=int(rng.gauss(cy,95));prop(rng.choice(['oak_mature','pine_mature','birch_mature','willow_mature']),x,y,True)
for name,x,y in [('rock_terrace',200,295),('giant_boulder',260,680),('giant_moss_cluster',890,700),('rock_spires',1080,625),('boulder_moss',360,480)]:prop(name,x,y,True)
for _ in range(175):
    x=rng.randrange(12,W-12);y=rng.randrange(15,H-12)
    # Keep the village entrance and trail visually clear; smaller features cluster in open ground.
    prop(rng.choice(['fern','grass_tuft','flower_white','shrub_green','fungus_amanita','fungus_bolete','fungus_white','fungus_violet','fungus_chanterelle','fungus_shelf_log','pebbles','small_rock']),x,y)
for name,x,y in [('barrel',930,241),('lantern',728,280),('signpost',627,322),('barrel',706,249),('fence_horizontal',855,302),('fence_horizontal',904,302)]:prop(name,x,y,True)
# Water decorations use approved images and are clipped to water.
for x,y,name in [(95,350,'lily'),(345,370,'lily_flower'),(830,373,'ripple'),(1090,380,'lily')]:
    if wet[y,x]:
        im=load(name);m=Image.new('L',im.size);ImageDraw.Draw(m).ellipse((1,1,im.width-2,im.height-2),fill=255);tmp=Image.new('RGBA',canvas.size);tmp.paste(im,(x-im.width//2,y-im.height//2),m);ar=np.array(tmp);ar[~wet,3]=0;canvas.alpha_composite(Image.fromarray(ar))
place(canvas,load('bridge_vertical'),bridge['origin'])
for ob in buildings:
    im=load(ob['id']);objects.append((ob['entryWorld'][1],ob['id'],ob['origin'],im))
# Character anchor from approved atlas; feet must land on accessible road.
for sex,(x,y),row in [('male',(592,402),1),('female',buildings[0]['entryWorld'],0),('male',(700,268),3)]:
    assert walk[y,x],(sex,x,y)
    im=load('default',A/'source/characters/character_v2'/sex).crop((0,row*64,48,(row+1)*64));objects.append((y,sex,(x-24,y-61),im))
for _,name,origin,im in sorted(objects,key=lambda p:p[0]):place(canvas,im,origin)
canvas.convert('RGB').save(OUT/'scene.png');canvas.crop((410,125,1105,480)).resize((1390,710),Image.Resampling.NEAREST).convert('RGB').save(OUT/'detail.png')
# Diagnostic overlay is separate; actual artwork remains unchanged.
diagnostic=canvas.copy();d=ImageDraw.Draw(diagnostic)
for p in [bridge['deck'],*[ob['footWorld'] for ob in buildings]]:d.line(p+[p[0]],fill='#fff3ae',width=2)
for p in bridge['entrances']+[ob['entryWorld'] for ob in buildings]:x,y=p;d.ellipse((x-4,y-4,x+4,y+4),fill='#29ff92',outline='black')
for x,y in bridge['supports']:d.rectangle((x-3,y-3,x+3,y+3),fill='#ffb24e')
diagnostic.convert('RGB').save(OUT/'connections.png')
# Negative tests: a wet endpoint, road gap, unsupported orientation, oversized channel.
neg={}; test=wet.copy();test[a[1],a[0]]=True;neg['wet_entrance']=validate_bridge(bridge,test,roads,True)[1]
test=roads.copy();test[b[1],b[0]]=False;neg['road_gap']=validate_bridge(bridge,wet,test,True)[1]
wide={**bridge,'max_wet_run':12};neg['span_too_short']=validate_bridge(wide,wet,roads,True)[1]
neg['unsupported_grid_orientation']=validate_bridge({**bridge,'axis':'oblique'},wet,roads,True)[1]
assert all(k==v for k,v in neg.items()),neg
# Three oblique visual fixtures: correct measured endpoints, banks/support positions, no formal grid mapping.
board=Image.new('RGB',(1152,300),'#263329');bd=ImageDraw.Draw(board);comparisons={}
for i,name in enumerate(['stone_arch_bridge','rope_bridge','garden_bridge']):
    w,h=384,272;im=load(name);org=(192-im.width//2,145-im.height//2);g=bridge_geometry(name,org,w,h);e1,e2=g['entrances']; y,x=np.indices((h,w));center=192+6*np.sin(y/32);half=25+4*np.cos(y/34);wet2=abs(x-center)<half;zone=water_surface(ground(w,h,400*i),wet2)
    rr=road(zone,wet2,[[(12,e1[1]+24),(75,e1[1]+8),e1],[e2,(310,e2[1]-8),(372,e2[1]-22)]],22)
    success,why=validate_bridge(g,wet2,rr,False);comparisons[name]={'pixel_connection':success,'reason':why,'grid_eligible':False,'geometry':g};
    # Add actual bank stones outside the water; not logical support data.
    for nx,ny in [(165,220),(218,66)]:q=load('pebbles');place(zone,q,(nx-q.width//2,ny-q.height//2))
    place(zone,im,org);board.paste(zone.convert('RGB'),(i*w,0));bd.text((i*w+8,278),name+' / '+why,fill='white')
board.save(OUT/'bridge_review.png')
report={'seed':SEED,'tile_px':T,'scene_size':[W,H],'bridge':bridge,'buildings':buildings,'checks':{'bridge_connection':reason,'logical_grid_crossing':True,'non_bridge_water_blocked':True,'buildings':building_checks,'negative':neg},'oblique_diagnostics':comparisons,'object_count':len(objects),'used_git_blob_sha':used,'limitations':['offline raster only','orthogonal main scene only','manual measured per-sprite anchors and fixed diagnostic layout, no arbitrary procedural settlement generator','single-image foreground ordering; no true roof/rail splits or full actor collision','shoreline strips visual approximation, not full mixed-material autotiling','no water animation, engine, network or cross-chunk runtime validation']}
(OUT/'validation.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps({'checks':report['checks'],'oblique':{k:v['reason'] for k,v in comparisons.items()},'objects':len(objects)},ensure_ascii=False))
