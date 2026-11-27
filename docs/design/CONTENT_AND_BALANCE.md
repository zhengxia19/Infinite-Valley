# 内容与数值设计 D07
v1.0 · 2026-11-27 · 内容数量 C19 已确认；下列价格/时间/物品均为设计初值，需 G4/G5 平衡测试
依赖 D06。单位：游戏分钟/日、金币、整数数量。数据文件是实现后唯一数值真源，文档描述原则与初版目录，不在代码硬编码。

## 内容预算
5生态群系、4季、4天气、16作物、4家畜/宠物、8野生动物、12鱼、6工具×3级、20预制建筑/设施、30家具装饰、120物品、60配方、4类商人、5村庄模板、10地标。120 物品计数按可持有唯一 itemId（含三级工具、种子、作物、家具及帐篷）；其余预制建筑、道路、围栏、桥梁为直接消耗材料的建造蓝图，不属于库存物品。活体动物为实体而非库存商品。60 配方指手工/设施制作配方，不重复统计直接建造蓝图、工具升级及交易。附录给出完整120/60设计目录，机器可读JSON与实现仍由G4/G5交付；数值调整记录依据。

## 作物初始表
| ID | 中文 | 季节 | 生长日 | 再收日 | 种价 | 单次产量 | 单价 |
|---|---|---|---:|---:|---:|---:|---:|
| radish | 萝卜 | 春 | 3 | - | 10 | 1 | 20 |
| potato | 土豆 | 春 | 5 | - | 20 | 2 | 18 |
| cabbage | 卷心菜 | 春 | 6 | - | 25 | 1 | 50 |
| strawberry | 草莓 | 春 | 7 | 4 | 60 | 2 | 25 |
| tomato | 番茄 | 夏 | 6 | 3 | 45 | 2 | 20 |
| cucumber | 黄瓜 | 夏 | 5 | 3 | 40 | 2 | 18 |
| corn | 玉米 | 夏 | 7 | 4 | 50 | 2 | 22 |
| watermelon | 西瓜 | 夏 | 10 | - | 55 | 1 | 120 |
| pumpkin | 南瓜 | 秋 | 10 | - | 50 | 1 | 115 |
| carrot | 胡萝卜 | 秋 | 4 | - | 15 | 1 | 32 |
| sweet_potato | 红薯 | 秋 | 6 | 4 | 40 | 2 | 20 |
| peanut | 花生 | 秋 | 6 | - | 25 | 2 | 25 |
| spinach | 菠菜 | 冬 | 4 | - | 15 | 1 | 32 |
| napa | 大白菜 | 冬 | 6 | - | 25 | 1 | 55 |
| wheat | 小麦 | 冬 | 5 | - | 15 | 2 | 15 |
| pasture | 牧草 | 春夏秋 | 4 | 3 | 10 | 2 | 5 |

作物跨季：牧草冬季休眠，春季恢复原生长状态；其他跨出适宜季节枯萎（可清除）。肥料：每格一次，基础肥料成熟产量+1，不能叠加；高级肥料暂不做。种子加工需投入一个成熟作物，2种子，60游戏分钟；种子售价低于采购价，避免直接套利。出货价与商人收购价一致。出售所有可购品应低于购买价；买成品→拆除→卖材料不得盈利。
萝卜初始10粒，全浇水3天产10个，收入200；初始金币200可支付下一轮种子，无死亡/强制开销。正常天气/缺水下收益差异待测试。平衡指标：前3–5游戏日有第一次收获，首次交易不必完成冗长任务；新手在30–60分钟现实主动游玩可完成首个闭环（可睡眠跳日）；目标不是强迫等待。

## 工具和体力
| 类型 | 一级体力/动作 | 二级 | 三级 |
|---|---:|---:|---:|
| 斧/镐 | 4 | 3 | 2 |
| 锄/镰 | 2 | 2 | 1 |
| 浇水壶 | 1 | 1 | 1 |
| 钓竿 | 3 | 2 | 2 |

一级普通木石3次动作、二级2次、三级1次（每次成功扣体力，最终产生资源）；升级作用范围仍受 D06 限制。浇水壶容量20/40/80，二三级允许作用于2/3个相邻合法目标，按每格消耗计算，不能重复扣费。升级二级: 铜锭5+木材10+200金币，三级: 铁锭5+木材10+600金币（工具商人）。熟练度等级1–10，经验阈值累计 20×(level-1)^2，成功操作1点，等级5/10降低非零劳动成本1（最低1）或缩短动作，不让收益无限放大。

