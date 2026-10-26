"""Review and chroma-key a locally generated walk video into an RGBA atlas.

Requires PyAV, NumPy and Pillow (available in the existing ComfyUI environment).
First run with --review; inspect the contact sheet before choosing --start/--end.
Frame indices are zero-based and --end is exclusive. Never interpolates poses.
"""
import argparse
import json
import math
from pathlib import Path

import av
import numpy as np
from PIL import Image, ImageDraw


def keyed(rgb):
    pixels = rgb.astype(np.float32)
    red, green, blue = pixels[..., 0], pixels[..., 1], pixels[..., 2]
    dominance = green - np.maximum(red, blue)
    alpha = np.clip((45 - dominance) / 28, 0, 1)
    # Despill only semi-transparent contour pixels; preserve opaque paint colors.
    pixels[..., 1] = np.where(alpha < .98, np.minimum(green, np.maximum(red, blue) + 8), green)
    rgba = np.concatenate([pixels, (alpha * 255)[..., None]], axis=2).astype(np.uint8)
    rgba[alpha < .02] = 0
    return Image.fromarray(rgba)


def read_video(path):
    with av.open(str(path)) as source:
        fps = float(source.streams.video[0].average_rate)
        return [keyed(frame.to_ndarray(format='rgb24')) for frame in source.decode(video=0)], fps


def review(frames, target):
    samples = list(range(0, len(frames), 6))
    sheet = Image.new('RGB', (8 * 128, math.ceil(len(samples) / 8) * 210), '#e9dfc7')
    draw = ImageDraw.Draw(sheet)
    for n, i in enumerate(samples):
        image = frames[i].copy(); image.thumbnail((120, 184))
        x, y = n % 8 * 128, n // 8 * 210
        sheet.paste(image, (x + (128-image.width)//2, y+18), image)
        draw.text((x+8,y+2), str(i), fill='#394635')
    sheet.save(target / 'contact-sheet.jpg')
    # Find candidate seams using pose plus the neighboring motion direction.
    small = [np.array(f.resize((32,48)), dtype=np.float32) / 255 for f in frames]
    features = [np.concatenate([(s[..., :3] * s[..., 3:]).ravel(), s[...,3].ravel()]) for s in small]
    candidates = []
    for start in range(6, max(7, len(frames)-30)):
        for length in range(28, min(65, len(frames)-start-2)):
            end = start + length
            pose = np.mean(np.abs(features[start]-features[end]))
            velocity = np.mean(np.abs((features[start+1]-features[start])-(features[end+1]-features[end])))
            candidates.append(dict(start=start,end=end,frames=length,score=float(pose+.5*velocity)))
    candidates.sort(key=lambda c:c['score'])
    (target/'loop-candidates.json').write_text(json.dumps(candidates[:24],indent=2))


def atlas(frames, fps, start, end, output, stride, name='woman', display_height=150, crop=None):
    if not 0 <= start < end <= len(frames):
        raise ValueError('Invalid start/end frame interval')
    selected = frames[start:end]
    boxes = [f.getbbox() for f in selected]
    if any(b is None for b in boxes): raise ValueError('Empty keyed frame')
    # One shared crop preserves scale, floor position and natural vertical motion.
    w,h = frames[0].size
    box=tuple(crop) if crop else (max(0,min(b[0] for b in boxes)-10),max(0,min(b[1] for b in boxes)-10),
         min(w,max(b[2] for b in boxes)+10),min(h,max(b[3] for b in boxes)+10))
    cell_h=256 if display_height>100 else 192
    cell_w=math.ceil((box[2]-box[0])/(box[3]-box[1])*cell_h/4)*4
    columns=min(16,max(4,math.ceil(math.sqrt(len(selected)*cell_h/cell_w))))
    rows=math.ceil(len(selected)/columns)
    if cell_w*columns>4096 or cell_h*rows>4096:
        raise ValueError('Atlas exceeds the mobile texture budget; split the clip or lower cell resolution')
    sheet=Image.new('RGBA',(cell_w*columns,cell_h*rows))
    preview=[]
    for i,f in enumerate(selected):
        image=f.crop(box).resize((cell_w,cell_h),Image.Resampling.LANCZOS)
        sheet.paste(image,((i%columns)*cell_w,(i//columns)*cell_h))
        canvas=Image.new('RGBA',image.size,'#e9dfc7');canvas.alpha_composite(image)
        preview.append(canvas.convert('RGB'))
    output.mkdir(parents=True,exist_ok=True)
    sheet.save(output/f'{name}-walk-video.png',optimize=True)
    frames[0].crop(box).resize((cell_w,cell_h),Image.Resampling.LANCZOS).save(output/f'{name}-idle-video.png')
    metadata=dict(image=f'{name}-walk-video.png',columns=columns,rows=rows,frameCount=len(selected),fps=fps,
                  displayHeight=display_height,displayWidth=display_height*cell_w/cell_h,stride=stride,idleFrame=0,
                  idleImage=f'{name}-idle-video.png',
                  anchorY=float((np.median([b[3] for b in boxes])-box[1])/(box[3]-box[1])),
                  source='local-comfyui-minimax-h3-turbo',sourceFrames=[start,end],sourceFPS=fps,crop=list(box))
    (output/f'{name}-walk-video.json').write_text(json.dumps(metadata,indent=2)+'\n')
    preview[0].save(output/f'{name}-walk-review.gif',save_all=True,append_images=preview[1:],duration=round(1000/fps),loop=0)
    print(json.dumps(metadata))


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('video',type=Path);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--review',action='store_true');p.add_argument('--start',type=int);p.add_argument('--end',type=int)
    p.add_argument('--stride',type=float,default=66,help='World distance per full gait cycle; calibrate against foot contact')
    p.add_argument('--name',default='woman');p.add_argument('--display-height',type=float,default=150)
    p.add_argument('--crop',type=int,nargs=4,help='Shared crop for related clips, left top right bottom')
    a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
    frames,fps=read_video(a.video)
    if a.review:review(frames,a.output)
    else:
        if a.start is None or a.end is None:p.error('Inspect --review first, then supply --start and --end')
        atlas(frames,fps,a.start,a.end,a.output,a.stride,a.name,a.display_height,a.crop)
