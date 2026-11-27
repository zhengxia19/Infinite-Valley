# 部署方案 D14
v2.0 · 计划，当前无实际构建/服务器
Nginx同源HTTPS静态dist+反代Node.js/Colyseus HTTP及WSS，SQLite在持久本地SSD目录；服务器无GPU/模型、非纯静态。单进程systemd，独立非root用户、权限最小化，监听127.0.0.1；不暴露DB或管理接口，管理员CLI仅受控SSH。Cloudflare可选，静态hash缓存，认证/存档API no-store，WSS不缓存。WebSocket反代HTTP/1.1 Upgrade/Connection及合理超时，真实测试重连；限制请求体、频率与登录哈希并发。HTTPS证书及域名待定；不泄漏密钥。无Docker硬性依赖。
G3锁定Node/npm/依赖及脚本 npm ci/dev/typecheck/lint/test/build/test:e2e；服务端构建与客户端dist分别输出，锁协议/内容/生成器/schema版本。先在隔离环境真实测试，禁止对生产运行测试重置。部署备份数据库→维护拒新连接/停写→停服务→原子切换代码/资源→迁移副本验证→启动读取原世界→健康、登录、两人WSS、重连、AI及持久性检查。失败回滚代码并按版本兼容判断恢复备份，不能只回滚代码导致旧程序写新版schema。不得自动创建世界；管理员CLI显式init。保留前版资产和数据库备份。
PWA仅静态缓存，断网提示重连，不提供离线世界/客户端改档；更新提示安全重连，旧客户端协议不兼容明确升级。监控tick延迟、活跃chunk、CCU、RSS、CPU、DB/WAL、磁盘、ACK、备份、认证失败；日志不含token/密码。告警或磁盘不足停止写入维护；配置容量按D12实测。D28处理世界生命周期及灾备；T17/T29验收。当前脚本和systemd配置均未实现。