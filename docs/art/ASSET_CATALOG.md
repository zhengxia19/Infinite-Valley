# 美术资产目录与验收状态
2026-11-27。区分原稿视觉确认、裁切候选、实际引擎验收；不把原稿或自动技术检查认作生产完成。按用户批准的自主生成路线，LPC仅供流程研究，不引入其图片。32px地表、48×64px人物及原有两组视觉方向不变。

| 编号 | 类别 | 原稿/候选 | 仓库位置 | 下一步 |
|---|---|---|---|---|
| A01 | 地表 | 原稿已确认；8基础纹理候选 | masters_v1/a01_terrain.png；environment_v1/sprites | 各材质交界和角落、变体间接缝 |
| A02 | 水体河岸 | 原稿已确认；4水纹候选 | masters_v1/a02_water.png；environment_v1/sprites | 岸线自动拼接、水流及瀑布动画 |
| A03 | 树木 | 原稿已确认；5精灵候选 | masters_v1/a03_trees.png；environment_v1/sprites | 四季、树冠树干遮挡、资源状态 |
| A04 | 自然装饰 | 原稿已确认；9精灵候选 | masters_v1/a04_props.png；environment_v1/sprites | 更多变体、足迹、资源状态 |
| A05 | 建筑道路 | 原稿已确认；7精灵及1道路纹理候选 | masters_v1/a05_buildings.png；environment_v1/sprites | 屋顶遮挡、桥向、路口及碰撞 |
| A06 | 玩家/AI人物 | 男女基础V2已视觉验收，农事三动作原稿已确认 | assets/source/characters/character_v2、farming_actions_v1 | 裁切农事动作再验收；更多动作、真正换装、引擎集成 |
| A07 | NPC | 概念风格已确认 | 未入库 | 职业及独立动作 |
| A08 | 农作物 | 待制作 | — | 16种及生长阶段 |
| A09 | 动物 | 待制作 | — | 动作、方向 |
| A10 | 家具室内 | 待制作 | — | 层级、足迹 |
| A11 | 物品工具 | 待制作 | — | 图标与工具动作层 |
| A12 | 环境特效 | 待制作 | — | 水、天气、昼夜 |
| A13 | 游戏UI | 待制作 | — | 双端与双语 |
| A14 | 音频 | 待制作 | — | 生成与授权登记 |

masters_v1 = assets/source/environment/masters_v1；environment_v1 = assets/candidates/environment_v1。候选34张PNG（13底纹+21精灵），另2张实际离线预览、提取脚本、manifest。单图块重复时对边相等不保证任意变体混合或跨材质无缝。锚点和比例初值未验收；场景为人工布置的素材诊断，不是程序化生成或引擎截图。五组母版原字节归档；首张风格场景原PNG未能通过传输，保留在交付ZIP。后续所有素材需用户视觉确认再转正式运行资产。不得宣称G3视觉门禁完成。
