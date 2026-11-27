# 数据与存档设计 D11
v1.0 · 2026-11-27 · 契约初稿，G3验证事务与迁移
依赖 D05、D06、D08、D10。IndexedDB 本地存储，不保存未修改底图，不引入服务器。

## 版本与标识
worldId/instanceId 使用 UUID（实例创建时生成并持久）；生成对象ID由固定seed+generatorVersion+坐标派生。contentId 是稳定ASCII string；不得复用已删除ID。世界记录 formatVersion、schemaVersion、generatorVersion、contentVersion、worldId、seed、name、gameMinute、createdAt/updatedAt（UTC仅显示，不驱动模拟）、revision。generatorVersion 决定初始底图，旧存档始终保留旧生成器或明确验证过的迁移，禁止用新版直接覆盖。未知版本只读提示或拒绝导入，保留原数据。

## IndexedDB v1 逻辑 stores
| store | key | value |
|---|---|---|
| worlds | worldId | 元数据、headRevision、previousRevision、seed及版本 |
| records | [worldId,kind,id,revision] | 玩家、日历、住所、区块增量、室内、箱子、动物、设施记录的版本值/墓碑 |
| heads | [worldId,kind,id] | currentRecordRevision、previousRecordRevision 或墓碑 |
| snapshots | [worldId,revision] | 上一保存点变更索引、校验元数据 |
| settings | key | 语言、音量、键位、图形档，与世界分离 |
| locks | worldId | writer token、leaseExpiry、epoch（仅跨标签协调，不是游戏时间） |

records 存结构化值/typed array，chunkDelta key = "cx,cy"，每条包含 removed/respawnAt、partialHarvest、tileOverrides、建筑引用、explored 1024bit bitset、lastSettledDay。建筑和动物/容器主数据独立，不在多个区块重复保存完整实例；占地索引可重建。玩家记录位置（地表或室内instance）、体力、金币、经验、背包格、主要住所、工具等级、钓鱼 attempt counter。crop记录 growthDays/wateredDay/fertilizer；设施队列、动物产出与出货箱有 lastSettledDay/lastProcessedMinute，防重复结算。地图标记/探索摘要按区块。状态清理只删能按原生成器重建且没有玩家修改的过期 delta。

## 事务策略
运行时 GameSession 单写；每30秒自动保存，睡眠/交易/建造/迁移住所/导出/退出额外触发，禁止多笔保存并行。dirty version tracking 获取一致快照（短暂冻结命令），序列化在事务前完成；readwrite 事务覆盖 worlds/records/heads/snapshots/locks。读取锁 token/epoch 与 headRevision，若不匹配中止；写新revision所有 dirty记录和删除墓碑，更新 heads 的 current/previous 指针、保存变更索引、更新 world head 最后提交。只有 transaction complete 才显示“已保存”；中止则保留上一有效revision、dirty标记与当前内存状态。写期间发生更新按新 dirty generation 下一次保存，不能错误清空。采用 durability strict 若支持，不宣称抗硬断电保证。
保留最近两个完整逻辑保存点：对本次未变更记录，previous snapshot 继续引用同一 current；对本次变更项，通过 snapshots 的变更索引回到前一指针。清理在另一个事务中，只回收两个可达版本都未引用的记录；不允许每30秒复制全量探索地图。恢复检查引用、版本、数量与状态约束；当前损坏则尝试previous并明确提示损失，不覆盖原件。普通导出前先成功保存；使用完整一致revision读取，不从多个不同提交拼接。若写入失败，另提供明确标注“紧急未保存快照”的导出：暂停命令，基于当前已读的完整有效revision叠加内存dirty记录及墓碑，生成一致的独立文件；不写回数据库、不显示已保存；失锁时只能导入为新世界。若基础记录不可读取则提示无法完整导出，同时允许导出最后仍可读的已保存版本，严禁静默省略记录。

## 跨标签与生命周期
优先 Web Locks API 对 worldId 加排他锁；仍通过数据库内 epoch+revision CAS 防旧会话写入。无 Web Locks 时 IDB 事务原子取得带租约的 writer token；每10秒心跳、30秒租约初值，恢复页面检查token和revision；失锁暂停写入并提示另一个窗口已打开，允许导出本地未保存状态到新世界，不覆盖已提交记录。标签后台不保证计时/卸载保存，进入hidden时尽早保存与暂停；已完成提交才有保证，不依赖beforeunload 异步任务。
浏览器配额用 navigator.storage.estimate（若支持）提示，persist 在首次保存后主动申请，失败不阻止游玩；private mode/清站点/换域名可能丢存档。QuotaExceeded停止新持久操作/清理可重算缓存并提示导出，不删除玩家存档；禁止静默覆盖。关键操作保存失败期间不继续交易/传送等破坏一致性的动作，提供重试、导出、退出确认。

## 导入导出
文件 .ivsave，v1采用UTF-8 JSON（可选gzip以后再评估），含 manifest{formatVersion,world,recordCount,checksum} 和 records；checksum SHA-256 对固定序列化字节计算，用于完整性不是签名。导入只解析数据，不执行脚本/URL/HTML；检查文件体积（初始上限100MiB、记录数及深度限制，G3根据配额修订）、schema、版本、唯一键、坐标范围、整数非负、内容ID、交叉引用和checksum；未知字段按 schema 规则处理。先暂存并验证，原子导入为新worldId，重映射外层worldId，内部实例关系保持。重复导入不得覆盖旧世界；删除需明确确认，不级联其他世界。迁移在副本中执行并测试从旧版本到新版本，失败保留原文件。发布时同时测试向前迁移和旧版拒读新档。
验收 SAVE01 刷新/强退（最后成功保存点）/离屏资源；SAVE02 写事务abort/配额不足不丢旧档；SAVE03 两标签CAS防覆盖；SAVE04 导出→清站点→导入状态hash相等；SAVE05 旧生成版本底图不变；SAVE06 损坏/恶意导入拒绝、上一保存点可恢复；SAVE07 模拟写失败和失锁，紧急导出可独立导入且不覆盖现有世界。
