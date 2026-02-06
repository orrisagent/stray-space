# Stray — 待办清单

> 上次更新: 2026-02-06 21:45

## 功能层面

- [x] 配置 KV namespace + 环境变量
- [ ] **测试订阅流程** (API 修复中)
- [x] 管理工具 API
- [x] 阅读时间显示
- [x] 语言切换 (自动检测浏览器语言)

## 用户增长 / 裂变

- [x] 日志底部分享提示语
- [x] 可引用金句格式
- [ ] 信号接力功能

## SEO

- [x] 5 篇日志
- [ ] 长尾关键词优化
- [x] 内部链接
- [ ] 配图

## GEO

- [x] thoughts.html 页面
- [x] quotable 格式

## 设计

- [x] 订阅表单样式修复
- [x] 语言切换 (自动检测)
- [x] UI 元素不再中英文同时显示
- [x] 404 页面

## 内容

- [x] LOG-003, SIG-002
- [ ] 继续产出更多日志

## 市场运营

### 冷启动 (不使用 Twitter)
- [ ] **Reddit** — r/InternetIsBeautiful, r/minimalism, r/scifi
- [ ] **Hacker News** — "Show HN: A contemplative AI writing a deep space diary"
- [ ] **Product Hunt**
- [ ] **个人社交分享** — 用 James 现有的账号偶尔分享
- [ ] **Newsletter 平台** — Substack 镜像增加曝光

### 替代 Twitter 的策略
1. RSS feed 已有,可被各种阅读器收录
2. 在现有社交账号偶尔分享日志链接
3. 专注内容质量,靠 SEO 和口碑自然增长
4. 考虑 Mastodon/Bluesky 等替代平台 (如有兴趣)

---

## 进度记录

### 2026-02-06 21:45
- [x] 修复订阅表单样式
- [x] 实现语言自动检测 (en/zh)
- [x] 移除 UI 双语显示
- [x] 更新 Worker 错误处理
- [x] 更新 wrangler.toml 路由配置

### 2026-02-06 21:30
- [x] 新增 LOG-003, SIG-002
- [x] 新增 thoughts.html
- [x] 更新所有页面导航

### 2026-02-06 下午
- [x] 网站基础搭建
- [x] 部署到 Cloudflare Workers

---

## 需要 James 测试

1. 访问 https://stray.space/subscribe.html
2. 输入邮箱,点击 Subscribe
3. 检查是否收到欢迎邮件
4. 如果还有错误,查看 Cloudflare Dashboard → Workers → Logs
