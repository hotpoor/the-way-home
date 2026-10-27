// Ground contact and perspective, authored against each 1600 × 900 painting.
// Scale uses the existing motion calibration as 1; no animation metadata is rewritten.
export const sceneLayouts={
 'village.png':[[0,645,1.18],[400,707,1.2],[800,741,1.22],[1200,719,1.2],[1600,681,1.18]],
 'jujube-courtyard.png':[[0,692,1.5],[400,718,1.55],[800,733,1.6],[1200,727,1.6],[1600,707,1.55]],
 'village-road.webp':[[0,638,1.05],[400,687,1.15],[800,731,1.27],[1200,773,1.4],[1600,805,1.5]],
 'school-moon.webp':[[0,682,1.3],[400,715,1.35],[800,745,1.4],[1200,737,1.4],[1600,719,1.35]],
 'xian-campus.webp':[[0,735,1.4],[400,751,1.45],[800,763,1.5],[1200,757,1.5],[1600,741,1.45]],
 'taiyuan-jinci.webp':[[0,727,1.45],[400,743,1.5],[800,754,1.55],[1200,745,1.55],[1600,729,1.5]],
 'shanghai-street.webp':[[0,750,1.8],[400,760,1.85],[800,770,1.9],[1200,765,1.9],[1600,750,1.85]],
 'shanghai-studio.webp':[[0,790,2.35],[400,802,2.4],[800,811,2.45],[1200,806,2.45],[1600,790,2.4]],
 'old-school.webp':[[0,708,1.65],[400,735,1.7],[800,755,1.8],[1200,740,1.8],[1600,715,1.75]],
};
export function scenePlacement(file,x){
 const points=sceneLayouts[file]??sceneLayouts['village.png'];
 const bounded=Math.max(points[0][0],Math.min(points.at(-1)[0],x));
 const i=Math.min(points.length-2,points.findIndex((p,n)=>n<points.length-1&&bounded<=points[n+1][0]));
 const a=points[i],b=points[i+1],t=(bounded-a[0])/(b[0]-a[0]),ease=t*t*(3-2*t);
 return {ground:a[1]+(b[1]-a[1])*ease,scale:a[2]+(b[2]-a[2])*ease};
}
