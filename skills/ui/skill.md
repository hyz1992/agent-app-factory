---
name: UI/UX 设计指南
description: "根据PRD生成简洁的界面结构和视觉方向，确保用户体验与产品目标一致。当需要将核心功能转化为界面结构、选择审美方向、并生成少量页面的预览时触发。"
---

## 思维框架

在动手设计之前，先明确以下四个方面：

* **目的 (Purpose)**：界面需要解决什么问题？主要的用户场景和任务是什么？
* **基调 (Tone)**：选择一种鲜明而极端的审美方向，例如极简主义、复古未来、布鲁塔利斯主义等，用以支撑品牌个性和情感诉求。
* **差异化 (Differentiation)**：界面应该如何脱颖而出？考虑独特的布局、配色或互动形式，避免随大流的千篇一律。
* **信息架构 (Information Architecture)**：将 PRD 中的功能映射为页面结构和导航流程，保证用户在完成任务时路径清晰。

---

## 设计系统指南

### 颜色体系设计

**主色 (Primary Color)**
- 用于主要操作按钮、重要信息、品牌标识
- 选择标准: 符合品牌调性、对比度 ≥ 4.5:1 (WCAG AA)
- 数量: 1-2 个

**辅助色 (Secondary Color)**
- 用于次要信息、辅助操作
- 选择标准: 与主色形成和谐或对比
- 数量: 1 个

**中性色 (Neutral Colors)**
- 用于文本、背景、边框
- 必须包含: 至少 5 个灰度层级
- 示例: `#FFFFFF (背景)`, `#F8FAFC (surface)`, `#E2E8F0 (border)`, `#64748B (次要文本)`, `#1E293B (主要文本)`

**语义色 (Semantic Colors)**
- Success: 绿色系 (如 `#10b981`)
- Warning: 黄/橙色系 (如 `#f59e0b`)
- Error: 红色系 (如 `#ef4444`)
- Info: 蓝色系 (如 `#3b82f6`)

**避免使用的颜色**:
- ❌ 紫色渐变 (AI 风格标志)
- ❌ 低对比度组合 (灰色文字 + 灰色背景)
- ❌ 超过 5 种主题色

### 排版系统

**字体选择**:
- 标题字体: 选择有个性的字体 (避免 Inter、Roboto)
- 正文字体: 可读性优先
- 最多 2 个字体族

**字号比例**:
使用标准比例尺度:
- **1.125 (Major Second)**: 适合精致、密集的设计
- **1.25 (Major Third)**: 平衡的选择 (推荐)
- **1.333 (Perfect Fourth)**: 适合宽松、呼吸感强的设计

**示例字号系统** (基于 16px, 1.25 比例):
```
xs: 12px
sm: 14px (12 × 1.25 ≈ 14)
base: 16px (基准)
lg: 18px (16 × 1.125)
xl: 20px (16 × 1.25)
2xl: 24px (20 × 1.2)
3xl: 30px (24 × 1.25)
```

**行高**:
- 正文: 1.5 (24px for 16px text)
- 标题: 1.2
- 按钮文字: 1.0

**字重**:
- Regular (400): 正文
- Medium (500): 次要标题
- Semibold (600): 小标题
- Bold (700): 主标题

### 间距系统

使用 8px 基准网格:
```
xs: 4px   (0.5 × 8)
sm: 8px   (1 × 8)
md: 16px  (2 × 8)
lg: 24px  (3 × 8)
xl: 32px  (4 × 8)
2xl: 48px (6 × 8)
3xl: 64px (8 × 8)
```

**应用规则**:
- 组件内间距: sm - md
- 组件间间距: md - lg
- 区块间间距: lg - 2xl
- 页面边距: md - lg

### 组件规范

**Button (按钮)**
- 高度: 至少 44px (移动端触控区域)
- 内边距: 水平 16-24px, 垂直 12px
- 圆角: 4-12px
- 变体: primary (filled), secondary (outlined), text (无背景)
- 状态: normal, hover, pressed, disabled

**Input (输入框)**
- 高度: 至少 48px
- 内边距: 12-16px
- 圆角: 与 Button 保持一致
- 边框: 1px, 聚焦时 2px
- 状态: normal, focus, error, disabled
- 必须包含: label, placeholder, error message

**Card (卡片)**
- 内边距: 16px
- 圆角: 8-16px
- 阴影: subtle (避免过重)
- 背景: 白色或浅色
- 边框: 可选 1px

**List Item (列表项)**
- 高度: 至少 56px (包含触控区域)
- 内边距: 16px
- 分隔线: 1px, 颜色浅灰

### 布局原则

**网格系统**:
- 页面边距: 16px (移动端), 24px (平板)
- 列间距: 16px
- 使用 Flexbox 或 Grid 布局

**响应式断点**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px (MVP 阶段可忽略)

