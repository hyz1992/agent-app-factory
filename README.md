# AI App Factory

> 将产品想法自动转化为可运行 MVP 应用的 AI Agent 工厂系统

AI App Factory 是一个基于检查点的智能应用生成系统，通过多 Agent 协作流水线，帮助您快速将产品想法转化为包含前后端代码、测试、文档的完整可运行应用。

## ✨ 核心特性

### 🚀 端到端自动化
- **从想法到代码**: 输入产品描述，输出完整的前后端应用
- **7 阶段流水线**: 需求分析 → UI 设计 → 技术架构 → 代码生成 → 质量验证 → 部署指南
- **检查点机制**: 每个阶段完成后暂停确认，确保输出符合预期

### 🎯 生产就绪
生成的应用不是玩具项目，而是包含生产级特性的完整应用：

- ✅ 完整的前后端代码（Express + Prisma + React Native）
- ✅ 单元测试和集成测试（Vitest + Jest）
- ✅ API 文档（Swagger/OpenAPI）
- ✅ 数据库种子数据
- ✅ Docker 部署配置
- ✅ CI/CD 流水线（GitHub Actions）
- ✅ 错误处理和日志监控
- ✅ 性能优化和安全检查

### 🛡️ 质量保证
- **代码规范**: 遵循 TypeScript 最佳实践和代码规范
- **测试覆盖**: 要求 > 60% 的测试覆盖率
- **安全检查**: 输入验证、SQL 注入防护、CORS 配置
- **性能优化**: 数据库索引、查询优化、缓存策略

### 🎨 MVP 聚焦
- 专注核心功能，避免过度设计
- 页面数量限制在 3 页以内
- 明确列出非目标，防止范围蔓延
- 快速交付，后续迭代

## 📋 前置要求

**必需的 AI 助手**:

本项目必须配合 AI 编程助手使用，推荐以下工具之一：

