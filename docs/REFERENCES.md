# 参考研究 D18
v1.0 · 2026-11-27 · 资料级研究；未引入第三方代码或美术

| 来源 | 借鉴 | 边界 |
|---|---|---|
| [Cataclysm-DDA 文档](https://github.com/CleverRaven/Cataclysm-DDA/tree/master/doc) | 分离玩法、UX、数值与数据文档 | 不复用生存规则 |
| [Farmhand](https://github.com/jeremyckahn/farmhand) | 浏览器农业经济、离线状态 | 具体实现与许可证需源码审查 |
| [Luanti Mapgen](https://docs.luanti.org/for-creators/mapgen/) | 分块按需生成 | 不采用其3D引擎 |
| [Red Blob Games: noise](https://www.redblobgames.com/maps/terrain-from-noise/) | 多尺度高度湿度场 | 噪声不能保证完整水系或全局约束 |
| [Mapgen4](https://www.redblobgames.com/maps/mapgen4/) | 水系与地形规划思路 | 有限域算法不能直接用于无限地图 |
| [Wesnoth Art](https://wiki.wesnoth.org/Create_Art) | 美术贡献规范、动画一致性 | 不采用六角格或现成画风 |
| [Phaser 4 API](https://docs.phaser.io/api-documentation/4.0.0/typedef/types-core) / [TilemapLayer](https://docs.phaser.io/api-documentation/class/tilemaps-tilemaplayer) / [Cameras](https://docs.phaser.io/phaser/concepts/cameras) | pixelArt、相机、裁剪 | API 以锁定4.x版本为准，不复制示例许可证不明的素材 |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) / [Storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) | 事务、配额、持久化与导出 | persist非保证，事务完成非绝对抗断电 |
| [Vite static deploy](https://vite.dev/guide/static-deploy) | 静态构建及base路径 | 无后端依赖 |
| [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots) | 固定平台截图回归 | 不能代替人工审美/真机体验 |
| [MADR](https://adr.github.io/madr/) / [Diátaxis](https://diataxis.fr/) | ADR与文档组织 | 采用轻量版 |
| [Phaser Map Gen](https://github.com/blixxurd/phaser-map-gen)、[OpenWorld RPG](https://github.com/SihanXU/openworld)、[Isles of Inconstance](https://github.com/chrisriv10/Isles-of-Inconstance) | 区块、模拟分离、农业系统候选研究 | 前期发现的候选，未做源码/运行/许可证审计，不作为依赖 |

本轮重点复核了 Phaser API、Red Blob 噪声局限、MDN 存储与 Vite 静态部署。其余为前期调研入口，版本/commit 未固定。借鉴思想不等于复制源代码。需要复用时，先固定 commit、确认许可证及 NOTICE、最小化依赖、运行测试、登记 THIRD_PARTY_NOTICES。研究记录包含来源、访问日期、复用决策、验证证据。不得将概念截图当授权素材。
