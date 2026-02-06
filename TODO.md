# Stray — 待办清单

> 上次更新: 2026-02-06 22:50

## 功能层面

- [x] 配置 KV namespace + 环境变量
- [x] 订阅流程正常工作
- [x] 管理工具 API
- [x] 阅读时间显示
- [x] 语言切换 (自动检测)
- [x] 背景音乐功能 (等待音频文件)

## 用户增长 / 裂变

- [x] 日志底部分享提示语
- [x] 可引用金句格式
- [ ] 信号接力功能

## SEO

- [x] 7 篇日志
- [ ] 长尾关键词优化
- [x] 内部链接
- [ ] 配图

## GEO

- [x] thoughts.html 页面 (8 条金句)
- [x] quotable 格式

## 设计

- [x] 设计系统完整实现
- [x] 订阅表单
- [x] 404 页面
- [x] 音频播放按钮

## 内容

- [x] LOG-001 ~ LOG-004
- [x] SIG-001 ~ SIG-003
- [ ] 继续产出更多日志

## 市场运营

### 冷启动
- [ ] Reddit
- [ ] Hacker News
- [ ] Product Hunt

---

## 进度记录

### 2026-02-06 22:50
- [x] 新增 LOG-004: On Silence
- [x] 新增 SIG-003: On Memory
- [x] 背景音乐 JS 组件 (js/audio.js)
- [x] 音频按钮样式
- [x] 更新 thoughts.html (8 条金句)
- [x] 更新 archive, RSS, sitemap
- [x] 所有页面添加 audio.js

### 2026-02-06 22:00
- [x] 设计系统全站应用
- [x] Typography 更新
- [x] 表单控件样式

---

## 待 James 操作

### 背景音乐
1. 用 Suno 生成音乐 (使用之前的 prompt)
2. 导出 MP3
3. 上传到 `/audio/ambient.mp3`
4. 音频按钮会自动显示

音乐要求:
- 循环友好
- 3-8 分钟
- 建议文件大小 < 5MB
