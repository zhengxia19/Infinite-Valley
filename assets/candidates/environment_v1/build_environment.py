"""生成环境候选素材；保留原稿，不声称全量自动拼接完成。"""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
from scipy.ndimage import binary_propagation, label
import hashlib,json
R=Path(__file__).parent; S=R.parent.parent/'source'/'environment'/'masters_v1'; O=R/'sprites'; O.mkdir(exist_ok=True)
images={k:Image.open(S/f'{k}.png').convert('RGBA') for k in ['a01_terrain','a02_water','a03_trees','a04_props','a05_buildings']}
meta={}
def tile(name,src,box):
    img=images[src].crop(box).convert('RGB').resize((32,32),Image.Resampling.BOX)
    a=np.array(img).astype(float)
    # 两侧共同边缘；仅用于平铺底纹，不是混合材质自动拼接。
    for axis in [0,1]:
        b=np.swapaxes(a,0,axis); avg=(b[0]+b[-1])/2
        for i,w in [(0,1),(1,.55),(2,.2)]:
            b[i]=b[i]*(1-w)+avg*w;b[-1-i]=b[-1-i]*(1-w)+avg*w
    a=np.rint(a).astype('uint8'); im=Image.fromarray(a).convert('RGBA'); im.save(O/(name+'.png'))
    assert np.array_equal(a[0],a[-1]) and np.array_equal(a[:,0],a[:,-1])
    meta[name]={'source':src,'crop':box,'size':[32,32],'type':'base_tile','edge_test':'opposite_edges_exact','status':'candidate_pending_visual_review'}
