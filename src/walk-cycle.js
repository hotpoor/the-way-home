// Advance by travelled distance so a planted foot does not slide when speed changes.
export function advanceWalk(phase, distance, stride) {
  if (!Number.isFinite(stride) || stride <= 0) throw new Error('Invalid walk stride');
  return (phase + Math.abs(distance) / stride) % 1;
}
export function walkFrame(phase, frameCount) {
  if (!Number.isInteger(frameCount) || frameCount < 1) throw new Error('Invalid walk frame count');
  return Math.min(frameCount - 1, Math.floor(((phase % 1 + 1) % 1) * frameCount));
}

// Near-identical paired source frames represent one pose. Interpolate between
// those poses evenly, including the last-to-first boundary, using distance phase.
export function walkBlend(phase, frameCount, frameStep=1) {
  if (!Number.isInteger(frameStep)||frameStep<1||frameCount%frameStep!==0) throw new Error('Invalid walk frame step');
  const count=frameCount/frameStep,position=((phase%1+1)%1)*count,index=Math.floor(position);
  return {current:index*frameStep,next:((index+1)%count)*frameStep,amount:position-index};
}
