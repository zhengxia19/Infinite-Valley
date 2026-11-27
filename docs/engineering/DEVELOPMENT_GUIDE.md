# 工程开发规范 D16
v1.0 · 2026-11-27 · 计划规范，当前仓库尚无源代码或依赖
依赖 D10、D13。

## 环境与结构
G3选择官方支持的Node LTS、npm及Phaser4/Vite/TypeScript兼容版本，锁Node版本文件和package-lock；Windows/Linux可复现。使用 VS Code/Codex 或其他Agent，不依赖专有服务。初始化 scripts 合同见D14，src/目录见D10。tests/unit、integration、e2e、fixtures；content JSON、public/assets、assets/source、docs/validation（按需要创建，不预建空目录）。.gitignore 排除node_modules、dist、测试临时数据、日志、.env、真实存档。CI 无需密钥运行静态构建与测试。

## 规则
TypeScript strict、noImplicitAny、明确跨模块类型；不要滥用 any、类型断言或吞异常。纯函数放规则/坐标/数值，类仅用于有明确生命周期的会话、renderer、chunk manager。边界 schema 验证导入/内容；内部已验证类型不重复检查每个调用。统一格式化和lint（G3选最小工具），文件与函数按功能拆分，避免巨大上帝对象和空壳抽象。资源加载/事件监听/Worker都必须有dispose。日志只记录技术状态、避免存档或个人字段。没有真实瓶颈不优化。

## 内容与美术工作
新增物品→稳定ID→双语名称/说明→素材atlasFrame→数值/来源/用途→配方和交易→schema/reference校验→实际游戏截图。新增建筑同时定义footprint、门、碰撞、返材账本与拆除/移动测试；新增作物需全阶段、季节规则、离屏一致性测试。音频/美术按D09，许可登记先于引入。版本升级不得复用已有ID。
## Git与CI
以当前main为基线，任务分支如 feat/g3-chunks；独立可回滚提交，文档用 docs:，功能 feat:，修复 fix:。不强推或覆盖并行修改。CI依次 npm ci、typecheck、lint、unit/integration、build、Playwright关键闭环；固定浏览器版本并输出trace/screenshot。发布前真机记录另附。依赖升级单独提交，检查兼容和存档。
## 完成定义
任务有输入、输出、依赖、验收用例；实现满足设计且测试真实执行；失败列出证据和原因；文档更新、无无关修改、资源许可证清晰；合并前检查diff和用户确认范围。功能性实现不得绕过 G3 视觉和技术门禁。当前无脚本/CI配置，下一步由G3落实。
