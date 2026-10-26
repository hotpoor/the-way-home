"""Smooth a paired-frame continuous-video gait atlas with bidirectional optical flow.
Uses local OpenCV; preserves the existing crop, stride, scale and ground anchor.
The input atlas must be retained separately, never overwrite it in place.
"""
import argparse,json,math
from pathlib import Path
import cv2
import numpy as np
from PIL import Image

def interpolate(a,b,t,forward,backward,grid):
    def warp(frame,flow,amount):
        return cv2.remap(frame,grid[0]-amount*flow[:,:,0],grid[1]-amount*flow[:,:,1],cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
    pa=a.astype(np.float32)/255;pb=b.astype(np.float32)/255
    pa[:,:,:3]*=pa[:,:,3:];pb[:,:,:3]*=pb[:,:,3:]
    out=(1-t)*warp(pa,forward,t)+t*warp(pb,backward,1-t)
    out[:,:,:3]/=np.maximum(out[:,:,3:],1e-6)
    out[out[:,:,3]<.01]=0
    return np.uint8(np.clip(out*255,0,255))

def smooth(meta_path,output):
    meta=json.loads(meta_path.read_text())
    if 'smoothing' in meta:meta=meta['smoothing']['inputMetadata']
    source=meta_path.parent/meta['image']
    if source.resolve()==output.resolve():raise ValueError('Output must not overwrite the source atlas')
    atlas=np.array(Image.open(source).convert('RGBA'))
    w=atlas.shape[1]//meta['columns'];h=atlas.shape[0]//meta['rows'];step=meta.get('poseFrameStep',2)
    frames=[atlas[(i//meta['columns'])*h:(i//meta['columns']+1)*h,(i%meta['columns'])*w:(i%meta['columns']+1)*w].copy() for i in range(0,meta['frameCount'],step)]
    def gray(frame):
        alpha=frame[:,:,3:]/255.;rgb=frame[:,:,:3]*alpha+np.array([233,223,199])*(1-alpha)
        return cv2.cvtColor(np.uint8(rgb),cv2.COLOR_RGB2GRAY)
    y,x=np.mgrid[:h,:w].astype(np.float32);results=[]
    for i,a in enumerate(frames):
        b=frames[(i+1)%len(frames)];ga,gb=gray(a),gray(b)
        args=(None,.5,4,25,5,7,1.5,0)
        forward=cv2.calcOpticalFlowFarneback(ga,gb,*args);backward=cv2.calcOpticalFlowFarneback(gb,ga,*args)
        for k in range(4):results.append(a if k==0 else interpolate(a,b,k/4,forward,backward,(x,y)))
    columns=math.ceil(math.sqrt(len(results)*h/w));rows=math.ceil(len(results)/columns)
    sheet=Image.new('RGBA',(columns*w,rows*h));assert max(sheet.size)<=4096
    for i,a in enumerate(results):sheet.paste(Image.fromarray(a),(i%columns*w,i//columns*h))
    sheet.save(output,optimize=True)
    original=meta.copy()
    meta.update(image=output.name,columns=columns,rows=rows,frameCount=len(results),fps=meta['fps']*4/step,poseFrameStep=1,
                smoothing={'method':'bidirectional-optical-flow','inputImage':source.name,'inputPoseStep':step,'subframes':4,'inputMetadata':original})
    meta_path.write_text(json.dumps(meta,indent=2)+'\n')
    print(output,sheet.size,len(results))
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('metadata',type=Path);p.add_argument('output',type=Path);a=p.parse_args();smooth(a.metadata,a.output)