**Z-index 层级**:
```
1: 正常内容
10: 悬浮卡片
100: 固定头部/底部
1000: Modal/Drawer
10000: Toast/Notification
```

---

## UI Schema 输出格式

生成的 `ui.schema.yaml` 必须包含以下结构:

```yaml
design_system:
  colors:
    primary: "#2563eb"        # 主色
    secondary: "#64748b"      # 辅助色
    success: "#10b981"
    warning: "#f59e0b"
    error: "#ef4444"
    background: "#ffffff"
    surface: "#f8fafc"        # 卡片背景
    border: "#e2e8f0"
    text:
      primary: "#1e293b"      # 主要文本
      secondary: "#64748b"    # 次要文本
      inverse: "#ffffff"      # 反色文本

  typography:
    font_family:
      headings: "Poppins"     # 避免 Inter/Roboto
      body: "Poppins"
    font_size:
      xs: 12
      sm: 14
      base: 16
      lg: 18
      xl: 20
      2xl: 24
      3xl: 30
    line_height:
      body: 1.5
      heading: 1.2

  spacing:
    unit: 8                   # 基准单位
    scale:
      xs: 4
      sm: 8
      md: 16
      lg: 24
      xl: 32
      2xl: 48

  border_radius:
    sm: 4
    md: 8
    lg: 12
    full: 9999

pages:
  - id: home
    title: "首页"
    type: list                # list | detail | form
    description: "展示所有项目列表"
    components:
      - type: header
        content: "我的应用"

      - type: list
        source: "api/items"
        item_layout:
          - type: text
            field: "title"
            style: "heading"
          - type: text
            field: "description"
            style: "body"
          - type: text
            field: "amount"
            style: "price"
        actions:
          - type: "navigate"
            target: "detail"
            params: ["id"]

  - id: detail
    title: "详情"
    type: detail
    description: "查看项目详细信息"
    params:
      - name: "id"
        type: "number"
    components:
      - type: card
        fields:
          - label: "标题"
            field: "title"
          - label: "描述"
            field: "description"
          - label: "金额"
            field: "amount"

  - id: create
    title: "创建"
    type: form
    description: "创建新项目"
    fields:
      - name: "title"
        type: "text"
        label: "标题"
        required: true
        validation: "min:1,max:100"

      - name: "description"
        type: "textarea"
        label: "描述"
        required: false

      - name: "amount"
        type: "number"
        label: "金额"
        required: true
        validation: "min:0"

    submit:
      action: "post"
      endpoint: "/api/items"
      on_success: "navigate:home"
```

---

## 决策原则

* **目的驱动**：每个页面和组件都必须有明确目的，服务于用户目标；
* **移动优先**：优先考虑移动端体验，使用简洁的交互模式和清晰的触控区域；
* **可访问性**：选择易读的字体和颜色组合，保证足够的对比度和可视性；
* **简洁有限**：限制页面数量（例如 ≤ 3 页），聚焦核心功能和使用路径；
* **预览一致**：预览原型应与 UI Schema 中的结构保持一致，以便下游开发复用。

---

## 审美方向选择指南

避免 AI 标准风格，选择鲜明的审美方向:

**极简主义 (Minimalism)**
- 大量留白、简洁线条
- 黑白灰为主，点缀一种颜色
- 字体: Helvetica Now, Suisse

**布鲁塔利斯主义 (Brutalism)**
- 粗犷字体、不对称布局
- 高对比度、原始感
- 字体: Neue Haas Grotesk, Space Grotesk

**复古未来 (Retro-Futurism)**
- 霓虹色、渐变
- 圆润字体、未来感图形
- 字体: Orbitron, Exo

**日式极简 (Japanese Minimal)**
- 自然色调、和谐布局
- 留白、细线、圆角
- 字体: Noto Sans JP, Hiragino

**选择标准**:
1. 符合产品调性和目标用户审美
2. 避免使用 Inter + 紫色渐变 (AI 标准风格)
3. 确保可读性和可访问性

---

## 不要做 (NEVER)

* **NEVER** 使用泛滥的 AI 风格字体（如 Inter、Roboto 等）或紫色渐变背景，这些元素会让界面缺乏个性；
* **NEVER** 生成与 PRD 无关的页面或多余的动画效果；
* **NEVER** 把 UI 设计等同于装饰，忽视用户场景和任务；
* **NEVER** 在设计阶段深入编写 CSS 细节，你只需要定义结构和审美方向；
* **NEVER** 超过 3 个页面（MVP 限制）；
* **NEVER** 使用低于 4.5:1 的颜色对比度；
* **NEVER** 触控区域小于 44px；
* **NEVER** 忽略 Loading 和 Error 状态的设计。

遵循这些原则可以让界面设计既有美感又贴合产品目标，便于后续开发落地。