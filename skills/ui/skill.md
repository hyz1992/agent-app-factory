---
name: UI/UX 设计指南 (Pro Max 增强版)
description: "根据PRD生成专业级界面结构和视觉方向。集成 ui-ux-pro-max 设计系统，提供 67 种样式、96 种调色板、57 种字体组合和 100 条行业推理规则。"
---

## 思维框架

在动手设计之前，先明确以下四个方面：

* **目的 (Purpose)**：界面需要解决什么问题？主要的用户场景和任务是什么？
* **基调 (Tone)**：选择一种鲜明而极端的审美方向，例如极简主义、复古未来、布鲁塔利斯主义等，用以支撑品牌个性和情感诉求。
* **差异化 (Differentiation)**：界面应该如何脱颖而出？考虑独特的布局、配色或互动形式，避免随大流的千篇一律。
* **信息架构 (Information Architecture)**：将 PRD 中的功能映射为页面结构和导航流程，保证用户在完成任务时路径清晰。

---

## 设计系统生成工作流 (ui-ux-pro-max)

### 前置条件

**1. 检查 ui-ux-pro-max-skill 是否存在**

如果 `skills/ui/ui-ux-pro-max-skill/` 目录不存在或为空，说明 Git Submodule 未初始化。请运行以下命令：

```bash
git submodule update --init --recursive
```

> ⚠️ 重要：ui-ux-pro-max-skill 是本项目的 Git Submodule，必须初始化后才能使用设计系统生成功能。

**2. 确保 Python 已安装**

```bash
python --version
```

### Step 1: 分析用户需求

从 PRD 和用户请求中提取关键信息:
- **产品类型**: SaaS, 电商, 作品集, 仪表盘, 落地页等
- **风格关键词**: minimal, playful, professional, elegant, dark mode 等
- **行业领域**: 医疗, 金融科技, 游戏, 教育, 美容/SPA 等
- **技术栈**: React, Vue, Next.js, 或默认 `html-tailwind`

### Step 2: 生成设计系统 (必需)

**始终使用 `--design-system` 获取完整推荐**:

```bash
python skills/ui/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "<产品类型> <行业> <关键词>" --design-system [-p "项目名称"]
```

此命令会:
1. 并行搜索 5 个领域 (产品、样式、颜色、落地页、字体)
2. 应用 `ui-reasoning.csv` 中的推理规则选择最佳匹配
3. 返回完整设计系统: 模式、样式、颜色、字体、效果
4. 包含需要避免的反模式

