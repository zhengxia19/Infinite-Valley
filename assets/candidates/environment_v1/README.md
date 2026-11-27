# 开放世界环境素材 V1
已确认 A01–A05 原稿及首张风格场景，原文件保留。candidate/ 是从原稿提取的 13 张32×32底纹（含道路样本）和21张透明精灵，均待用户确认；边缘相等仅证明单张纹理重复时两侧像素相等，不代表任意变体或混合地形无缝。
scene_preview.png 为实际素材的人工布置离线合成，不是游戏引擎截图；河岸、道路角、桥朝向、景物分布、遮挡与碰撞均未验收。
运行 `python build_environment.py`（Pillow、NumPy、SciPy）复现提取和预览；manifest.json 记录来源、裁切、尺寸、候选锚点和校验值。源码输出manifest不含后置的原稿SHA记录，需按现存记录校验。

## 仓库复现
在仓库运行 `python assets/candidates/environment_v1/build_environment.py`（Pillow、NumPy、SciPy）。脚本从 `assets/source/environment/masters_v1/` 读取五组原稿，写入候选 `sprites/`。manifest.json 的源场景校验为本次ZIP保留的原稿，不依赖该场景文件生成素材。若重新运行将重建裁切记录，源原稿校验可另按 masters_v1/README.md 对照；不覆盖正式素材。图集、混合材质拼接、碰撞与Phaser集成未验收。图示为人工布置，不代表桥梁方向、道路连接或实际世界布局通过验收。
