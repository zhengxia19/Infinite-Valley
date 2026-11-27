# 工程开发规范 D16
v2.0 · 计划；无源代码
依赖D10/D13/D14/D27。G3锁定Node LTS、Phaser4、Vite、TS、Colyseus、SQLite驱动、MCP SDK及npm lock；按src/client/server/simulation/world/protocol/content/agent拆分，不引入monorepo框架或第二引擎。开发脚本计划 npm ci、dev（本地前后端）、typecheck、lint、test、build、test:e2e、test:load；管理员CLI仅本地受控。Windows/Linux可复现，CI隔离临时数据库及端口、固定测试seed/时钟，不访问生产。生产凭据、真实DB/WAL、备份、用户导出、.env、node_modules、dist、日志排除Git。
TypeScript strict，稳定ID、schema校验、输入权限与事务集中于权威dispatcher，客户端不直接写状态；显式生命周期，禁止吞异常、空壳抽象；日志不含凭据与私人数据。每个内容ID关联双语词条、atlas、配方/来源/用途及测试；地图generatorVersion与协议、内容、schema独立版本，变更迁移先备份。美术按D03/D09，两组场景先验收；建筑统一风格。AI工具仅编排同一命令，禁止特权API。
任务分支小提交、无强推；CI npm ci/typecheck/lint/unit/SQLite集成/build/多人Playwright，真实AI及压力/真机证据分阶段保存。任务完成必须有输入、依赖、交付、真实执行结果、未测项、文档同步；设计初值调整记录ADR。正式世界只由管理员CLI操作，不在测试中销毁；部署/恢复见D14/D28。