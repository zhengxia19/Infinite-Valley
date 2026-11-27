# 独立遮挡图层 V1（派生候选）
13 种实体、30 张独立透明 PNG；画布和原点完全与原素材一致。建筑 base/roof、树 trunk/canopy、桥 back_rail/deck/front_rail。没有运行时裁剪或重复绘制；按图层合并可见 RGBA 与原图逐像素相同。每张 PNG 已实际编码后解码校验。
原素材保持不变；拆出的图层仅包含源图可见像素，不能恢复被原画遮住的屋顶下方、栏杆背后或树冠内部纹理。轮廓初稿尚有少量碎片；并非可任意隐藏、位移的独立完整原画。新派生素材需用户视觉验收后方可作为正式资产。
详见 manifest.json；复现工具 tools/art/placement_v3/export_layers.mjs。
