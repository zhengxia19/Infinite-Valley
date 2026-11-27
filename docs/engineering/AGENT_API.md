# 正式 Agent API 与本地 MCP D27
v2.0 · 协议设计，尚无运行接口；依赖D24–26/D10
所有人类AI经同一WSS游戏协议及权威dispatcher。Agent SDK供浏览器/Node客户端，本地MCP stdio包装SDK，无服务端MCP执行模型，不依赖CDP。自主AI经正常游客或用户名密码登录；接管需玩家显式授权、一次性短期配对凭证，绑定player/session/worldEpoch/controllerEpoch及范围。密钥不放URL/日志/SKILL。撤销、超时、断线后拒绝旧控制代数；人工接管无须AI同意。
## 信封
CommandEnvelope {protocolVersion,worldEpoch,controllerEpoch,commandId,seq,kind,args,expectedRevision?}；session由认证连接绑定。返回 {commandId,status:accepted|committed|rejected|cancelled,code,revision,gameMinute,result?,retryable}；accepted不代表完成，动作有actionId可查询/取消。错误码 AUTH_REQUIRED/CONTROL_REVOKED/WORLD_CHANGED/OUT_OF_RANGE/BLOCKED/INSUFFICIENT_ENERGY/INSUFFICIENT_ITEMS/INVENTORY_FULL/PERMISSION_DENIED/CONFLICT/RATE_LIMITED/NOT_VISIBLE/NOT_READY/MAINTENANCE。只对同payload同commandId重试；旧epoch或未知过期receipt不自动重放，先观察。事件带worldEpoch/revision/tick/seq，缺口重拉快照。输入schema、数量上限、整数坐标、最大消息64KiB初值，分页。
## 观察接口
| 方法 | 参数/结果 |
|---|---|
| get_player | 本人位置/外观/体力/金币/技能/控制模式 |
| get_inventory | 本人slot、itemId、qty |
| observe_area | radius≤服务端AOI；地形、公开实体id/坐标/动作、可交互状态 |
| get_map | 已探索区域分页、本人标记/住所、公开地标 |
| get_farm_status | 有权限的landId/作物/设施/动物 |
| get_content | 可用物品/配方/建造规则版本，分页 |
| get_world_time | 全局分钟/日期/季节/天气 |
| get_events | sinceSeq/limit≤100；本人及可见事件 |
| get_action | actionId、状态、失败原因 |
不可查询任意坐标未探索对象、他人背包/私有箱子、数据库/管理员状态；公开seed的底图可分析，不主动暴露隐私。
## 动作
move_intent(dx,dy)为低层输入；move_to(x,y)为SDK/本地寻路编排，未知区需逐步探索，实际逐tick移动，不传送。interact(targetId)、gather(targetId,toolId)、till(tile)、plant(tile,seedId)、water(tile)、harvest(tile)、craft(recipeId,qty)、build(blueprintId,tile,rotation)、transfer_item(from,to,slot,qty)、buy/sell(merchantId,itemId,qty)、feed_animal(id)、fish(tile)、rest/sleep、travel(homeId)、claim_land(cx,cy)、trade_offer/confirm/cancel、cancel_action(actionId)、export_profile。所有命令执行同一权限/材料/体力/时间/距离/碰撞检查；注册/游客限制一致。批量命令必须逐项按正常耗时执行，不得原子完成全农场、改时钟、直接发资源或eval；每角色最多1持续动作，移动意图20Hz，离散命令初值5/s burst10，观察10/s，按角色合并人类/AI额度；过载公平限流，模型速度不提供额外游戏速度。正常用户操作也用相同dispatcher。人类夺回优先于动作队列。
## MCP与Skill
本地stdio MCP tools映射上述观察/动作，支持取消和结果轮询，凭据由本地安全配置或交互配对输入。skills/infinite-valley/SKILL.md提供规则/观察→计划→执行→核对，引用D26/D27/D06；不能提供作弊或万能任务接口。真实Agent需自行探索、等待真实日界、处理冲突并验证实际收获。T27/T28、权限越权、重连、速率、事件缺口与幂等为验收；无实际SDK/MCP实现。