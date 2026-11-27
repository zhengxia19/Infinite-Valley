# 唯一世界管理 D28
v2.0 · 管理员专属；依赖D10/D11/D24/D25
正式部署只有一个active worldId+epoch。普通玩家、游客、AI均无创建、删除、重置、改Seed、快进或恢复权限。管理员使用服务器本地CLI（OS权限/独立管理员凭据），不提供公开管理端点；操作审计含操作者、UTC、原因、旧新epoch、备份hash、结果，不含秘密。管理员权限不属于任何游戏角色，AI API不暴露管理工具。
## 状态机
empty→explicit init→active→maintenance→archive/destroy→explicit init新epoch；active→maintenance→恢复同一世界。空库只允许管理员init，普通连接显示未开放。启动/重启不能自动创建新世界；满员拒绝，不新开房间。唯一active约束+进程写锁；所有命令/WS/数据主键校验epoch。玩家退出最后一人仅暂停模拟/时钟，不销毁世界。
## 操作合同（计划CLI，不是当前可运行命令）
world status；world init --seed ...；world maintenance；world backup；world restore --backup ...；world destroy --expected-epoch ... --confirm ...；world resume。init必须无active，seed可自动随机；销毁须维护、停止写入、踢出/撤销旧控制、备份验证、人工二次确认输入worldId+epoch，明确永久后果；归档旧世界，不保留第二活动世界；新世界只能再显式init，生成新epoch、新角色初始包；账号保留，旧资产不能迁入。禁止一键无确认重置。恢复备份先验证版本、完整性、唯一active，禁止并发服务，恢复后轮换连接世代/撤销旧凭据。删除归档属于独立受控保留策略，不给玩家权限。管理者可封禁、撤销会话、处理违规领地，必须有原因审计；不日常任意修改经济或时间。
备份、RPO/RTO、迁移见D11/D14；测试仅隔离实例，绝不在正式世界通过管理接口刷资源。T29验证普通用户/AI越权拒绝、断线最后一人世界保存、重启同seed和修改、双init拒绝、销毁确认、新epoch拒旧包、备份恢复。