## 天气
按 day、seed 固定采样，所有概率和为100：
| 季 | 晴 | 阴 | 雨 | 雪 |
|---|---:|---:|---:|---:|
| 春 | 55 | 20 | 25 | 0 |
| 夏 | 65 | 15 | 20 | 0 |
| 秋 | 50 | 25 | 25 | 0 |
| 冬 | 45 | 25 | 0 | 30 |
出生春1日固定晴。气候不是实际气象模拟。

## 基础经济初值
木材收购2/购买5；石材3/7；野果8/不固定出售；铜矿6/14；铁矿10/22；饲料3/5；鸡蛋18/30；牛奶35/60；羊毛40/70。金币只允许安全整数，禁止负值。加工出售溢价需覆盖时间与材料，非无限套利。野生采集永远可卖；基础工具不可丢售最后一件。

## 20预制建筑与设施（初值占地/成本）
| ID | 名称 | 占地 | 主要消耗 |
|---|---|---|---|
| tent | 帐篷 | 2×2 | 6木+4纤维 |
| cabin | 木屋 | 4×4 | 40木+20石 |
| farmhouse | 农舍（升级） | 5×4 | 80木+40石+10铜锭 |
| coop | 鸡舍 | 3×3 | 30木+10石 |
| barn | 畜棚 | 4×4 | 60木+20石 |
| rabbit_hutch | 兔舍 | 2×2 | 15木+4纤维 |
| silo | 粮仓 | 2×2 | 20木+20石 |
| workbench | 工作台 | 1×1 | 10木 |
| sawmill | 锯木台 | 2×1 | 20木+5石 |
| furnace | 熔炉 | 1×1 | 25石 |
| seed_maker | 种子机 | 1×1 | 15木+3铜锭 |
| sprinkler | 洒水器 | 1×1 | 3铜锭+2石 |
| sprinkler_plus | 高级洒水器 | 1×1 | 4铁锭+2铜锭 |
| shipping_bin | 出货箱 | 1×1 | 10木 |
| chest | 普通储物箱 | 1×1 | 12木 |
| large_chest | 大储物箱 | 2×1 | 24木+2铜锭 |
| compost | 堆肥箱 | 1×1 | 10木 |
| kitchen | 户外灶 | 1×1 | 15石+4木 |
| press | 压榨机 | 1×1 | 20木+4铜锭 |
| loom | 织布机 | 1×1 | 20木+5纤维 |

施工记录保存实际材料账本；升级账本合并已有建筑成本（全返材要求）。帐篷为初始赠品，记录其配方成本作为初始资产；不可重复领取。道路、围栏、门、桥为网格建造品，不计20预制设施。首批家具30种：床2、桌3、椅3、长凳2、地毯3、灯3、书架2、柜2、盆栽4、墙饰2、花坛2、装饰桶1、屏风1（共30）。家具配方采用木材/纤维/石材/布为主，不能复制容器内容。

## 其他内容目录
野生动物：鹿、狐狸、野兔、松鼠、鸟、鸭、蝴蝶、青蛙；鱼：鲫、鲤、草鱼、鲈、鳟、鲶、鳗、鲑、沙丁、鲭、鲷、比目鱼（淡水/海水适配D08）。地标10：古树、巨石、河湾、湖泊、瀑布景观、花田、林间空地、海岬、沙洲、山坡观景点。村庄模板5：河畔、林缘、草地、丘陵、海岸。四商人见 D08。

## 配方与数据合同
首批加工：木→木板（1→1，15min）；铜/铁矿3+木1→对应锭1（60min）；作物→种子2（60min）；纤维2+杂草2→肥料1（60min）；羊毛2→布1（90min）；玉米/番茄→加工品（60min）；牧草1→饲料1（即时）。60配方预算为14基础加工/制作+16种子加工+30家具制作；20预制建筑及自由建造蓝图独立，不将工具升级和购买重复计为配方。每个 recipeId 对应明确 inputs/outputs/station/duration。附录已经按设计口径枚举120/60；实现时用 schema 校验实际JSON与目录一致；余额不足、材料循环套利检测、无来源物品、无用途配方均不通过。
ItemDef: id, category, stackLimit, buyPrice?, sellPrice?, icon, nameKey, descriptionKey；CropDef: id, seedItemId, harvestItemId, seasons, growthDays, regrowDays?, yield, stageSprites；RecipeDef: id, inputs[], outputs[], stationId?, durationMinutes；BuildingDef: id, footprint, door, collision, materials, sprite, indoorTemplate?, tags。使用稳定 ASCII ID，引用完整性自动测试，数值不可为负。G5 实际数据逐项审查，本文初值调整需记录依据。

