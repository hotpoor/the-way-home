# 美术制作记录

工具：GPT imagegen 内置生成工具。风格输入：用户提供的秋日乡村画作。原始参考不随公共仓库发布。

产物：`public/assets/village.png`。

提示词：

> Use case: illustration-story. Create a production game environment plate matching the attached autumn countryside painting's hand-painted gouache and oil-on-paper brush texture, golden wheat fields, muted sage and dark olive foliage, warm ivory sky, soft hazy layered hills, small cream houses with rust-red roofs. Wide landscape 16:9. This is a side-on storybook adventure game background: distant hills occupy upper half, middle-distance scattered village houses, foreground golden field and a pale gently curving walkable country footpath running continuously from left edge to right edge at approximately 78 percent image height. A large old walnut tree stands at 65 percent width, trunk beside the path, spreading green-gold canopy in upper right. Clear readable path. NO PEOPLE, NO ANIMALS, NO TEXT, NO UI, NO WATERMARK. Preserve the reference's painterly richness and warm nostalgic atmosphere. Not vector art, not 3D render. Need a clean environment so animated characters can be overlaid.

首版背景已视觉检查。当前树冠植物形态为生成概念图，后续应做核桃树形态修订。最初角色使用程序剪影，现已由下述手绘图集替换。

## 手绘行走图集修订

工具：GPT imagegen 内置工具，透明输出。产物 `public/assets/woman-walk.png`、`public/assets/dog-walk.png`，每张 4 列 2 行。程序按 UV 播放，保留原始透明通道，不做绿幕处理。已替换程序剪影；无视频模型参与本轮。

老妇人提示词：

> Create a production 2D sprite animation sheet on TRUE TRANSPARENT BACKGROUND. Exactly 4 columns and 2 rows of equally sized cells, total 8 frames, each cell contains the SAME elderly woman walking in place SIDE PROFILE FACING RIGHT. Each cell same character scale, head and feet baseline aligned, whole body including hat and shoes fits with padding inside each cell. Frames in reading order show 8 successive natural slow walking poses forming one seamless walking cycle. Character: elderly Chinese woman with slightly stooped posture, kind wrinkled face, grey hair under a simple wide brim BLACK HAT, long plain BLACK DRESS, dark comfortable walking shoes. Soft hand-painted gouache illustration, warm muted colors, subtle brush texture, painterly contour matching an autumn countryside storybook. The woman's clothing is black but has subtle warm charcoal folds. Arms gently swing, legs alternate under the skirt, no walking stick, no handbag. NO text, numbers, labels, borders, background, ground, shadows, props or other characters. Not vector art or photorealism. Perfectly regular 4x2 sprite grid for game animation, separate figures never touching adjacent cells.

黑狗提示词：

> Production 2D sprite animation sheet, TRUE TRANSPARENT background, exactly FOUR columns by TWO rows, eight equal cells. SAME small BLACK DOG in every cell, SIDE PROFILE FACING RIGHT, natural walking-in-place cycle in 8 successive poses in reading order, alternate leg extension and ground contact, tail held slightly raised. Friendly older medium-small village dog, softly floppy ears, short black fur with subtle warm charcoal highlights, no collar. All eight dogs same scale and shape, identical baseline in each cell. Entire dog fits in cell with 15 percent padding, tail and nose do not touch neighboring cells. Warm hand-painted gouache on paper brush style matching an autumn countryside illustrated storybook game. NO background, ground, scenery, shadows, text, labels, cell borders, or numbers. Not vector, not photorealistic. Clean transparent edges for use as a sprite atlas.

## 本地 H3 连续视频步态

老妇人不再使用独立姿势拼出的八帧图集。实际产物为 `public/assets/woman-walk-video.png`、`woman-walk-video.json`、`woman-idle-video.png`。本地原片为 `test-results/gait/woman-gait-source.mp4`，ComfyUI prompt ID `fe43a276-1b17-4931-a040-43310e5125d5`。工作流与种子保留在同目录的 `workflow.json`；该目录不公开发布。