- **Claude Code** (https://claude.ai/code) - 推荐 ⭐
- **OpenCode** 或其他支持 Agent 模式的 AI 助手

> ⚠️ 重要：本项目的 Agent 和 Skill 文件是以 Markdown 格式编写的 AI 指令，需要 AI 助手来解读和执行。人工无法直接运行这些流水线。

## 🚀 快速开始

### 方式 A: 使用 CLI 工具（推荐）

```bash
# 1. 全局安装 Agent Factory
npm install -g agent-app-factory

# 2. 在任意目录初始化项目
mkdir my-app && cd my-app
factory init

```

### 方式 B: 直接使用项目模板

### 1. 准备产品想法

准备一个简单的产品描述，例如：

```
我想做一个移动端记账应用，帮助年轻人快速记录日常支出，避免月底超支。
主要功能是记录金额、选择分类（饮食、交通、娱乐、其他），查看本月总支出。
```

### 2. 启动流水线

在 Claude Code 或其他 AI 助手中，执行：

```
请阅读 pipeline.yaml 和 agents/orchestrator.checkpoint.md，
启动流水线，帮我将这个产品想法转化为可运行的应用：

[粘贴你的产品想法]
```

### 3. 跟随流水线

系统会按以下 7 个阶段执行，每个阶段完成后会暂停并要求确认：

**阶段 1: Bootstrap** - 结构化产品想法
- 输入：你的产品描述
- 输出：`input/idea.md`（结构化的产品文档）
- 确认内容：问题定义、目标用户、核心价值、假设

**阶段 2: PRD** - 生成产品需求文档
- 输入：`input/idea.md`
- 输出：`artifacts/prd/prd.md`
- 确认内容：用户故事、功能列表、非功能需求

**阶段 3: UI** - 设计 UI 结构和原型 (🎨 Pro Max 增强)
- 输入：`artifacts/prd/prd.md`
- 输出：`artifacts/ui/ui.md` + 可预览的 HTML 原型
- 确认内容：页面结构、交互流程、视觉设计
- 特色：集成 ui-ux-pro-max 设计系统（67 种样式、96 种调色板、100 条行业规则）

**阶段 4: Tech** - 设计技术架构
- 输入：`artifacts/prd/prd.md`
- 输出：`artifacts/tech/tech.md` + `artifacts/backend/prisma/schema.prisma`
- 确认内容：技术栈、数据模型、API 设计

**阶段 5: Code** - 生成完整代码
- 输入：UI Schema + Tech 设计 + Prisma Schema
- 输出：`artifacts/backend/` + `artifacts/client/`
- 确认内容：前后端代码、测试、配置文件

**阶段 6: Validation** - 验证代码质量
- 输入：生成的代码
- 输出：`artifacts/validation/report.md`
- 确认内容：依赖安装、类型检查、Prisma 验证结果

**阶段 7: Preview** - 生成部署指南
- 输入：完整的代码
- 输出：`artifacts/preview/README.md` + `GETTING_STARTED.md`
- 确认内容：本地运行说明、Docker 部署、CI/CD 配置

### 4. 运行生成的应用

流水线完成后，在生成的代码目录中：

```bash
# 后端
cd artifacts/backend
npm install
npm run dev

# 前端
cd artifacts/client
npm install
npm run web  # Web 版
npm run ios  # iOS 模拟器
npm run android  # Android 模拟器
```

详细运行说明见生成的 `artifacts/preview/GETTING_STARTED.md`。

## 📁 项目结构

生成的产物存放在以下目录：

```
artifacts/
├── prd/                    # 产品需求文档
├── ui/                     # UI 设计和原型
├── tech/                   # 技术架构文档
├── backend/                # 后端代码（Express + Prisma）
│   ├── src/
│   ├── prisma/
│   │   ├── schema.prisma   # 数据模型
│   │   └── seed.ts         # 种子数据
│   ├── tests/              # 测试
│   └── docs/               # API 文档
├── client/                 # 前端代码（React Native）
│   ├── src/
│   ├── __tests__/
│   └── app.json
├── validation/             # 代码质量验证报告
└── preview/                # 部署和运行指南
```

## 🎯 适用场景

### ✅ 适合
- 快速验证产品想法（MVP）
- 创业项目的 0-1 阶段
- 内部工具和管理系统
- 学习全栈开发最佳实践
- 原型演示和需求沟通

### ❌ 不适合
- 复杂的企业级系统（多租户、权限系统）
- 需要高度定制的 UI 框架
- 实时性要求极高的系统（游戏、视频通话）
- 已有成熟竞品的通用产品

## 💡 使用技巧

### 提供清晰的产品描述
越详细的描述，生成的应用越符合预期：

- ✅ 好："一个帮助健身新手记录训练的应用，支持记录运动类型、时长、消耗卡路里，并查看本周训练统计"
- ❌ 差："做一个健身应用"

### 在检查点仔细确认
每个阶段完成后：
- 仔细阅读生成的文档/代码
- 如果不符合预期，选择"重试"并提供修改建议
- 确认无误后再继续，避免错误累积

### 利用非目标控制范围
在 Bootstrap 阶段，明确列出"不做什么"：
- "不支持多人协作"（聚焦个人用户）
- "不做数据分析"（聚焦核心记录功能）
- "暂不集成第三方服务"（降低技术复杂度）

### 逐步迭代
第一次生成后：
1. 先运行并测试核心功能
2. 发现问题或新需求后，创建新分支
3. 修改 `input/idea.md` 或 `artifacts/prd/prd.md`
4. 从相应阶段重新运行流水线

## 🔧 技术栈

生成的应用使用以下技术栈：

**后端**:
- Node.js + Express
- Prisma ORM（支持 SQLite/PostgreSQL）
- TypeScript
- Vitest（测试框架）

**前端**:
- React Native + Expo
- TypeScript
- React Navigation
- Jest + React Testing Library

**部署**:
- Docker + docker-compose
- GitHub Actions (CI/CD)
- Railway (后端) + Netlify (前端 Web)

## 📚 文档

- [CLAUDE.md](CLAUDE.md) - 项目完整说明（AI 助手参考）
- `agents/*.agent.md` - 各阶段 Agent 定义
- `skills/*.md` - 可复用的知识模块
- `policies/*.md` - 策略和规范文档
- `templates/*.md` - 配置模板

## 🤝 贡献

欢迎贡献新的 Agent、Skill 或改进现有流水线。

## 📄 许可证

MIT License

---

**开始你的第一个 AI 生成应用吧！** 🚀

如有问题或建议，欢迎提 Issue 或 PR。
