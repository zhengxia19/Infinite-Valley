# 共享世界数据及持久化 D11
v2.0 · 替代本地权威存档，依赖D24/D25/D28/D10
服务端SQLite唯一权威：Seed+generatorVersion重建原始地形，保存共享修改及注册角色，浏览器IndexedDB仅公开缓存/设置。无客户端存档上传覆盖，无独立世界副本；注册跨设备恢复同一世界最新状态。游客临时服务器记录到最终退出清理。
| 表 | 约束/数据 |
|---|---|
| worlds | worldId,epoch唯一；仅一个active；seed、generator/content/schemaVersion、gameMinute、revision |
| accounts | accountId、normalizedUsername UNIQUE、password/recovery hash |
| sessions | tokenHash、account/guest、expiry、revoked |
| players | epoch,playerId；注册(epoch,accountId)唯一；位置/空间、体力、金币、xp、外观、controllerEpoch、状态 |
| inventories | epoch,ownerKind,ownerId,slot；物品ID、qty非负、容量 |
| claims,claim_acl | epoch,cx,cy UNIQUE；owner、revision、grantee/scopes |
| chunk_deltas | epoch,cx,cy；removed/respawnAt、partialHarvest、地块修改、revision、lastSettledDay |
| structures/interiors | epoch,instanceId；owner/land、footprint、门、建造成本账本、家具/容器 |
| crops/animals/facilities | epoch,instanceId；owner/land/parent、进度、结算时间 |
| exploration/homes | epoch,playerId；个人探索bitset、标记、住所 |
| trade_offers | 双方、条款版本、确认状态 |
| command_receipts | epoch,playerId,commandId UNIQUE；payloadHash/result/revision/expiry |
| audit_log | 管理、权限、安全事件，不含密码/token |
业务主键均含epoch，稳定contentId，生成资源ID来自seed/坐标/version；FK/CHECK/唯一约束，跨区建筑足迹统一事务。不存未修改底图；清理可重算delta但不删玩家修改。原生成器版本保留，升级迁移先备份。
## 事务
WAL、foreign_keys ON、synchronous FULL初值；单writer dispatcher预检权限/控制epoch/版本/余额/容量→计算diff→写全部受影响记录和receipt→commit后ACK/broadcast。事务失败不改权威内存或重载；同commandId+payload返回同结果，不同payload拒绝；幂等窗口24h初值，过期命令禁止自动重放。关键经济/资源/建设/ACL/交易/升级/清理和日界立即持久；非经济位置每30秒及退出保存，崩溃最多回最近位置保存点，不回滚已ACK经济。离屏按lastSettledDay/minute结算一次。
## 游客/导出
游客过期事务先撤销会话、控制、逻辑资产及占地权限，物理删除可分批且重启恢复；任何清理不回滚公共资源变化或他人状态。注册原地原子升级，角色ID不变。个人导出为服务器一致JSON报告，仅本人可见/拥有/获授权数据，无凭据、他人秘密；生产不接受导入资产。只有管理员从受控全库备份恢复；原有.ivsave玩家恢复契约废止。
## 备份与故障
SQLite在线备份API或停止写入后可靠备份，禁止运行时只cp主db忽略WAL；每日异盘备份，保留7日+4周初值；迁移/换代前强制备份、校验完整性与hash、记录worldId/epoch/版本。备份含认证数据，限制访问加密保存。灾备RPO24h/RTO30min为目标；正常进程崩溃已ACK持久操作不丢（非硬件绝对保证）。磁盘满/事务失败停写维护；恢复验证后重开、撤销旧连接/控制凭证，禁止客户端缓存补权威。迁移在副本测试，失败保留原库。
SAVE01跨设备/重启、SAVE02并发与幂等、SAVE03故障不ACK、SAVE04游客升级/退出、SAVE05备份/迁移、SAVE06导出隔离、SAVE07旧epoch拒绝及唯一active。未执行。