## 附录 A：120 种库存物品设计目录（已按唯一 ID 计数）

| 类别 | 数量 | ID 规则 |
|---|---:|---|
| 种子与农产品 | 32 | 每个作物表ID生成 seed_<id>、crop_<id>，牧草也分别计种子/产出 |
| 工具 | 18 | axe、pickaxe、hoe、watering_can、sickle、fishing_rod，各后缀 _1/_2/_3 |
| 鱼 | 12 | fish_ + crucian、carp、grass_carp、perch、trout、catfish、eel、salmon、sardine、mackerel、sea_bream、flounder |
| 畜产 | 3 | egg、milk、wool |
| 原料 | 14 | 下表 |
| 加工/其他 | 11 | 下表 |
| 家具装饰 | 30 | 附录B |
| 合计 | 120 | 不计建造蓝图、NPC、活体动物 |

除工具和家具、帐篷（每格1）外普通物品堆叠99。工具升级替换原工具。种子售价为种价的40%向下取整（至少1），作物按上表收购且不向杂货商直接购买。未列可购价的商品只可采集/制作，未列收购价的物品不可交易。鱼价按上列顺序15、20、20、25、40、30、45、60、18、25、35、40金币（待平衡）。所有家具不直接出售；摆放消耗一个对应物品，移动保持实例，拆除返还该家具配方原料，不同时返还成品。普通/大柜为装饰，独立储物设施仍按20预制清单。帐篷按配方成本返还，初始赠品仅一次。原料采集路径：树→木/硬木，石块/地表矿→石/铜/铁/煤，草→纤维/杂草，野果灌木/蘑菇/草药/芦苇/海岸贝壳沙地分别可采。肥料、食物与家畜产出按D06/D08；木板、硬木、绳索、贝壳、沙子用于家具或建筑。石材类道具不要求地下资源。

| ID | 名称 | 收购价 | 购买价 |
|---|---|---:|---:|
| wood | 木材 | 2 | 5 |
| stone | 石材 | 3 | 7 |
| fiber | 纤维 | 1 | 3 |
| weed | 杂草 | 1 | 3 |
| wild_berry | 野果 | 8 | — |
| mushroom | 蘑菇 | 10 | — |
| herb | 草药 | 12 | — |
| reed | 芦苇 | 2 | — |
| shell | 贝壳 | 5 | — |
| sand | 沙子 | 1 | — |
| copper_ore | 铜矿 | 6 | 14 |
| iron_ore | 铁矿 | 10 | 22 |
| hardwood | 硬木 | 8 | 20 |
| coal | 煤 | 4 | 10 |
| plank | 木板 | 3 | 8 |
| copper_ingot | 铜锭 | 21 | 50 |
| iron_ingot | 铁锭 | 33 | 75 |
| cloth | 布 | 90 | 180 |
| feed | 饲料 | 3 | 5 |
| fertilizer | 肥料 | 5 | 15 |
| rope | 绳索 | 4 | 10 |
| juice | 果蔬汁 | 35 | — |
| preserves | 果酱 | 48 | — |
| bread | 面包 | 30 | — |
| tent | 帐篷 | — | — |
| egg | 鸡蛋 | 18 | 30 |
| milk | 牛奶 | 35 | 60 |
| wool | 羊毛 | 40 | 70 |

## 附录 B：30 家具与对应配方
全部 recipeId=craft_<家具ID>，工作台制作、即时、输出1；床有睡眠功能，花坛室外放置，其他按室内模板及合法网格放置。实际 footprint/素材按D03/D09，初值小件1×1、双床/长桌/长凳/大柜/大地毯/屏风2×1，G3/G5校准。墙饰与壁灯占墙面槽，不封堵行走格。家具ID 不与建筑/设施ID重叠。

