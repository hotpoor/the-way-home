"""Package generated cutouts for runtime without flattening their alpha channel."""
from pathlib import Path
from PIL import Image
import argparse,json
p=argparse.ArgumentParser(description=__doc__);p.add_argument('source',type=Path);p.add_argument('output',type=Path);a=p.parse_args();a.output.mkdir(parents=True,exist_ok=True)
records=[]
for src in sorted(a.source.glob('*.png')):
 im=Image.open(src).convert('RGBA');alpha=im.getchannel('A');assert alpha.getextrema()==(0,255),f'{src.name}: expected genuine transparency'
 box=alpha.getbbox();assert box
 cut=im.crop(box);cut.thumbnail((336,336),Image.Resampling.LANCZOS)
 image=Image.new('RGBA',(384,384));image.alpha_composite(cut,((384-cut.width)//2,(384-cut.height)//2));dest=a.output/(src.stem+'.webp');image.save(dest,lossless=True,method=6)
 assert Image.open(dest).getchannel('A').tobytes()==image.getchannel('A').tobytes()
 records.append({'id':src.stem,'size':[384,384],'bytes':dest.stat().st_size,'sourceBounds':list(box)})
 print(src.stem,im.size,alpha.getextrema(),dest.stat().st_size)
(a.output/'manifest.json').write_text(json.dumps(records,indent=2)+'\n')
