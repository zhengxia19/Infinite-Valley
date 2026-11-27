# 权威共享世界技术架构 D10
v2.0 · 2026-11-27 · 替代单机架构；参数及版本待G3验证
## 技术路线
Phaser4+TypeScript strict+Vite（已确认）；服务端选Node.js LTS+Colyseus，使用其支持的同源HTTP路由与WSS，SQLite本地SSD/WAL单写者。具体版本与路由、驱动兼容性在G3实测锁定。Nginx HTTPS，IndexedDB仅缓存公开底图/设置，不是权威存档。PWA仅静态资源缓存；正式玩法必须联网。无Redis、第二游戏引擎、分片、多正式世界、服务端GPU或LLM。初期单进程单世界。
## 模块
src/client（Phaser/DOM/预测/Worker）、src/server（唯一WorldRoom/auth/session/admin/persistence）、src/simulation（纯TS权威规则/碰撞/时钟/命令）、src/world（纯确定性生成器）、src/protocol（schema/错误码）、src/content、src/agent（SDK、本地MCP）、tests、skills/infinite-valley。客户端/UI/AI→协议→服务端dispatcher→规则→事务→事件，客户端不能提交最终状态。simulation不依赖Phaser/DOM/SQLite/Colyseus；生成器可共用，不为每人建实例。
## 唯一世界
数据库唯一active worldId+worldEpoch，管理员CLI显式创建，Seed及生成器版本固定。服务启动只加载既有世界，空库拒绝普通加入；关闭autoDispose，禁止客户端joinOrCreate、满员新建room或自动重建；进程锁防双写。所有人类AI共享全球整数坐标。底图F(seed,version,x,y)+权威共享delta；同一个坐标只存在一份实际状态。房屋内部只是同世界空间实例。正式世界与隔离测试数据库不可混用。D28管理生命周期。
## 调度与命令
服务器20Hz固定步进初值，权威脚底碰撞/4tile/s移动速度；客户端30/60FPS预测插值。移动意图20Hz、300ms失效归零；失焦/断线/夺回控制权取消未提交动作。全局时钟1现实秒=1游戏分钟，有有效在线角色才推进，无人/维护/停机暂停；严重阻塞暂停维护不跳过日界。NPC2–5Hz、农业日界结算、纯装饰客户端执行。
CommandEnvelope {protocolVersion,worldEpoch,controllerEpoch,commandId,seq,kind,args,expectedRevision?}；身份来自连接，不信任payload玩家ID。持久命令串行预检、原子事务、提交后ACK，幂等receipt；旧epoch/重复冲突/权限/速率不合法拒绝。移动不逐帧落盘；经济/建造/采集/ACL/交易/日界立即持久。服务器接收顺序解决资源竞争。客户端预测不得改库存。
## 空间兴趣管理 AOI
每角色基础3×3活跃/5×5加载、视口上限49；服务器计算所有玩家范围并集及引用计数，重叠模拟一次，远区卸载；注册者离线资产按全局时间惰性结算，不遍历无限地图。Colyseus Schema仅全局小元数据，附近实体/地块通过显式定向snapshot/delta/event，私有库存/箱子/权限只发授权客户端，不广播全世界。chunkRevision缺口请求对应chunk全量；worldEpoch旧包丢弃。客户端Worker可重建公开base、路径规划、装饰，不能创造资源；服务器权威生成器验证占地/资源。服务器Region LRU、未提交dirty不得驱逐。局部坐标rebase避免GPU精度问题。出生公共区不可圈占；所有玩家在同坐标相遇。公开seed可被外部分析，不承诺地貌保密，正式观察API不主动暴露未探索资源。
## 网络与控制
HTTP认证、游客、恢复、导出；同源cookie/CSRF/Origin，短时一次性WS连接凭证。AI经相同协议，SDK和本地MCP stdio，不依赖注入浏览器，不在站点运行模型。唯一controllerEpoch、显式授权、可撤销，人类夺回先撤销AI旧队列；已提交操作不回滚。D24/D27详细约束。所有请求schema/大小/频率验证。SQLite故障停止持久写，不谎报保存；重连取最新状态，客户端缓存不回滚世界。
验收ARCH01纯规则、ARCH02唯一世界/epoch、ARCH03权威时钟/并发、ARCH04AOI隐私、ARCH05图形/模型客户端、ARCH06人类AI同规则、ARCH07持久故障恢复。