# Project instructions

- Preserve the painterly storybook art direction and the elderly protagonist's black dress and hat.
- For character motion, use continuous video generation followed by chroma key and frame extraction. Do not substitute independently generated poses for a continuous walk cycle.
- Prefer the user's existing local Hotpoor Director / ComfyUI H3 setup over external video services. Read `tools.local` if present for this device's paths. It is ignored by Git and must remain private.
- Inspect the actual ComfyUI queue, node catalog and installed models before submission; retain prompt IDs and avoid duplicate jobs. Do not upgrade the inference environment just to match another device's documentation.
- Match gait phase to travelled distance and calibrate stride against stance-foot motion. Check the loop seam, feet, scale and transparency before deploying.
- Idle gestures should wait until the actor settles, play once, then observe a cooldown. Let the actor recover to a standing pose before resuming movement. Keep related clip scales and ground anchors aligned, and keep atlases within the mobile texture budget.
- Verify portrait, landscape and ultrawide layouts. Retain save schema compatibility and run the chapter browser smoke test before release.