首帧由 GPT imagegen 内置工具依据原角色生成，保存为 `test-results/gait/woman-green.png`。提示词：

> Create ONE single full-body reference image of the SAME elderly Chinese woman from the attached sprite sheet, preserve her face, grey hair, simple wide black hat, long black dress, comfortable black shoes, warm hand-painted gouache texture and silhouette. SIDE PROFILE FACING RIGHT, neutral standing pose with one foot very slightly ahead, both feet visibly planted, arms relaxed. Only ONE woman, not a grid or animation sheet. Entire body fits with at least 12 percent padding at top and bottom and generous empty space left/right. Portrait 2:3 composition, woman centered. Background must be perfectly uniform bright chroma green #00ff00 across the whole image, NO floor, shadows, gradients, texture, scenery, border or text. Black clothing must remain black with painterly folds. This image is the first frame for a side-on walking-in-place video, fixed orthographic view. No extra accessories.

视频实际使用本地 MiniMax H3 FL2VA INT8，8-step Turbo LoRA、res_multistep/simple、384×576、124 帧、24fps、seed 2026102601，相同首尾帧。提示词要求固定正交侧面镜头、居中原地行走、脚跟落地与重心转移、保持帽子黑裙和手绘纹理、纯绿背景、无镜头运动与新增人物。未启用超分或双采。当前本机节点不包含 RTX 超分，不套用其他设备的可用性描述。

检查抽帧后选取 20–77 帧（58 帧，约 2.42 秒），统一裁剪框 `[82,40,298,530]`，保留垂直运动与脚底基线，抑制透明边缘绿溢色；动画相位随行走距离变化。步幅初次校准为 56 世界单位/循环，根据脚掌接触区约 3 像素/帧的后移、画面缩放约 150/490 得到约 22–24 世界单位/秒。此为初次视觉/像素校准，最终自然度仍需试玩反馈，不能当作真人动作捕捉。

## 黑狗与待机动作

仍使用本地 H3 FL2VA INT8 + 8-step Turbo、24fps。合格黑狗行走片为 576×384、124 帧、seed 2026102702，prompt ID `9cb2da06-a134-4402-8325-2ef691b0f8f6`；选取 9–40 帧共 32 帧作为循环。步幅 32 世界单位，和跟随距离共同驱动相位。全画布 `[0,0,576,384]` 用于行走及待机，显示画布高 84.24 世界单位，实际犬身约 60，保留尾巴空间。

黑狗首帧由 GPT imagegen 内置工具以原图集为参考生成，存于 `test-results/dog-gait/dog-green.png`。提示词要求同一只黑色乡村犬、灰色口鼻、软垂耳和上扬弯尾、侧面朝右、四爪站立、手绘水粉纹理、单只全身、四周留空、纯 `#00ff00` 背景，无影子、项圈或场景。完整视频提示词与输入图关联存于本地工作流 JSON。

奶奶待机：384×576、124 帧、seed 2026102604、prompt ID `d40cd284-00d8-403a-9182-20845a67856a`，完整播放抬手理耳边头发、放手站稳的动作。共用裁剪 `[50,40,330,530]`，与原行走素材相同缩放比例及水平中心。停止后等待 4.5 秒播放一次，再冷却 13 秒；移动时加速播放放下手的收尾段。

黑狗待机：576×384、175 帧、seed 2026102703、prompt ID `6e089525-2216-43e7-91bd-1d666cb1303c`。提示词要求站立→坐下→摇尾巴、后腿挠脖子→站立。停止后等待 2.5 秒播放一次，再冷却 11 秒；重新跟随前播放起身收尾。素材、执行历史和实际完整提示词保存在 `test-results/idle/`。

首轮 384×256 黑狗行走片出现明显颜色闪烁和局部变形，已拒绝；同尺寸待机在自身任务运行时中断，未继续浪费采样。随后用 576×384 重做，不对失败帧做伪修补。低尺寸仅是本次失败的观察条件，不能据此断言所有低分辨率 H3 都不可用。视频帧不等于完全独立的动作姿势，质量验收仍以连续播放、解剖结构和入场景后的表现为准。