| itemId | 名称 | inputs（ID:数量） |
|---|---|---|
| bed_basic | 普通木床 | wood:12,cloth:2 |
| bed_comfort | 舒适木床 | hardwood:10,cloth:4 |
| table_small | 小木桌 | wood:6 |
| table_round | 圆桌 | plank:8 |
| table_large | 长桌 | plank:12 |
| chair_basic | 木椅 | wood:4 |
| chair_cushion | 软垫椅 | wood:5,cloth:1 |
| chair_rocking | 摇椅 | hardwood:6,cloth:1 |
| bench_basic | 长凳 | wood:6 |
| bench_stone | 石凳 | stone:8 |
| rug_small | 小地毯 | cloth:2 |
| rug_round | 圆地毯 | cloth:3 |
| rug_large | 大地毯 | cloth:5 |
| lamp_table | 桌灯 | wood:3,copper_ingot:1 |
| lamp_floor | 落地灯 | plank:4,copper_ingot:1 |
| lamp_wall | 壁灯 | iron_ingot:1,wood:2 |
| bookshelf_small | 小书架 | plank:6 |
| bookshelf_large | 大书架 | plank:12 |
| cabinet_small | 小柜 | plank:8 |
| cabinet_large | 大柜 | plank:14 |
| pot_fern | 蕨类盆栽 | stone:2,fiber:2 |
| pot_flower | 花卉盆栽 | stone:2,herb:1 |
| pot_reed | 芦苇盆栽 | stone:2,reed:2 |
| pot_grass | 草本盆栽 | stone:2,weed:2 |
| wall_art | 木框挂饰 | plank:2,cloth:1 |
| wall_shell | 贝壳挂饰 | shell:4,rope:1 |
| flowerbed_wood | 木花坛 | wood:6,herb:2 |
| flowerbed_stone | 石花坛 | stone:8,sand:2 |
| barrel_decor | 装饰木桶 | plank:5,rope:1 |
| screen | 屏风 | hardwood:5,cloth:2 |

## 附录 C：60 配方设计目录
| 基础 recipeId | station | inputs | outputs | 游戏分钟 |
|---|---|---|---|---:|
| saw_plank | sawmill | wood:1 | plank:1 | 15 |
| smelt_copper | furnace | copper_ore:3,wood:1 | copper_ingot:1 | 60 |
| smelt_iron | furnace | iron_ore:3,wood:1 | iron_ingot:1 | 60 |
| smelt_iron_coal | furnace | iron_ore:3,coal:1 | iron_ingot:1 | 60 |
| weave_cloth | loom | wool:2 | cloth:1 | 90 |
| make_feed | hand | crop_pasture:1 | feed:1 | 0 |
| make_fertilizer | compost | fiber:2,weed:2 | fertilizer:1 | 60 |
| make_rope | workbench | fiber:2,reed:1 | rope:1 | 0 |
| press_tomato | press | crop_tomato:2 | juice:1 | 60 |
| press_watermelon | press | crop_watermelon:1 | juice:3 | 60 |
| preserve_strawberry | kitchen | crop_strawberry:2 | preserves:1 | 60 |
| preserve_berry | kitchen | wild_berry:4 | preserves:1 | 60 |
| bake_bread | kitchen | crop_wheat:2,wood:1 | bread:1 | 60 |
| make_tent | hand | wood:6,fiber:4 | tent:1 | 0 |

另16个种子加工配方 recipeId=seed_<cropId>，station=seed_maker，输入 crop_<cropId>:1，输出 seed_<cropId>:2，60分钟；全部作物ID见上表。另30个家具配方见附录B。总计14+16+30=60。建造蓝图独立：20预制设施表（帐篷使用已制成的帐篷物品，农舍升级按材料账本，其他直接扣材料）；自由铺设泥土路（纤维1）、石路（石2）、木围栏（木2）、围栏门（木4）、桥（每水格木3+绳索1，按连续跨度确认），不计配方。加工售价初值需结合投入与时间检查无买卖即时套利；无利可图的加工可用于体力恢复或装饰。优先通过 G4/G5 游戏测试平衡，不为达到数量引入无用途项目。

目录计数检查：120 个唯一 itemId、60 个唯一 recipeId；此为文档设计目录的结构计数，非运行时数据验证。
