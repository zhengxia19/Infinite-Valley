# 技术架构 TDD · D10
v1.0 · 2026-11-27 · 设计基线，未完成原型
依赖 D02、D04–D06、D08。目标为单一引擎、客户端本地、可维护可测试。不做通用游戏引擎。

## 技术栈
Phaser 4（WebGL）、TypeScript strict、Vite、HTML/CSS DOM UI、IndexedDB、Worker、Web Audio、PWA、Vitest、Playwright、GitHub Actions、Nginx HTTPS。Phaser 4 为用户已确认，具体4.x及Node/Vite版本在G3通过官方版本兼容检查后锁定 package-lock.json，不擅自回退3.x。无React/Vue、WASM、ECS、额外物理引擎、服务器数据库、运行时LLM。WebGL不可用显示明确提示，不维护第二渲染实现。

## 模块与所有权
```
src/
  app/            bootstrap、世界会话、页面生命周期
  ui/             DOM、控制映射、i18n
  render/         Phaser scenes、camera、tilemap、sprite、audio
  simulation/     GameState、clock、commands、rules、collision
  world/          coordinates、generation、chunk manager、settlement
  worker/         地图生成消息入口
  content/        JSON definitions 与一次性 schema 校验
  persistence/    IndexedDB、save coordinator、migration、import/export
  shared/         必需的 ID、value types、纯函数
tests/{unit,integration,e2e,fixtures}/
```
箭头：app→ui/render/simulation/world/persistence；ui/render→命令端口+只读视图；simulation→world contracts/content；world→纯生成器/worker adapter；persistence→序列化契约。simulation 不 import Phaser、DOM、IndexedDB；worker 不 import UI，不持有世界可变状态。除启动组合层外禁止循环依赖。GameSession 主线程唯一权威状态；render 只映射 snapshot/delta；UI输入不直接修改模型。内容只读、源数据ID引用，禁止用显示文本当键。

## 时钟、调度与命令
requestAnimationFrame渲染30–60fps；移动/碰撞固定60Hz，累计真实 active delta（上限100ms/帧，最多6步，严重阻塞时显式暂停而非无限追赶），记录掉帧。每60个实际模拟 tick 增加1 gameMinute；模拟不足时不得补过量时间。严格整数累计，暂停、隐藏、系统弹窗时清空累积和输入；睡眠显式 AdvanceTo 次日06:00，按事件顺序结算，不靠模拟数百万帧。低频NPC 2–5Hz、环境1Hz或事件、农业按日期。离屏补算与在线共用同一规则，不维护两份农业逻辑。

命令类型示例：MoveIntent(dx,dy), UseTool(tile,toolId), Interact(targetId), TransferItem(from,to,qty), Craft(recipeId,qty), PlaceBuilding(id,tile,rotation), RemoveBuilding(instanceId), Sleep, Travel(homeId), Buy/Sell。每个持久操作含 commandId/sequence，session 串行执行；先检查所有条件和资源预算，成功后一次提交状态 diff，返回事件（inventoryChanged, tileChanged, timeAdvanced, actionRejected等），失败无副作用。事件用于 UI/音效/dirty tracking，不搞全局事件总线或复杂CQRS。移动输入按帧合并，不持久化每次按键。逻辑碰撞 AABB+格子查询，分轴移动，禁止走入未知区块；不使用 Phaser Arcade 作为权威物理。固定步进数据与纯规则可在 Node 测试。

## 世界与 Worker 协议
GenerationRequest {sessionId,epoch,requestId,seed,generatorVersion,cx,cy}；GenerationResult 同标签+ typed arrays、staticEntities、error?。主线程丢弃过期 epoch/已卸载请求，传送/换世界时递增epoch；用 Transferable 移交数组，禁止共享可变状态。初始单 Worker，最多待处理16、优先距离/移动方向；超预算取消或延后。Chunk states absent/requested/baseReady/settling/active/cached/evicting/error；加载 base 后查询 delta，完成结算才激活碰撞与 view；dirty 持久化确认后才可卸载；卸载渲染对象不等于删除世界修改。Region LRU，仅可重算数据。传送加载目标、安全检查、原子切换位置，失败保留原会话。

## 渲染
单主场景（地表）、独立室内场景实例、启动/加载/菜单用 DOM；场景退出释放 listener、timer、sprite、tilemap。Chunk TilemapLayer 用统一 atlas、视锥裁剪；世界到局部坐标基于当前 origin chunk，rebase 同一帧更新 camera、sprite、输入转换。静态地层与动态对象分离，按脚底Y排序+稳定ID；遮挡拆分。相机平滑跟随但像素位置取整，固定缩放档。HUD 读快照/事件更新而非每帧重建DOM；音频随状态暂停。日夜色调和粒子预算见D12。室内不创建地表第二游戏引擎，切换时保持全局时钟与存档归属。

## 会话与故障
新建/读档→验证版本与内容→生成出生或目标→加载修改→进入playing。退出先暂停与持久化，事务失败给重试/导出，不误报已保存。单世界单写者（D11），不同 worldId 隔离。浏览器 contextlost 暂停并释放输入，恢复重建渲染，不改变游戏规则；必要时提示保存重载。Worker失败限次重试并显示原因，禁止静默吞异常。日志默认本地、无遥测、无个人数据上传。

## 验收
ARCH01 无图形纯规则测试；ARCH02 worker逆序/过期请求不污染会话；ARCH03 暂停/hidden/lag/睡眠时钟；ARCH04 context loss/室内切换/退出资源清理；ARCH05 静态 HTTPS 断网后无运行时网络依赖。依赖选择/原型证据记录 ADR；性能未实测。
