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
