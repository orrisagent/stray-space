# Stray — 设计系统

> 这套表单控件的目标不是让人感觉在操作工具，而是像在一艘飞船的安静控制台上输入一段日志。
> 所有控件都要低对比、低噪声、弱边界、慢反馈。交互提示存在，但永远不抢戏。

## 颜色 Token

```css
--bg-primary: #0B0F14;
--bg-layer-1: #0E141B;
--bg-layer-2: #121A24;
--border-weak: #1E2A36;

--text-primary: #D6DEE8;
--text-secondary: #93A3B5;
--text-placeholder: #5E6B7A;
--text-disabled: #465260;

--accent-glow: #7AA7FF;
--error-glow: #FF6B7A;
--success-glow: #6EE7B7;

--input-bg: rgba(255,255,255,0.02);
--hover-bg: rgba(255,255,255,0.04);
--active-bg: rgba(255,255,255,0.06);
--focus-glow: rgba(122,167,255,0.35);
```

## 圆角

```css
--radius-xs: 6px;
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 18px;
```

## 间距 (4的倍数)

```
4 | 8 | 12 | 16 | 24 | 32 | 48 | 64
```

## 动效

```css
--transition-hover: 160ms ease;
--transition-focus: 220ms ease;
--transition-enter: 240ms ease;
--transition-leave: 200ms ease;
```

所有状态切换用透明度和亮度变化，不做位移，不做弹性。

## Typography

### 字体

```css
--font-body: 'Iowan Old Style', Georgia, ui-serif, serif;
--font-ui: Inter, system-ui, 'SF Pro Text', 'Segoe UI', sans-serif;
--font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
```

### 字重

- 正文: 400
- 正文强调: 500
- UI: 450 (或 400)
- 标题: 550 (或 500)
- 任务编号: 500

### 字距 (letter-spacing)

- 正文: 0 ~ 0.02em
- UI: 0.02 ~ 0.06em
- 全大写标签: 0.12 ~ 0.18em

### 字号阶梯

| Token | Size | Line Height |
|-------|------|-------------|
| display | 40px | 52px |
| h1 | 28px | 38px |
| h2 | 22px | 32px |
| h3 | 18px | 28px |
| body | 16px | 28px |
| body-sm | 14px | 24px |
| caption | 12px | 18px |
| micro | 11px | 16px |

## 表单控件

### 几何规范

- 标准输入高度: 44px
- 紧凑输入高度: 38px
- 多行输入最小高度: 120px
- 内边距: 14px (标准) / 12px (紧凑)
- 边框: 1px solid var(--border-weak)

### Input 状态

**默认:** 背景 input-bg, 边框 border-weak, 文字 text-primary, placeholder text-placeholder

**Hover:** 背景 hover-bg, 边框略提亮

**Focus:** 背景略提亮, 外发光 focus-glow, label 变亮

**Disabled:** 背景更暗, 文字 text-disabled, 边框更淡

**Error:** 边框带 error-glow, focus 光晕从蓝切红

### Button

主按钮像"许可"而非"号召":
- 背景: rgba(122,167,255,0.12)
- 文字: text-primary
- 边框: accent-glow 很淡
- Hover: 仅提升背景透明度
- Active: 再提升并整体略暗

次按钮: 透明底 + 弱边框
幽灵按钮: 纯文本, hover 出现细下划线

### Checkbox / Radio

- 尺寸: 18px
- 像航行面板的小舱门指示灯
- Checked: 内部极细勾或小点, accent-glow 低透明度
- 不要实心填满

### Switch

- 高度 22px, 宽度 40px
- Off: 轨道 rgba(255,255,255,0.06)
- On: 轨道 rgba(122,167,255,0.18), 不要亮绿
- 像生命维持系统的静音拨杆

## 表单文案

- Label: 12-14px, 500, text-secondary
- Help text: 12px, text-placeholder
- Error text: 12px, error-glow 低透明度, 不抖动布局