def prop(name,src,box,canvas,height,anchor=None):
    a=np.array(images[src].crop(box)); rgb=a[:,:,:3]; al=a[:,:,3]
    if src=='a03_trees':
        mx=rgb.max(2); mn=rgb.min(2); bg=(mn>185)&((mx.astype(int)-mn)<24)
        seed=np.zeros(bg.shape,bool);seed[[0,-1],:]=bg[[0,-1],:];seed[:,[0,-1]]=bg[:,[0,-1]]
        outside=binary_propagation(seed,mask=bg); mask=~outside
    else: mask=al>=180
    labs,n=label(mask); counts=np.bincount(labs.ravel());counts[0]=0
    # 小独立点和背景残留移除，保留主形体及接近的小有效部分。
    mask=np.isin(labs,np.where(counts>=max(10,counts.max()*.005))[0]) & (labs!=0)
    a[:,:,3]=np.where(mask,255,0); a[~mask]=0
    im=Image.fromarray(a); bb=im.getbbox(); assert bb, name
    im=im.crop(bb); scale=min((canvas[0]-4)/im.width,height/im.height)
    im=im.resize((max(1,round(im.width*scale)),max(1,round(im.height*scale))),Image.Resampling.NEAREST)
    out=Image.new('RGBA',canvas); x=(canvas[0]-im.width)//2;y=canvas[1]-3-im.height;out.paste(im,(x,y));out.save(O/(name+'.png'))
    assert out.getbbox() and set(np.unique(np.array(out)[:,:,3]))<={0,255}
    meta[name]={'source':src,'crop':box,'size':canvas,'type':'sprite','anchorPx':anchor or [canvas[0]//2,canvas[1]-3],'anchor_status':'provisional_manual_review','collision':'not_validated','status':'candidate_pending_visual_review'}
for name,box in [('grass_01',(34,43,95,103)),('grass_02',(120,44,176,102)),('dirt_01',(37,232,96,291)),('dirt_02',(120,232,175,291)),('sand_01',(39,411,97,468)),('sand_02',(121,410,176,467)),('stone_01',(34,584,97,637)),('wetland_01',(35,736,94,788))]: tile(name,'a01_terrain',box)
for name,box in [('water_shallow_01',(31,30,97,104)),('water_shallow_02',(124,28,190,102)),('water_deep_01',(30,134,98,202)),('water_deep_02',(124,134,191,202))]: tile(name,'a02_water',box)
for name,box,can,h in [('oak_mature',(476,0,750,267),(96,128),116),('pine_mature',(563,263,755,505),(64,96),90),('willow_mature',(467,735,764,986),(96,128),116),('birch_mature',(491,504,730,737),(96,128),116),('oak_autumn',(1254,15,1510,267),(96,128),116)]:prop(name,'a03_trees',box,can,h)
for name,box,can,h in [('grass_tuft',(19,39,86,99),(32,32),24),('flower_white',(165,116,269,204),(48,48),35),('shrub_green',(145,307,263,397),(48,48),36),('fern',(145,410,275,495),(48,48),34),('mushroom_red',(598,499,699,583),(48,48),32),('reeds',(201,581,300,687),(48,64),51),('fallen_log',(555,681,743,766),(96,48),39),('stump',(22,781,149,869),(64,48),38),('rock_moss',(700,872,838,971),(64,64),48)]: prop(name,'a04_props',box,can,h)
for name,box,can,h in [('cottage',(10,0,476,442),(192,192),180),('woodshed',(1195,193,1448,423),(128,128),106),('fence_horizontal',(10,451,169,560),(64,48),40),('signpost',(1058,568,1184,737),(48,64),55),('lantern',(1200,553,1333,744),(48,96),80),('barrel',(1035,757,1148,871),(48,48),38),('bridge_vertical',(658,900,814,1062),(96,96),82)]:prop(name,'a05_buildings',box,can,h)
# 保留路面源材质，未宣称与地表草色自动匹配。
tile('path_straight_sample','a05_buildings',(168,590,251,689))
# Atlas: 每组单独放置，图块无 padding 的演示图集；正式atlas另需2px extrude。
items=list(meta); W=8*192; H=((len(items)+7)//8)*224; review=Image.new('RGB',(W,H),'#e7dfcb'); dr=ImageDraw.Draw(review)
for i,name in enumerate(items):
    im=Image.open(O/(name+'.png')); x=i%8*192;y=i//8*224
    if meta[name]['type']=='base_tile':
        for yy in range(3):
            for xx in range(3):review.paste(im,(x+16+xx*32,y+12+yy*32),im)
    else: review.paste(im,(x+(192-im.width)//2,y+198-im.height),im)
    dr.text((x+5,y+202),name,fill='#36372e')
review.save(R/'asset_review.png')
# 真正离线拼合候选纹理与精灵（人工布置测试，不是程序生成世界）。
import random
rng=random.Random(13); scene=Image.new('RGBA',(960,640)); sprites=[]
for y in range(20):
    for x in range(30):
        river=abs(x-(9+round(2*np.sin(y/4))))<=1
        path=(y==12 and x>=12) or (x==22 and y>=8 and y<12)
        name=rng.choice(['water_shallow_01','water_shallow_02','water_deep_01']) if river else 'dirt_01' if path else rng.choice(['grass_01','grass_02'])
        scene.paste(Image.open(O/(name+'.png')),(x*32,y*32))
        if not river and not path and rng.random()<.17 and not (18<x<28 and 5<y<12): sprites.append((x*32+16,y*32+25,rng.choice(['grass_tuft','flower_white','shrub_green','fern','rock_moss'])))
for x,y,name in [(3,5,'oak_mature'),(5,11,'pine_mature'),(15,5,'birch_mature'),(26,4,'oak_autumn'),(4,19,'willow_mature'),(16,18,'oak_mature'),(22,9,'cottage'),(26,11,'woodshed'),(19,11,'signpost'),(23,13,'lantern'),(24,10,'barrel'),(11,12,'bridge_vertical')]:sprites.append((x*32+16,y*32+24,name))
for x,y,name in sorted(sprites,key=lambda v:v[1]):
    im=Image.open(O/(name+'.png')); ax,ay=meta[name]['anchorPx']; scene.alpha_composite(im,(x-ax,y-ay))
scene.convert('RGB').save(R/'scene_preview.png')
for name,m in meta.items():m['sha256']=hashlib.sha256((O/(name+'.png')).read_bytes()).hexdigest()
(R/'manifest.json').write_text(json.dumps({'status':'candidate_pending_visual_review','tileSize':32,'assets':meta,'tests':{'base_tile_exact_edges':sum(m['type']=='base_tile' for m in meta.values()),'sprite_binary_alpha_and_nonempty':sum(m['type']=='sprite' for m in meta.values()),'not_tested':['mixed_material_autotile','collision','occlusion','animation','Phaser','procedural_scene']}},ensure_ascii=False,indent=2))
print('tiles',sum(m['type']=='base_tile' for m in meta.values()),'sprites',sum(m['type']=='sprite' for m in meta.values()))
