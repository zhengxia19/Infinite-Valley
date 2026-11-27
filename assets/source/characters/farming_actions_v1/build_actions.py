from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np
from scipy.ndimage import label, find_objects
import json, hashlib

ROOT=Path(__file__).resolve().parent
DIRS=['south','north','west','east']; ACTIONS=['hoe','water','harvest']
NAMES={'male':'农夫冒险者四向三动作像素动画表.png','female':'农场少女工具动画精灵表.png'}

def build(sex):
    p=ROOT/f'{sex}_source.png'
    src=Image.open(p).convert('RGBA'); a=np.asarray(src)
    labels,_=label(a[:,:,3]>=180); counts=np.bincount(labels.ravel()); boxes=find_objects(labels)
    major=[(i,sl) for i,sl in enumerate(boxes,1) if counts[i]>500]
    assert len(major)==48
    rows=[sorted([(i,sl) for i,sl in major if row*256<=sl[0].start<(row+1)*256],key=lambda v:v[1][1].start) for row in range(4)]
    assert all(len(row)==12 for row in rows)
    # Keep the same scale for all poses of a character. Use idle body height, not tool height.
    height=np.median([row[8][1][0].stop-row[8][1][0].start for row in rows]); scale=55/height
    sheet=Image.new('RGBA',(768,320)); frames={}; anims={}; checks=[]
    major_ids={i for i,_ in major}
    for d,row in enumerate(rows):
        baseline=row[8][1][0].stop-1
        for col,(i,sl) in enumerate(row):
            y0,y1=sl[0].start,sl[0].stop; x0,x1=sl[1].start,sl[1].stop
            # Assign detached water droplets/soil only when near this component and no closer to another.
            ids=[i]
            for j,other in enumerate(boxes,1):
                if j in major_ids or counts[j]<5: continue
                cy=(other[0].start+other[0].stop)/2; cx=(other[1].start+other[1].stop)/2
                if not (d*256<=cy<(d+1)*256): continue
                def dist(bb):
                    return max(bb[1].start-cx,0,cx-bb[1].stop)**2+max(bb[0].start-cy,0,cy-bb[0].stop)**2
                if dist(sl)<=28**2 and min(row,key=lambda t:dist(t[1]))[0]==i: ids.append(j)
            mask=np.isin(labels,ids); yy,xx=np.where(mask)
            # Center using head/upper torso rather than extended hoe or watering can.
            head=(labels==i)&(np.arange(a.shape[0])[:,None]>=y0+int((y1-y0)*.08))&(np.arange(a.shape[0])[:,None]<y0+int((y1-y0)*.30))
            hx=np.median(np.where(head)[1]);
            # Transform with nearest pixel sampling, fixed anchor and shared row ground baseline.
            sx=np.rint(hx+(np.arange(64)-32)/scale).astype(int); sy=np.rint(baseline+(np.arange(80)-65)/scale).astype(int)
            validx=(sx>=0)&(sx<a.shape[1]); validy=(sy>=0)&(sy<a.shape[0]); sx=np.clip(sx,0,a.shape[1]-1); sy=np.clip(sy,0,a.shape[0]-1)
            out=a[sy[:,None],sx[None,:]].copy(); m=mask[sy[:,None],sx[None,:]]&validy[:,None]&validx[None,:]; out[~m]=0;out[m,3]=255
            frame=Image.fromarray(out); bb=frame.getbbox(); assert bb and bb[0]>0 and bb[1]>0 and bb[2]<64 and bb[3]<80,(sex,d,col,bb)
            # No silent cropping: original component projected extents must be in frame (within 1 sample pixel).
            ext=(32+(xx.min()-hx)*scale,65+(yy.min()-baseline)*scale,32+(xx.max()-hx)*scale,65+(yy.max()-baseline)*scale)
            assert ext[0]>=-.5 and ext[1]>=-.5 and ext[2]<=63.5 and ext[3]<=79.5,(sex,d,col,ext)
            sheet.paste(frame,(col*64,d*80)); name=f'{DIRS[d]}_{ACTIONS[col//4]}_{col%4:02d}'
            frames[name]={'frame':{'x':col*64,'y':d*80,'w':64,'h':80},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':64,'h':80},'sourceSize':{'w':64,'h':80},'anchor':{'x':.5,'y':65/80}}
            checks.append({'name':name,'bbox':bb,'sha256':hashlib.sha256(out.tobytes()).hexdigest()})
        for action in ACTIONS: anims[f'{action}_{DIRS[d]}']={'frames':[f'{DIRS[d]}_{action}_{i:02d}' for i in range(4)],'fps':5,'repeat':0}
    sheet.save(ROOT/f'{sex}_actions.png',optimize=True)
    for akey,anim in anims.items(): assert len({next(c['sha256'] for c in checks if c['name']==n) for n in anim['frames']})==4,akey
    meta={'assetId':f'{sex}_farm_actions_v1','status':'art_approved_source_runtime_candidate','frameSize':[64,80],'characterDisplayFrame':[48,64],'tileSize':32,'anchorPx':[32,65],'frames':frames,'animations':anims,'meta':{'image':f'{sex}_actions.png','size':{'w':768,'h':320},'scale':'1'},'limitations':'4 key poses per direction/action, baked tools, not layer compatible, ground anchor preliminary, action timing not gameplay-authoritative'}
    (ROOT/f'{sex}_atlas.json').write_text(json.dumps(meta,indent=2)+'\n');return checks

if __name__=='__main__':
    res={sex:build(sex) for sex in NAMES}
    (ROOT/'validation.json').write_text(json.dumps({'frames':res,'tests':['48 connected main objects per source','64x80 padded action frame bounds (48x64 character display unchanged)','hard alpha','4 unique frames per action direction','no projected extent clipping'],'not_tested':['animation quality','Phaser integration','exact hand/foot registration','layered action variants']},indent=2)+'\n')
    review=Image.new('RGB',(768*2,320*4+56),'#d7d3c2'); draw=ImageDraw.Draw(review)
    for i,sex in enumerate(NAMES):
        y=i*(640+28);draw.text((8,y+6),sex.upper()+' - hoe / water / harvest',fill='#28261f');im=Image.open(ROOT/f'{sex}_actions.png').resize((1536,640),Image.Resampling.NEAREST);review.paste(im,(0,y+28),im)
    review.save(ROOT/'review.png')
