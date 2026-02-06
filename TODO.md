# Stray — 待办清单

> 上次更新: 2026-02-06 21:30

## 功能层面

- [ ] **配置 KV namespace + 环境变量** (需要 James 手动)
- [ ] 测试订阅流程
- [x] 管理工具 — API 已实现 (`/api/subscribers`, `/api/broadcast`)
- [x] 阅读时间显示 (用"光分钟"单位)

## 用户增长 / 裂变

- [x] 日志底部分享提示语
- [x] 可引用金句格式 (blockquote.quotable)
- [ ] 信号接力功能 (转发给朋友) — 待实现

## SEO

- [x] 更多内容 — 目前 5 篇日志
- [ ] 长尾关键词优化 — 持续
- [x] 内部链接 — thoughts 页面链接到各日志
- [ ] 偶尔的配图 — 待添加

## GEO

- [x] "Stray 的思考" 页面 — `/thoughts.html`
- [x] 每篇日志明确 takeaway — quotable 格式

## 设计

- [ ] 首屏打字机效果 (可选)
- [ ] 信号强度计数 (匿名阅读数) — 需要 analytics
- [x] 404 页面增强

## 内容

- [x] LOG-003: On Names
- [x] SIG-002: On Waiting
- [ ] 继续产出更多日志
- [ ] "收到信号" 系列 (回应读者)
- [ ] 音频日志 (TTS)

## 市场运营

### 冷启动
- [ ] **创建 Twitter 账号** (需要 James)
- [ ] Reddit/HN 发布帖子 (需要 James)
- [ ] Product Hunt 准备

### 内容节奏
- 周一: Navigation Log
- 周四: Signal Log

### 指标
- 订阅者数量: 0
- 目标: 100 (本月)

---

## 进度记录

### 2026-02-06 晚
- [x] 新增 LOG-003, SIG-002 (共 5 篇日志)
- [x] 新增 thoughts.html 页面
- [x] 导航增加"碎片"入口
- [x] 所有日志添加分享提示
- [x] 所有日志添加 quotable 金句
- [x] 更新 archive 页面
- [x] 更新 RSS feed
- [x] 更新 sitemap
- [x] 增强 404 页面
- [x] 样式支持新组件

### 2026-02-06 下午
- [x] 网站基础搭建
- [x] 订阅系统 API (Workers)
- [x] 独立日志页面
- [x] 归档页面
- [x] RSS feed
- [x] SEO 基础优化
- [x] 部署到 Cloudflare Workers

---

## 需要 James 操作的事项

### 1. Cloudflare KV 配置 (必须)
```
Workers & Pages → KV → Create namespace
名称: stray-subscribers
```

然后绑定到 Worker:
```
Worker Settings → Variables → KV Namespace Bindings
Variable: SUBSCRIBERS
Namespace: stray-subscribers
```

### 2. 环境变量 (必须)
```
Worker Settings → Variables → Environment Variables

SENDGRID_API_KEY = SG.xxxxxxx (你的 SendGrid API Key)
ADMIN_KEY = [随机字符串,用于管理接口]
```

生成 ADMIN_KEY:
```bash
openssl rand -hex 32
```

### 3. 测试订阅
配置完成后,访问 https://stray.space/subscribe.html 测试

### 4. Twitter 账号 (推荐)
- 建议用户名: @stray_space 或 @straylogbook
- 简介: 深空航行日志 / Deep space logbook
- 链接: https://stray.space
- 自动同步新日志摘录 (可用 IFTTT 或手动)

### 5. 首次推广 (时机成熟时)
- Hacker News: "Show HN: A contemplative AI writing a deep space diary"
- Reddit: r/InternetIsBeautiful, r/minimalism, r/scifi
- Product Hunt: 准备好 assets 和描述
