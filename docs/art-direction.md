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


## 并脚站姿与独立待机节奏（2026-10-26）

新站姿首帧由内置 imagegen 基于同一奶奶参考图修改：保留黑帽、黑裙和人物身份，只要求双脚自然靠近、双鞋位于髋部下方、手臂下垂。原图和本轮工作流保存在本地 `test-results/idle-v3/`。

奶奶新视频仍用本机 MiniMax H3 INT8 + 8-step Turbo，384×576、124 帧、24fps，相同首尾站姿。整理头发 prompt ID `e325e5b7-d4a5-43b4-9397-8fc2fbd46b2b`；抬头远望 `339247e1-7289-4976-8e70-0a63e34a28ef`。抽帧确认两脚始终靠近，手或头的动作结束后恢复初始站姿。两段共用 `[50,40,330,530]` 裁剪及 150 显示高度，首尾脚底基线均为 516 像素。

调度使用各自随机等待与冷却，禁止连续重复同一动作，两个角色起动作至少间隔 3.2 秒。奶奶首次等待 5–16 秒、冷却 14–25 秒，狗首次等待 2.5–15.5 秒、冷却 9–22 秒。这里限制的是起动作时刻，允许自然的短暂重叠。行走和打开菜单不推进等待动作，待机后移动先完成加速收尾。


黑狗新增低头嗅闻、侧耳倾听两段视频：576×384、124 帧、24fps，prompt ID 分别为 `cd2fc278-9a18-46a1-b610-ea4ffcc5dd96`、`35f649a0-2c26-43de-b4e3-fe598c337544`。原先两个尚未开始的 384×256 排队任务已删除，未执行；保留替换记录避免重复。检查连续抽帧后采用完整动作，共用 `[0,0,576,384]`、84.24 显示高度与原黑狗相同脚底锚点。新图集均为 RGBA 且长宽不超过 4096。两段均未见此前低尺寸素材的明显毛色闪烁或解剖变形。


## 黑狗行走闪跳修正

原行走片选择的 32 帧中，相邻帧近乎成对重复，直接切换时实际姿势更新接近 12fps。保留原 `dog-walk-video.png`，用本机 OpenCV 的双向 Farneback 光流从每对的首帧制作四个过渡时刻，含末帧回首帧边界，输出 `dog-walk-smooth.png`：64 帧、48fps、2016×1920 RGBA。仍源于原连续视频，步幅 32、缩放、裁剪和脚底锚点保持一致。

`scripts/smooth-gait.py public/assets/dog-walk-video.json public/assets/dog-walk-smooth.png` 可复现，依赖 OpenCV、NumPy、Pillow；本机通用 Python 已有依赖，未修改 ComfyUI 推理环境。元数据保留输入信息，重复执行仍使用原图集。

运行时对相邻光流帧按距离相位混合，在预乘 alpha 空间处理透明轮廓，降低硬切与暗边。待机恢复普通采样。相同 80 个采样时刻、单周期、288×192 中性背景 GPU 对比中，帧间 RGB 平均绝对差的最大值从 8.73 降到 2.49，约下降 71%；这是画面差分指标，不代表用户主观评分。高倍放大仍可能看到光流的局部软化，原视频毛发的细微变化并未完全消除。


## 第二章院落与护理画册

`public/assets/jujube-courtyard.png` 使用内置 imagegen 工具，以当前 `village.png` 作为风格参考生成。人物继续使用现有连续视频素材，未生成独立新姿势。护理页的分枝、果实和点击示意为 SVG，提供清晰的鼠标、触摸和键盘目标。

最终场景提示词：

> Create a NEW background painting for chapter 2 of this exact painterly storybook game, matching the reference's textured gouache, warm paper, golden light and muted olive greens. Wide landscape 16:9. Chinese Loess Plateau village courtyard, intimate quiet rural family garden, distant grey green hills and simple clay plaster courtyard wall with old wooden gate. A mature JUJUBE tree with a slender gnarled trunk, small oval leaves and small reddish brown jujube fruits occupies the RIGHT third, trunk centered at x=1250 of a 1600-wide world. Crown upper right between x=850 and1550, visible distinct branches. A woven basket and low stool under the tree, small potted plants by wall, warm sunlight through canopy. Clear gently curving walkable dusty path across the entire image from left at y=635/900 to right at y=660/900, dipping to y=700 in middle. Foreground grasses below path. Upper LEFT third keep pale open wall and sky without busy details for game's text overlays. Plenty of room for characters to walk, same side-on camera height as reference. Quiet tender remembered childhood afternoon. No humans or animals, no text, no UI, no border, no photorealism, no 3D, no European red-roof villas. This is a clean empty environment; the game renders elderly woman and black dog independently.

