# A06-V2 人物技术样本：待视觉验收
2026-11-27。用户确认48×64px显示帧，进一步提高人物像素细节；男女各一套。保留32px地块、已确认造型与唯一共享世界设计。
## 实际交付
assets/candidates/character_v2/{male,female}/ 各14张透明PNG图集及1份atlas.json；图集576×256，12列×4行，南北西东四向；每向4待机+8行走，男女共96帧。每个动作内部的像素数据各不相同；源原稿每向仅4个关键姿势，其余以光流最近邻像素搬运及局部呼吸/摆动制作，不是8张独立手绘关键帧。色板112色（V1 40色）、硬透明、固定锚点[24,61]，基准碰撞0.5×0.35 tile仍待验证。6类同轮廓可见像素层各两种颜色、独立帽子叠加；每体型128种组合状态，不是128种新造型。不具备不同轮廓发型、不同剪裁服装及完整被遮挡身体。原稿为AI生成，未引入第三方图片；生成ID男8640b6db-bbef-4472-8142-c8fa52b27d2c，女3815586e-537e-42bf-91d6-b84438bd6c9a。
## 验证
Python实际执行各方向各动作帧唯一性、硬透明、边界、脚底基线、6层默认合成逐像素还原、变体轮廓一致；独立帽子在帧内。Chromium / Playwright set_content 执行自包含预览，实际通过男女切换、方向与动作、逐帧画布变化、独立换色、帽子穿脱、恢复原装、键盘操作，无JS异常。未执行file://导航、Phaser集成、真机。离线场景比例合成使用旧环境母版裁切，非正式地形或引擎截图。动画过渡自然性、头发/服装分区准确性、帽子风格须人工审阅；不把技术检查等同视觉通过。
## 文件交接与限制
完整交付 Infinite_Valley_Character_V2.zip，4,893,674字节，52文件；SHA-256 1544cb8f8f3ad7bd613b1e6bd335c40253984d3463ee20921b81d54639c3fb86，已验证ZIP完整性。包内含原稿、处理/验证脚本、原始完整atlas.json、组合样图、交互HTML、GIF和验证JSON；GitHub本批将28张实际PNG逐一对照本地Git blob SHA后提交，并按相同帧契约生成2份atlas.json。源原稿、构建处理脚本、测试和预览完整包保留在本次对话交付，尚未在本次提交中归档；后续在可直接访问本地文件的环境中导入并验证。未获得用户对V2实际画面的确认前不迁移至正式素材目录。
## 校验清单（实际PNG的Git blob SHA）
- female/accessory_0.png: c23bbad337152178153f1077c61ffa9dd4dd9411
- female/accessory_1.png: 8f8fa8951c81a254d045fc718a1ec8dad52d320e
- female/body_0.png: a7c92b739601d98f88454e48fffb2745b558f633
- female/body_1.png: d7d4ef3c571879caddf903094469296f33b81edb
- female/boots_0.png: a659074ea9f1d15a8faf811a4279f1c987c7d3e4
- female/boots_1.png: aa33d02a5baeec7db9eb912414043d9d29a47b44
- female/cap.png: a3f130fc1b2d959d29cc6090eb1ed3115b2be90d
- female/default.png: 80c044b99ec71bb51aa334c4b55f161f678143ff
- female/hair_0.png: ad14d2beade51004253d0edbcae1385c6ca0dd78
- female/hair_1.png: fec58bfc7ee4c59c6dd2a7a4961445f1af4c7cbf
- female/lower_0.png: 86255aba53fa0053166accc99b3ebeeb0bba83a5
- female/lower_1.png: dc50156dccc956523dfd4495ed28080f2e43b9e5
- female/upper_0.png: 6437dfe5f9e9a927b860a0328207f097eca42fa1
- female/upper_1.png: 1b0039294f18dc4dee360b0bf8099cc5acacabc6
- male/accessory_0.png: c1547fa1973e00fedb8356bcb2d344d4a345fb97
- male/accessory_1.png: 38e293c9d2f61d5fd75b47fd6e6db694123086d2
- male/body_0.png: 1a996dc8817115ab73e1552535b13cc82f593ec2
- male/body_1.png: f6e5e842455d841b904ef2db6615fb178208697d
- male/boots_0.png: 18dd180cbca62207a81dd5993ea81fbe4e834ac0
- male/boots_1.png: e9a271d1fadab97e941e6aea689ce7fbfd726529
- male/cap.png: b888360f6b6f00d8d93465ad9444859db02c1c66
- male/default.png: 0f6334929df7a6ebf31c5c160260f5b2ce714675
- male/hair_0.png: e928e42f8fcb8f63f32f7d8333957c42d7e7db82
- male/hair_1.png: 937cd8314691ea24310e40e08b71a09575b809d6
- male/lower_0.png: 55125ba357fa29e14b217503f52f64e074d95c3e
- male/lower_1.png: 32ce51a28295830417cbd68e98c7c047b1a4a219
- male/upper_0.png: 887306acd0589a82c4179e9c0bd0834232e4213e
- male/upper_1.png: 192f7c09ea3820de7c6bad97563d348582f595a3
