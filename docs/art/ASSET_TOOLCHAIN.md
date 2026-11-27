# 美术生产工具链接入与样片门禁
2026-11-27 · 用户批准开展工具链试验；不替代 D03/D09，不改变设计或现有素材验收状态。

## 工具与授权状态
- PixelLab：主生成候选，官方远程 MCP https://api.pixellab.ai/mcp，Bearer token，需有效订阅。登录 https://www.pixellab.ai/mcp 选择 Codex CLI，使用官方生成的配置，凭证仅存于本机用户级配置或环境变量；禁止提交 token。当前未取得用户授权、未完成 MCP 握手，不调用付费生成。
- Aseprite：精修、图层、动画、批处理和导出。通过 https://www.aseprite.org/ 获取正版安装程序或按官方源代码许可及构建说明自行编译（https://github.com/aseprite/aseprite/blob/main/INSTALL.md）。用户本机安装后执行 aseprite --version；若未加入 PATH，使用 exe 全路径。当前容器无 Aseprite，不能替代用户本机安装或许可证。
- fal：ChatGPT 可安装插件，辅助图像生成/处理。当前未确认连接；如插件不提供指定模型，则仅在用户授权及费用批准后用 API。Image2Pixel 官方接口 https://fal.ai/models/fal-ai/image2pixel/api ，只作为像素清理候选，不保证风格或尺寸正确。
- ChatGPT 原生图像生成：用于原创母版和复杂场景；现有能力保留。Scenario 暂缓，不购订阅、不训练。
- Python/Pillow：本轮在容器使用 Pillow 12.3.0 执行校验脚本模拟测试；不增加游戏运行时依赖。
- 生产工具仅供开发阶段使用，不接入正式游戏服务器，不改变人类/AI玩法规则。第三方服务的生成输出再分发条款需逐项核实并登记 D21；未经确认不上传未授权参考图，不承诺独占版权。

## Windows 开发机接入顺序
1. 用户登录 PixelLab 并确认订阅成本；在官方 MCP 页面选择实际客户端并复制配置，在本机应用而非提交仓库。重启客户端，用 codex mcp list 确认配置，再实际调用只读列表/查询工具，成功返回才算接通。不要用配置列表代替服务验证。
2. 安装合法来源 Aseprite；在 PowerShell 调用 aseprite --version 和 aseprite --help。打开原创样本测试图层与动画导出。官方 CLI 示例：aseprite -b sample.aseprite --sheet sample.png --data sample.json；导出格式转换成 D09 契约后才验收。官方 CLI https://aseprite.org/docs/cli/ 。不要把输出自动覆盖已批准 PNG。
3. 用户在 ChatGPT 中安装并连接 fal；核实账号权限、余额及单次成本，再试用辅助模型。不需要先开通 Scenario。
4. 在仓库根目录建立独立 Python venv，安装已测试 Pillow 版本：
   - python -m venv .venv-art
   - .\.venv-art\Scripts\python.exe -m pip install Pillow==12.3.0
   - .\.venv-art\Scripts\python.exe tools/art/check_character_atlas.py assets/source/characters/character_v2/male/atlas.json assets/source/characters/character_v2/female/atlas.json assets/source/characters/farming_actions_v1/male_atlas.json assets/source/characters/farming_actions_v1/female_atlas.json
   不提交 venv、账户配置或凭证。脚本是只读校验器，JSON 错误及非零退出码代表失败；不执行发布。仅检查当前未裁切、硬透明角色图集契约，不能证明动作自然、遮挡正确或地形无缝。
   
## 对照试产（外部服务接通后）
现有基准：character_v2 男/女已视觉批准，48×64、3–3.5头身、32px地面、四向、4待机/8行走；现有6类同轮廓换色+帽子并非真正不同剪裁换装。农业动作原稿已批准，64×80扩展画布、脚底锚点32,65，工具/服装烘焙、4关键姿势；不是完整分层动画。严禁战斗、地下、死亡内容；此前独立建筑参考继续废弃。
- PL-P01：以已验收男性 V2 为参照，生成四向待机/行走和跑步小样；目标保留造型、方向、光照，足底定位一致。记录实际独立关键帧与补帧方式，不以重复图充帧。
- PL-P02：同一角色身体、不同轮廓发型/上衣/裤装/鞋履以及工具层；通过各帧叠加和遮挡检查验证真正换装，不能只换色。
- PL-P03：同一套32px地块、自然边角、树、水、道路、田地、木屋和围栏；构建农场及自然两组固定场景，房屋须在场景整体评审，不单独确认。
- PL-P04：将现有基准与新工具结果放在相同实际像素尺度，进行1×、2×、四向动作播放及 Phaser 固定 Seed/时刻/相机截图。逐项记录通过/不通过、人工修整时间、重试次数与实际费用。不得以概念图替代引擎截图。用户逐批确认前仅放 assets/candidates/，不进入正式资源、不启动批量生成。
- 评价维度：原生像素质量、造型/色板一致性、真实动作、换装分层、邻接接缝、返工成本、授权。规格/许可/真实场景为硬门禁，不自行设定分数或批准阈值。
- 每批保存原稿、生成参数/工具版本/任务ID、实际 PNG/JSON、可复现脚本、许可记录及测试证据；用户确认后提交；D09 ART01–05 与 G3 门禁维持不变。

## 本轮实际证据
已读取 main 的原有设计、角色及农业 atlas JSON。当前环境仅能通过 GitHub 连接器读取文本和提交文件；直接 git clone/ls-remote DNS 失败，真实 PNG 未在容器重新下载。Pillow 12.3.0 模拟用例通过：合法图集退出0，重复帧、重叠帧、非二值 alpha/错误图层合成退出1。未执行真实资产的本轮校验、Aseprite 导出、PixelLab/fal 请求、Phaser 或真机测试；没有新增美术素材，也没有购买服务。