园艺依据：

- [第二师铁门关市田间课堂，2026-06-12](https://www.tmg.gov.cn/qczl/37t/tcxx/203093.htm)：先确认成年与健壮树势，弱树和幼树不作为环剥对象。游戏只画出位置示意，不复制刀口与操作参数。
- [湖南省林业局：枣树栽培技术](https://lyj.hunan.gov.cn/lyj/tslm_71206/ctpf/zpjs/201512/t20151227_2587180.html)：观察并选择枯弱、交叉重叠、病虫枝等疏剪对象。
- [湖南省林业局：枣树夏季怎样管](https://lyj.hunan.gov.cn/tslm_71206/lykp/syjs/201512/t20151227_2615023.html)：疏果与改善通风透光。仅采用这些原则；未采用页面的历史药剂和剂量。

异常簇生只是观察线索，游戏不凭单一外观断言病名，也不描写立刻治愈；叙事落点是记录、请人确认、持续照料。


## 行走节奏调整

试玩反馈走路偏慢后，将角色行走节奏设为原素材的 1.5 倍，奶奶速度从约 23.17 提高到 34.76 世界单位/秒。步幅、人物显示尺寸和场景取景保持原校准，动画仍按实际移动距离推进，所以步态随速度一起加快。黑狗跟随响应也乘同一倍率，维持跟随距离。`playbackRate` 与原片 `fps` 分开记录，避免混淆源视频帧率。

## 完整旅程后半程场景

内置 imagegen 以 village.png 为风格参考，生成 school-moon、village-road、xian-campus、taiyuan-jinci、shanghai-street、shanghai-studio、old-school 七幅背景。最终提示词保存在 docs/chapter-scene-prompts.json。构图沿用水粉笔触、暖纸、右侧叙事地点、连续步行前景；没有烘焙人物、动物、文字或 UI。

原始 PNG 保存于本地 test-results/full-art/，运行使用同名 WebP，质量 90。七幅合计从约 22 MB 减为约 3.7 MB。每次只载入所在章节，缓存少量近期背景并释放过期纹理。玉米段使用白天村路，月亮段切为夜间学校，重温也按段落切换。

骑行、模型、制图、绘画和长卷为代码原生互动示意，没有用独立生成的姿势代替连续人物动作。原抠绿、世界缩放和脚底锚点保留。画作保存为笔触，自我介绍始终按纯文本显示；尾声纸牌按玩家的排列顺序出现。


## 手绘道具替换（2026-10-27）

使用内置 imagegen，以村庄背景为风格参考，逐件生成真实 alpha 的水粉道具：核桃、红枣、青枣、玉米、竹篮、剪枝剪、书包、画册、孜然夹馍、盆花、绘画工具，以及宿舍和合住两组生活物件；骑行另有自行车、摩托车、石块、水洼，共十七组。完整最终提示词见 prop-prompts.json。

原始图保留在本地 test-results/prop-source/。scripts/prepare-props.py 验证真实透明通道，仅整理透明留白与运行尺寸，输出无损 WebP 到 public/assets/props/，并核对重新解码的 alpha 与打包前一致。一般道具为 384×384；骑行车辆、石头、水洼按透明轮廓紧裁切，长边 768，绘制保持原比例。骑行画布按显示尺寸和屏幕像素密度设置实际分辨率（最高 3 倍），避免高分屏拉伸模糊。没有抠除伪棋盘底或把背景色烘焙入图片。manifest.json 记录尺寸、源轮廓和资源体积。

核桃使用 Three.js 透明贴图；枣保持原 44 像素点击区域，选中后淡出实际果实；玉米改成可直接点击的图像卡片，篮子与书包帮助表达暂存物件。画册、夹馍、生活用品、花与绘画工具进入对应记忆页。骑行在原车道和碰撞逻辑上绘制生成的车辆、石块、水洼，图片准备好后才可出发；不新增独立人物姿势。
