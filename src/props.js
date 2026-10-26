// Hand-painted, alpha-preserving raster props generated for this game's art direction.
export const propNames={walnut:'核桃','jujube-ripe':'红枣','jujube-green':'青枣',corn:'玉米',basket:'竹篮','pruning-shears':'剪枝剪',schoolbag:'书包',sketchbook:'画册','cumin-bun':'孜然夹馍','potted-plant':'盆花','art-tools':'绘画工具','dorm-objects':'宿舍物件','shared-home':'合住生活物件',bicycle:'自行车',motorcycle:'摩托车','road-stone':'路上的石块',puddle:'水洼'};
export function propUrl(id){if(!Object.hasOwn(propNames,id))throw Error('Unknown prop '+id);return `${import.meta.env.BASE_URL}assets/props/${id}.webp`;}
export function propImg(id,className='prop-image',alt=''){return `<img src="${propUrl(id)}" class="${className}" alt="${alt}" width="256" height="256" decoding="async">`;}
export function propFigure(id,caption=''){return `<figure class="prop-figure">${propImg(id,'prop-image',caption?'':propNames[id])}${caption?`<figcaption>${caption}</figcaption>`:''}</figure>`;}

const imageLoads=new Map();
export function loadProp(id){
 if(!imageLoads.has(id))imageLoads.set(id,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Prop image unavailable: '+id));image.src=propUrl(id);}).catch(error=>{imageLoads.delete(id);throw error;}));
 return imageLoads.get(id);
}
