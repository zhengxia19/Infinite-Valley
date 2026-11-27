# Infinite Valley 文档规划 v2.0
2026-11-27 · 第三轮用户确认：单一共享在线世界。替代 v1.1 的单机与静态托管约束；原 D 编号保持稳定。
## 基线
唯一正式世界；管理员独占创建/销毁权。游客临时角色、可注册原地升级或导出；注册用户名+密码，无邮箱手机号；注册者跨设备恢复角色及同一世界进度。人类与AI同规则，Agent API+本地MCP+游戏Skill，可自主游玩或授权接管、人类随时夺回。Phaser4+TS+Vite、32px两组主视觉、无地下/战斗/死亡。服务器权威状态，客户端渲染、预测、寻路，服务器无GPU/模型推理。旧单机基线废止。
## 文档索引
| ID | 文件 | 阶段 |
|---|---|---|
| D01 | docs/design/PRODUCT_VISION.md | G0 |
| D02 | docs/design/GAME_DESIGN.md | G1 |
| D03 | DESIGN.md | G1 |
| D04 | docs/design/UX_AND_CONTROLS.md | G1 |
| D05 | docs/design/WORLD_GENERATION.md | G1 |
| D06 | docs/design/GAMEPLAY_SYSTEMS.md | G1 |
| D07 | docs/design/CONTENT_AND_BALANCE.md | G1 |
| D08 | docs/design/NPC_AND_ECOLOGY.md | G1 |
| D09 | docs/art/ASSET_PIPELINE.md | G1 |
| D10 | docs/engineering/ARCHITECTURE.md | G2 |
| D11 | docs/engineering/DATA_AND_SAVE.md | G2 |
| D12 | docs/engineering/PERFORMANCE.md | G2 |
| D13 | docs/engineering/TEST_AND_ACCEPTANCE.md | G2 |
| D14 | docs/engineering/DEPLOYMENT.md | G2 |
| D15 | AGENTS.md | G2 |
| D16 | docs/engineering/DEVELOPMENT_GUIDE.md | G2 |
| D17 | docs/ROADMAP.md | G0/G2 |
| D18 | docs/REFERENCES.md | G0 |
| D19 | docs/decisions/README.md | G0 |
| D20 | README.md | G0 |
| D21 | THIRD_PARTY_NOTICES.md | G2 |
| D22 | CHANGELOG.md | G6 |
| D23 | docs/PLAYER_GUIDE.md | G6 |
| D24 | docs/design/PLAYER_IDENTITY.md | G1 |
| D25 | docs/design/MULTIPLAYER_WORLD.md | G1 |
| D26 | docs/design/AGENT_GAMEPLAY.md | G1 |
| D27 | docs/engineering/AGENT_API.md | G2 |
| D28 | docs/engineering/WORLD_ADMINISTRATION.md | G2 |
D01–21、D24–28为正式设计基线（26份）；D22–23基于真实发布实现编写。D24/25/26依赖D01/02，D27依赖D24–26/D10，D28依赖D10/11/24/25。按D17任务依赖实施。D03/D09实际样片用户验收、G3技术验证、G6真机/负载/恢复/授权验收均未完成。
## 质量规则
用户确认优先；新增数值/配额/时钟/领地规则均为设计初值，实测修订走ADR。G3必须验证多人同步、游客转换、并发冲突、权限、AI控制权、持久化和真实画面，不能先堆完整内容。所有任务与测试稳定编号，运行证据为完成依据。禁止复制未授权参考图片；文件名英文、正文中文；保留现有MIT LICENSE。原始图未归档，只有两组主风格锚点，建筑不得使用此前独立参考。