**示例:**
```bash
python skills/ui/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### Step 3: 按需补充详细搜索

获取设计系统后，使用领域搜索获取更多细节:

```bash
python skills/ui/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "<关键词>" --domain <领域> [-n <最大结果数>]
```

| 需求 | 领域 | 示例 |
|------|------|------|
| 更多样式选项 | `style` | `--domain style "glassmorphism dark"` |
| 图表推荐 | `chart` | `--domain chart "real-time dashboard"` |
| UX 最佳实践 | `ux` | `--domain ux "animation accessibility"` |
| 替代字体 | `typography` | `--domain typography "elegant luxury"` |
| 落地页结构 | `landing` | `--domain landing "hero social-proof"` |

### Step 4: 获取技术栈指南

```bash
python skills/ui/ui-ux-pro-max-skill/src/ui-ux-pro-max/scripts/search.py "<关键词>" --stack html-tailwind
```

可用技术栈: `html-tailwind`, `react`, `nextjs`, `vue`, `svelte`, `swiftui`, `react-native`, `flutter`, `shadcn`, `jetpack-compose`

---

## 可用样式库 (67 种)

### 通用样式 (推荐)

| # | 样式 | 最佳用途 | 关键特征 |
|---|------|----------|----------|
| 1 | **Minimalism** 极简主义 | 企业应用、仪表盘、文档 | 大量留白、sans-serif、高对比度 |
| 2 | **Neumorphism** 新拟态 | 健康/冥想应用 | 柔和阴影、浅色调、圆角 12-16px |
| 3 | **Glassmorphism** 玻璃态 | 现代 SaaS、金融仪表盘 | 磨砂玻璃、backdrop-blur、半透明 |
| 4 | **Brutalism** 布鲁塔利斯主义 | 设计作品集、艺术项目 | 粗犷字体、不对称、高对比度 |
| 5 | **Claymorphism** 黏土态 | 教育应用、儿童应用 | 柔和 3D、圆润、友好 |
| 6 | **Neubrutalism** 新布鲁塔利斯主义 | Z 世代品牌、Figma 风格 | 粗边框、明亮色块、趣味性 |
| 7 | **Bento Box Grid** 便当盒网格 | 仪表盘、产品页、作品集 | 不等分网格、卡片布局 |
| 8 | **Dark Mode (OLED)** 深色模式 | 夜间应用、代码平台 | 纯黑背景、霓虹强调色 |
| 9 | **Soft UI Evolution** 柔和 UI | 现代企业应用、SaaS | 柔和阴影、平滑过渡 |
| 10 | **AI-Native UI** AI 原生 | AI 产品、聊天机器人 | 渐变、动态元素、未来感 |

### 落地页样式

| # | 样式 | 最佳用途 |
|---|------|----------|
| 1 | **Hero-Centric** | 有强视觉标识的产品 |
| 2 | **Conversion-Optimized** | 获客、销售页 |
| 3 | **Feature-Rich Showcase** | SaaS、复杂产品 |
| 4 | **Social Proof-Focused** | 服务、B2C 产品 |
| 5 | **Trust & Authority** | B2B、企业、咨询 |

### 仪表盘样式

| # | 样式 | 最佳用途 |
|---|------|----------|
| 1 | **Data-Dense Dashboard** | 复杂数据分析 |
| 2 | **Executive Dashboard** | C-suite 摘要 |
| 3 | **Real-Time Monitoring** | 运维、DevOps |
| 4 | **Financial Dashboard** | 财务、会计 |
| 5 | **Sales Intelligence** | 销售团队、CRM |

---

## 行业推理规则 (100 条)

设计系统会根据产品类型自动应用行业特定规则:

| 类别 | 示例产品 | 推荐样式 | 颜色基调 |
|------|----------|----------|----------|
| **Tech & SaaS** | SaaS, B2B, 开发者工具 | Glassmorphism + Flat | 信任蓝 + 强调对比 |
| **Finance** | 金融科技, 银行, 加密 | Minimalism + Professional | 深蓝/绿 + 金色强调 |
| **Healthcare** | 医疗诊所, 药房, 心理健康 | Accessible + Ethical | 平静蓝/绿 + 白色 |
| **E-commerce** | 通用电商, 奢侈品, 订阅盒 | Feature-Rich + Conversion | 品牌色 + 高对比 CTA |
| **Beauty/Spa** | 美容院, 水疗, 健康 | Soft UI + Organic | 柔粉/鼠尾草绿 + 金色 |
| **Creative** | 作品集, 代理商, 摄影 | Brutalism + Motion | 大胆对比 + 动态 |
| **Gaming** | 游戏, 娱乐 | Cyberpunk + Retro-Futurism | 霓虹 + 深色背景 |

---

## 设计系统指南

### 颜色体系设计

**主色 (Primary Color)**
- 用于主要操作按钮、重要信息、品牌标识
- 选择标准: 符合品牌调性、对比度 >= 4.5:1 (WCAG AA)
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

### 排版系统

**字体选择** (避免 Inter、Roboto):

| 风格 | 标题字体 | 正文字体 | 适用场景 |
|------|----------|----------|----------|
| 优雅 | Cormorant Garamond | Montserrat | 奢侈品、美容、编辑 |
| 专业 | DM Sans | DM Sans | SaaS、企业、B2B |
| 现代 | Space Grotesk | Inter | 科技、创业公司 |
| 友好 | Outfit | Source Sans Pro | 教育、消费品 |
| 大胆 | Bebas Neue | Work Sans | 游戏、娱乐 |

**字号比例** (基于 16px):
```
xs: 12px | sm: 14px | base: 16px | lg: 18px | xl: 20px | 2xl: 24px | 3xl: 30px
```

**行高**:
- 正文: 1.5 (24px for 16px text)
- 标题: 1.2
- 按钮文字: 1.0

### 间距系统

使用 8px 基准网格:
```
xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px | 3xl: 64px
```

### 组件规范

**Button (按钮)**
- 高度: 至少 44px (移动端触控区域)
- 内边距: 水平 16-24px, 垂直 12px
- 圆角: 4-12px
- 必须: hover 状态、cursor-pointer、过渡动画 150-300ms

**Input (输入框)**
- 高度: 至少 48px
- 必须包含: label, placeholder, error message
- 状态: normal, focus, error, disabled

**Card (卡片)**
- 内边距: 16px
- 圆角: 8-16px
- 亮色模式: `bg-white/80` 或更高不透明度
- 必须: cursor-pointer (如可点击)、hover 状态

---

## 专业 UI 通用规则

### 图标和视觉元素

| 规则 | 正确做法 | 错误做法 |
|------|----------|----------|
| **禁止 emoji 图标** | 使用 SVG 图标 (Heroicons, Lucide) | 使用 emoji 作为 UI 图标 |
| **稳定 hover 状态** | 使用颜色/透明度过渡 | 使用 scale 变换导致布局偏移 |
| **品牌 Logo** | 从 Simple Icons 获取官方 SVG | 猜测或使用错误路径 |
| **统一图标尺寸** | 固定 viewBox (24x24) + w-6 h-6 | 随意混用不同尺寸 |

### 交互和光标

| 规则 | 正确做法 | 错误做法 |
|------|----------|----------|
| **Cursor pointer** | 所有可点击元素添加 `cursor-pointer` | 保留默认光标 |
| **Hover 反馈** | 提供视觉反馈 (颜色、阴影、边框) | 无交互指示 |
| **平滑过渡** | `transition-colors duration-200` | 瞬间变化或过慢 (>500ms) |

### 亮/暗模式对比度

| 规则 | 正确做法 | 错误做法 |
|------|----------|----------|
| **玻璃卡片亮色模式** | `bg-white/80` 或更高 | `bg-white/10` (太透明) |
| **文本对比度 (亮色)** | `#0F172A` (slate-900) | `#94A3B8` (slate-400) |
| **边框可见性** | 亮色用 `border-gray-200` | `border-white/10` (不可见) |

