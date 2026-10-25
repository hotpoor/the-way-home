# 来时的路 · The Way Home

一位穿黑裙、戴黑帽的老妇人，带着一条黑狗，以年老的姿态重新走过姑娘时代。基于 Three.js 的绘本叙事游戏，当前为第一章可玩原型。

## 本地运行

需要 Node.js 22+。

```sh
npm ci
npm run dev
```

`npm test` 检查存档；`npm run build` 生成静态产物。GitHub Pages 通过 Actions 自动构建，支持仓库子路径。

## 试玩

点击启程，点击小路或使用 A / D、方向键行走。走到右侧核桃树下，按 E 或点击互动按钮敲树。敲落三颗核桃，在落点附近拾取，完成第一段回忆。手机可使用方向按钮及互动按钮。声音默认关闭，可手动开启合成提示音。

进度存入当前域名的 localStorage（`the-way-home.save.v1`）。手记支持导入、导出和重置；无服务器、无账号、无跨设备自动同步。清除浏览器数据会丢失本地存档。

## 当前边界

- 已实现：绘本背景、独立动画角色、跟随犬、落叶、核桃树互动、回忆页、存档。
- 角色仍为程序绘制的首版剪影；背景是单幅绘画，尚未拆成独立可移动山坡。
- 后续人生章节、枣树护理、骑行、建筑小游戏尚未实现，详见 [设计文档](docs/game-design.md)。
- 无视频模型调用。Qwen Image、MiniMax 视频、二次采样加速和超分是待验证的制作选项，不是已接入的服务。

## 美术

`public/assets/village.png` 使用 GPT imagegen 内置工具生成，以用户提供的秋日乡村画作作为风格参考。提示词见 [美术记录](docs/art-direction.md)。参考图归原作者所有，公开仓库不包含原始参考图片。生成场景用于当前原型，发布商业版本前继续整理资产来源。

## 开发参考

参考 [awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) 的相关流程，具体采用项记在设计文档中。游戏运行时不依赖该技能仓库。
