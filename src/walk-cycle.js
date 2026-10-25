// Advance by travelled distance so a planted foot does not slide when speed changes.
export function advanceWalk(phase, distance, stride) {
  if (!Number.isFinite(stride) || stride <= 0) throw new Error('Invalid walk stride');
  return (phase + Math.abs(distance) / stride) % 1;
}
export function walkFrame(phase, frameCount) {
  if (!Number.isInteger(frameCount) || frameCount < 1) throw new Error('Invalid walk frame count');
  return Math.min(frameCount - 1, Math.floor(((phase % 1 + 1) % 1) * frameCount));
}