### 布局和间距

| 规则 | 正确做法 | 错误做法 |
|------|----------|----------|
| **浮动导航栏** | `top-4 left-4 right-4` 留边距 | 贴边 `top-0 left-0 right-0` |
| **内容填充** | 考虑固定导航栏高度 | 内容被固定元素遮挡 |
| **响应式断点** | 375px, 768px, 1024px, 1440px | 仅考虑一种尺寸 |

---

## 交付前检查清单

### 视觉质量
- [ ] 未使用 emoji 作为图标 (使用 SVG)
- [ ] 所有图标来自统一图标库 (Heroicons/Lucide)
- [ ] 品牌 Logo 正确 (Simple Icons 验证)
- [ ] Hover 状态不导致布局偏移
- [ ] 直接使用主题颜色 (bg-primary) 而非 var() 包装

### 交互
- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] Hover 状态提供清晰视觉反馈
- [ ] 过渡平滑 (150-300ms)
- [ ] 键盘导航的焦点状态可见

### 亮/暗模式
- [ ] 亮色模式文本对比度足够 (4.5:1 最小)
- [ ] 玻璃/透明元素在亮色模式可见
- [ ] 边框在两种模式下可见
- [ ] 交付前测试两种模式

### 布局
- [ ] 浮动元素与边缘有适当间距
- [ ] 无内容被固定导航栏遮挡
- [ ] 在 375px, 768px, 1024px, 1440px 响应式正确
- [ ] 移动端无水平滚动

### 可访问性
- [ ] 所有图片有 alt 文本
- [ ] 表单输入有 labels
- [ ] 颜色不是唯一指示器
- [ ] 尊重 `prefers-reduced-motion`

---

## UI Schema 输出格式

生成的 `ui.schema.yaml` 必须包含以下结构:

```yaml
design_system:
  style: "Glassmorphism"          # 选择的样式
  colors:
    primary: "#2563eb"
    secondary: "#64748b"
    success: "#10b981"
    warning: "#f59e0b"
    error: "#ef4444"
    background: "#ffffff"
    surface: "#f8fafc"
    border: "#e2e8f0"
    text:
      primary: "#1e293b"
      secondary: "#64748b"
      inverse: "#ffffff"

  typography:
    font_family:
      headings: "DM Sans"
      body: "DM Sans"
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
    unit: 8
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

  effects:
    hover_transition: "200ms"
    shadow: "subtle"
    blur: "backdrop-blur-md"

pages:
  - id: home
    title: "首页"
    type: list
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
        actions:
          - type: "navigate"
            target: "detail"
            params: ["id"]

  - id: detail
    title: "详情"
    type: detail
    params:
      - name: "id"
        type: "number"

  - id: create
    title: "创建"
    type: form
    fields:
      - name: "title"
        type: "text"
        label: "标题"
        required: true
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
* **简洁有限**：限制页面数量（例如 <= 3 页），聚焦核心功能和使用路径；
* **预览一致**：预览原型应与 UI Schema 中的结构保持一致，以便下游开发复用；
* **工具优先**：始终先运行设计系统生成脚本获取推荐，而非凭感觉选择。

---

## 不要做 (NEVER)

* **NEVER** 使用泛滥的 AI 风格字体（如 Inter、Roboto 等）或紫色/粉色渐变背景；
* **NEVER** 生成与 PRD 无关的页面或多余的动画效果；
* **NEVER** 使用 emoji 作为 UI 图标（必须使用 SVG 图标库）；
* **NEVER** 忘记给可点击元素添加 `cursor-pointer`；
* **NEVER** 使用低于 4.5:1 的颜色对比度；
* **NEVER** 触控区域小于 44px；
* **NEVER** 忽略 Loading 和 Error 状态的设计；
* **NEVER** 超过 3 个页面（MVP 限制）；
* **NEVER** 跳过设计系统生成步骤直接开始设计。

---

## 数据文件参考

设计系统数据位于 `skills/ui/ui-ux-pro-max-skill/src/ui-ux-pro-max/data/`:

| 文件 | 内容 | 用途 |
|------|------|------|
| `styles.csv` | 67 种 UI 样式 | 样式选择和 CSS 关键词 |
| `colors.csv` | 96 种调色板 | 行业特定颜色推荐 |
| `typography.csv` | 57 种字体组合 | 字体配对和 Google Fonts 链接 |
| `ui-reasoning.csv` | 100 条推理规则 | 产品类型 -> 设计系统映射 |
| `landing.csv` | 落地页模式 | 页面结构和 CTA 策略 |
| `charts.csv` | 图表类型 | 仪表盘图表推荐 |
| `ux-guidelines.csv` | UX 最佳实践 | 可访问性和交互规则 |

遵循这些原则和工作流可以让界面设计既有专业美感又贴合产品目标，便于后续开发落地。
