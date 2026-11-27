# 构建与部署 D14
v1.0 · 2026-11-27 · 部署方案，尚无可构建产物或实际域名
依赖 D10–D13。纯静态网站，Nginx+HTTPS，Cloudflare可选；不运行 Node 游戏服务、数据库或 GPU。

## 构建合同
G3 初始化项目后采用锁定 Node LTS/包管理器及 package-lock.json，约定 npm ci、npm run dev、npm run typecheck、npm run lint、npm test、npm run build、npm run preview、npm run test:e2e；这些是待实现脚本，不是当前可执行命令。Vite dist/ 为唯一发布产物。base 按根域或子路径配置；所有资产、worker和SW URL使用相同base；无动态第三方CDN资源。发布记录 git SHA、版本、构建时间、生成器/存档兼容范围、产物校验值。

## 静态托管
候选 Nginx 配置（实际域名与证书部署时填入，非已配置）：
```nginx
server {
    listen 443 ssl;
    server_name example.invalid;
    root /srv/infinite-valley/current;
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    index index.html;
    location = /index.html { add_header Cache-Control "no-cache"; }
    location = /sw.js { add_header Cache-Control "no-cache"; }
    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location / { try_files $uri $uri/ =404; }
}
```
仅带内容hash的资产使用immutable；构建若含无hash资产改配置，不缓存一年。MIME JS/JSON/图片/音频正确，压缩gzip/Brotli按能力启用，HTTPS安全上下文；不假设 COOP/COEP 或 SharedArrayBuffer 为必要。CSP 先通过报告/测试再启用，worker同源，禁止意外外部脚本；没有服务器收集存档。域名保持稳定（IndexedDB按origin隔离），改域前提示导出。Cloudflare/CDN只缓存静态hash资源，不缓存错误或旧入口；源站流量与计算无混淆。

## PWA
使用版本化 service worker，预缓存核心可玩资源及必需字体/初始图集，后续季节/音频按需缓存；离线完整V1.0需一次明确下载全部资源或提示未缓存资源，不承诺未下载内容离线可用。缓存与存档分离，清缓存不删IDB；SW更新检测后提示保存并重新加载，避免运行中强行 skipWaiting 导致混版本。旧版本资源保留至少一个发布周期，发布回滚不删除玩家存档，旧代码遇新版档拒读并提示恢复/升级。
发布步骤：CI构建+验收→上传新版本独立目录→校验hash→测试临时地址（注意不同origin测试档）→原子切换current→验证同源、资源、版本、断网及存档→异常切回前版。保留前版资产和迁移备份。部署参数与授权未定，当前不执行部署。
验收 T17：静态服务仅 GET/HEAD资源，不调用动态 API；缓存更新/离线重载/回滚流程测试，证据见D13。
