# 开放世界美术素材选型报告（待用户批准）
2026-11-27。仅研究及实施交接，不代表素材引入、样片验收或更改 DESIGN.md。
## 筛选门禁
原生32px、正交俯视斜角、自然柔和色彩、两组已确认风格、同套建筑/自然/人物；可复用PNG、邻域过渡、动画、季节；必须能依法再分发原始与修改素材。商用许可不等于再分发权。MIT仅适用于项目自身代码，第三方美术依各自许可单独记录。未明确授权不得进入Git。
## 候选比较
| 候选 | 规格及内容 | 授权证据 | 结论 |
|---|---|---|---|
| LPC / bluecarrot16 | 32px；地表、自然、农业、建筑、角色生态 | 各包分别CC BY、CC BY-SA等 | 首选生态 |
| LPC Revised / ElizaWy | 32px；四季、动画水、悬崖、自然物、结构 | 四季包OGA-BY 3.0；结构旧版CC BY-SA 3.0；逐文件复核 | 优先作为首批视觉样片基础 |
| Anokolisa World Building | 32px；森林、作物、外墙、室内外物件、32×64人物 | 当前页面未明确再分发；免费不代表开放许可 | 暂缓 |
| Ellen0ra Forest Tileset | 32px；草地、水、丘陵、树、木屋、室内 | CC BY-SA 4.0；$2.50最低下载价 | 自然备选，未购买 |
| pebonius pastoral overworld | 32px；简单乡村地表、房屋 | CC0 | 轻量备选，动画/素材完整性不足 |
| JaiGod RPG Pixel Pack | 32px；地形、建筑、角色等；Python绘制PNG | 项目声明美术CC0、代码MIT | 备选；成熟度及美术待验证，不引入Godot |
| Pipoya FREE RPG Tileset | 32px；室内外、Tiled示例 | 禁止素材再分发 | 排除公开资产仓库方案 |
| Kenney Tiny Town | 16px | CC0 | 排除当前32px原生视觉 |
## 推荐导入候选（按先后）
1. [LPC Revised 4-Season Terrain](https://opengameart.org/content/lpc-revised-4-season-terrain)：2022；OGA-BY 3.0；四季地表、动画水、瀑布、悬崖、树木、花草、岩石。作者及上游授权见原页。
2. [LPC Revised Fully Configured 4-Seasons Tilesets](https://opengameart.org/content/lpc-revised-fully-configured-4-seasons-tilesets-for-tiled-map-editor)：2024；页面CC BY 3.0，包含2048图集、Tiled terrain sets和建筑独立图集。先复核原始作者及逐文件许可证、碰撞和动画配置；作者说明部分砖路与门未包含，不视为完整成品。
3. [ElizaWy/LPC 原始仓库](https://github.com/ElizaWy/LPC)；[Base Structure Kit](https://opengameart.org/content/lpc-revised-base-structure-kit)：旧版发布页CC BY-SA 3.0；仅选与两组风格相同且授权清楚的木石瓦素材。不能把fork的概括性许可代替源文件授权。
4. 缺口按同一LPC视觉补齐：[Terrains](https://opengameart.org/content/lpc-terrains)（CC BY-SA 3.0/4.0，Tiled地形过渡、草/沙/土/石/水/雪）；[Trees](https://opengameart.org/content/lpc-trees)（CC BY-SA 3.0，落叶树多色变体）；[Conifers](https://opengameart.org/content/lpc-conifers)（页面CC BY-SA 3.0及GPL选项，32px多格树及雪景）；[Farm](https://opengameart.org/content/lpc-farm)（CC BY 4.0，农舍设施、围栏、水车等）；[Crops](https://opengameart.org/content/lpc-crops)（CC BY-SA 3.0/4.0或GPL 3.0，50种5帧作物；个别另有许可，须查CREDITS）。同属LPC也不保证色板/尺度一致；不能无筛选混搭。不引入GPL-only额外山地素材，除非另行批准。
## 实施交接
ART-S01 用户批准候选体系；若原始两组参考无法取回，必须先核对样片，不能用新网页截图替代已确认锚点。
ART-S02 联网Agent从作者原始页下载，记录URL、日期、版本、SHA256、压缩包许可及逐文件CREDITS；资产许可清单含assetId、sourceFile、author、license、sourceUrl、modifications、licenseRef。未明示再分发的文件隔离，不提交。CC BY署名、许可链接和修改说明；CC BY-SA衍生美术按适用同许可再分发，独立记录，不用MIT覆盖；OGA-BY按文本及源授权执行。保留源文件，登记THIRD_PARTY_NOTICES。
ART-S03 第一批仅选草地、泥土、沙岸、浅/深水、丘陵/悬崖、树/灌木/草花、石头、木桥、一座木屋、围栏、1角色；缺失标注，不采用第二风格。建立32px逻辑网格与像素尺寸映射、atlas、frame、anchor、footprint、collision、occlusion、season、animations。角色32×48是现有设计，若源图不同先按实际帧/透明边界与比例评估，变更须批准。沿用D09图集尺寸预算和2px挤边。
ART-S04 从TSX/TMX读取Wang/terrain规则或逐项映射到D05世界坐标及多材质过渡。当前generator.ts单材质邻域mask不足以表达所有混合地形，不能宣称自动兼容；补足邻域材质、边角和层级语义，确保同坐标确定性及跨chunk接缝。地形/碰撞权威独立于美术。
ART-S05 当前环境可运行离线合成（获取真实PNG后）：固定seed、时刻、镜头生成自然场景和农场对照样片，输出PNG、渲染参数、素材清单与边角覆盖测试；离线合成不算Phaser运行验收。不把示例图、概念图、占位矩形冒充实际素材。
ART-S06 用户验收视觉后才批量制作；后续联网Agent按D10/D16接入Phaser、验证实际浏览器场景、真实设备、动画及性能，遵循ART01–05。未实际执行的测试不得标通过，每次修改提交并回读。
## 其他来源（核对日期同报告）
- https://anokolisa.itch.io/world-build-pack
- https://ellen0ra.itch.io/forest-tileset-houses-interior
- https://opengameart.org/content/pastoral-overworld
- https://github.com/JaiGod/rpg-pixel-pack
- https://pipoya.itch.io/pipoya-rpg-tileset-32x32
- https://kenney.nl/assets/tiny-town
- https://github.com/OpenGameArt/LiberatedPixelCup
- https://github.com/justgook/LPC-rework （候选fork，不代替原始作者）
## 当前证据与限制
公开发布页调研已完成；未下载、购买、引入、逐文件检查PNG或实际渲染，未验证完整素材/动画/边角映射。原始确认参考图未归档，风格只能按DESIGN.md文字初筛。选型置信度中，公开许可文字高（具体文件仍待审计）。本报告不是正式ADR；等待用户批准后开展ART-S02，不改变现有G3门禁。
