# Placement V3 — 独立遮挡与多材质自动拼接

## 独立遮挡
- 派生素材：`assets/derived/environment_layers_v1`，13 种实体、30 张透明 PNG，保留源素材尺寸和锚点；104823 个可见 RGBA 像素逐像素无损分配。
- 建筑 base/roof，树 trunk/canopy，桥 back_rail/deck/front_rail。真实 PNG 顺序合成，无运行时裁切。桥上人物在前后栏杆之间。
- `previews/occlusion.png` 与 `previews/bridge_occlusion.png`：上行为人物置于实体之上的错误顺序，下行为分层遮挡。四种桥均存在实际遮挡像素；建筑与树各一项固定位置验证。
- 局限：这是对可见源像素的语义拆分，不是隐藏表面重绘；部分轮廓碎片仍需精修。不能保证独立移走屋顶/栏杆时露出的隐藏表面完整。正式替换须视觉验收。

## 地形自动拼接
- `src/world/terrain-stitch.mjs`：纯数据输入、全局像素坐标、32px 逻辑格、7 种材质、连续权重和水深过渡、道路仅覆盖非水格，输出 RGBA；不修改既有权威地形及碰撞。
- 八个真实纹理输入。2401 个四格材质交汇权重验证（非 2401 张实际渲染图），512 个二值邻域实际栅格测试，36 个分区栅格与整图对比、147456 个像素逐一比对，覆盖正负 1024px 区块边界及 3 个种子。
- `previews/terrain.png` 为真实纹理固定验收布局，非正式世界截图。水岸仍有网格形态及镜像重复纹理，视觉和正式性能待验收。尚未接入 Phaser；当前模块独立于引擎，并非已经替换正式世界渲染。

## 复现（仓库根目录，Node）
```bash
node tools/art/placement_v3/export_layers.mjs . /tmp/iv-layers
node tools/art/placement_v3/test_and_render_terrain.mjs . /tmp/iv-v3
node tools/art/placement_v3/render_occlusion.mjs . /tmp/iv-v3
node tools/art/placement_v3/render_bridge_occlusion.mjs . /tmp/iv-v3
```
本轮通过隔离 JavaScript 运行环境实际执行对应函数及真实 PNG 输入；未运行上述 Node CLI 或浏览器/Phaser。验证 JSON 记录实际结果。未更改源 PNG、世界逻辑或正式客户端。
