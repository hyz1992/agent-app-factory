# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于检查点的 AI Agent 工厂系统,通过流水线式工作流自动化生成可运行的 MVP 应用。系统采用多 Agent 协作模式,每个 Agent 负责特定阶段的任务,由 Sisyphus 调度器统一协调。

**重要**: 本项目必须配合 AI 编程助手使用，如:
- **Claude Code** (claude.ai/code) - 推荐
- **OpenCode** 或其他支持 Agent 模式的 AI 助手

本项目的 Agent 定义 (`.agent.md`) 和 Skill 文件 (`skill.md`) 都是以 Markdown 格式编写的 AI 指令，需要 AI 助手来解读和执行。人工无法直接运行这些流水线，必须通过 AI 助手作为执行引擎。

## 核心架构

### 流水线工作流

系统通过 `pipeline.yaml` 定义的 7 个阶段顺序执行:

1. **bootstrap** - 将用户想法整理为结构化文档 (`input/idea.md`)
2. **prd** - 生成 MVP 级产品需求文档 (`artifacts/prd/prd.md`)
3. **ui** - 设计 UI 结构和可预览原型 (`artifacts/ui/`)
4. **tech** - 制定技术架构和数据模型 (`artifacts/tech/`, `artifacts/backend/prisma/`)
5. **code** - 生成可运行的前后端代码 (`artifacts/backend/`, `artifacts/client/`)
6. **validation** - 验证代码质量（依赖、类型检查、Prisma schema）
7. **preview** - 生成运行说明文档 (`artifacts/preview/README.md`)

### 调度器 (Sisyphus Orchestrator)

调度器是整个系统的核心控制组件,负责:

- 按顺序执行 pipeline.yaml 定义的各个 Stage
- 验证每个阶段的输入/输出和退出条件 (exit_criteria)
- 维护流水线状态 (`pipeline/state.json`)
- 执行权限检查,防止 Agent 越权读写
- 根据失败策略处理异常情况
- 在每个检查点暂停,等待人工确认后继续

**关键约束**:
- 严格按顺序执行,不可跳跃或并行
- 同一时刻只能激活一个 Agent
- 所有产物必须落盘到 `artifacts/` 目录
- 不得修改已确认完成的产物
- **上下文隔离**: Agent 只能从指定输入文件读取信息,不得依赖对话历史（详见 `policies/context-isolation.md`）

### 上下文优化（节省 Token）

流水线支持**分会话执行**以减少 Token 消耗：

1. 每个阶段完成后，状态保存到 `pipeline/state.json`
2. 用户可新建会话，输入 `请继续执行流水线`
3. 新会话从上次检查点继续，无需重放历史

**好处**：
- 每阶段独享干净上下文，避免 Token 累积
- 适用于所有 AI 助手（Claude Code、OpenCode 等）
- 支持中断恢复

### Agent 系统

每个 Agent 对应一个 `.agent.md` 文件,定义了:
- **角色定位** - Agent 的职责边界
- **输入/输出** - 只读文件和必须生成的文件
- **执行约束** - 禁止事项和限制条件
- **允许使用的技能** - 可加载的 Skill 文件

### 技能 (Skills)

Skills 是可复用的知识模块 (`skills/*/skill.md`),包含:
- **思维框架** - 指导 Agent 的思考方式
- **决策原则** - 具体的操作准则
- **反模式 (NEVER)** - 明确禁止的行为

每个 Agent 在执行时会加载对应的 Skill,按照其指引完成任务。

## 权限和安全

### 能力边界矩阵 (capability.matrix.md)

定义了每个 Agent 严格的读写权限:

| Agent | 可读取 | 可写入 |
|-------|--------|--------|
| bootstrap | 无 | `input/` |
| prd | `input/` | `artifacts/prd/` |
| ui | `artifacts/prd/` | `artifacts/ui/` |
| tech | `artifacts/prd/` | `artifacts/tech/`, `artifacts/backend/prisma/` |
| code | `artifacts/ui/`, `artifacts/tech/`, `artifacts/backend/prisma/` | `artifacts/backend/`, `artifacts/client/` |
| validation | `artifacts/backend/`, `artifacts/client/` | `artifacts/validation/` |
| preview | `artifacts/backend/`, `artifacts/client/` | `artifacts/preview/` |

**越权处理**: 若 Agent 写入未授权目录,文件会被移至 `artifacts/_untrusted/<stage-id>/`,流水线暂停并等待人工介入。

### 失败策略 (failure.policy.md)

失败定义:
- 输出文件缺失或不符合 exit_criteria
- Agent 越权写入
- 脚本错误或无法读取输入

处理流程:
1. 每个 Stage 允许自动重试一次
2. 失败产物移至 `artifacts/_failed/<stage-id>/`
3. 连续失败两次后暂停,等待人工介入
4. 回滚到最近成功的检查点重新执行

## 目录结构

```
.
├── pipeline.yaml              # 流水线定义文件
├── config.yaml                # 项目配置文件（可选）
├── agents/                    # Agent 定义
│   ├── orchestrator.checkpoint.md  # 调度器核心定义
│   ├── orchestrator-implementation.md  # 调度器实现指南
│   ├── bootstrap.agent.md
│   ├── prd.agent.md
│   ├── ui.agent.md
│   ├── tech.agent.md
│   ├── code.agent.md
│   ├── validation.agent.md    # 代码验证 Agent
│   └── preview.agent.md
├── skills/                    # 可复用技能模块
│   ├── bootstrap/skill.md     # 产品想法结构化
│   ├── prd/skill.md           # PRD 生成
│   ├── ui/skill.md            # UI 设计
│   ├── tech/skill.md          # 技术架构 + 数据库迁移
│   ├── code/skill.md          # 代码生成 + 测试 + 日志
│   │   └── references/        # 代码生成参考模板
│   │       ├── backend-template.md   # 生产就绪后端模板
│   │       └── frontend-template.md  # 生产就绪前端模板
│   └── preview/skill.md       # 部署配置 + 快速启动指南
├── policies/                  # 策略文档
│   ├── capability.matrix.md   # 权限矩阵
│   ├── failure.policy.md      # 失败处理策略 (含恢复指南)
│   ├── context-isolation.md   # 上下文隔离策略 (节省 Token)
│   ├── error-codes.md         # 统一错误码规范
│   ├── code-standards.md      # 代码规范
│   ├── pr-template.md         # PR 模板和代码审查清单
│   └── changelog.md           # Changelog 生成规范
├── templates/                 # 配置模板
│   ├── cicd-github-actions.md # CI/CD 配置 (GitHub Actions)
│   └── git-hooks-husky.md     # Git Hooks 配置 (Husky)
├── input/                     # 用户输入 (由 bootstrap 生成)
│   └── idea.md
└── artifacts/                 # 各阶段产物
    ├── prd/
    ├── ui/
    ├── tech/
    ├── backend/
    ├── client/
    ├── validation/            # 代码验证报告
    ├── preview/
    ├── _failed/               # 失败产物归档
    └── _untrusted/            # 越权文件隔离
```

## 设计原则

### MVP 至上
- 每个阶段只实现核心必需功能
- 明确列出非目标 (Non-Goals),防止范围蔓延
- 不引入认证、授权等非核心功能

### 职责分离
- 每个 Agent 只负责自己的领域,不越界
- PRD 不包含技术细节,Tech 不涉及 UI 设计
- Code Agent 严格按照 UI Schema 和 Tech 设计实现

### 可验证性
- 每个阶段定义明确的 exit_criteria
- 所有功能可测试、可本地运行
- 产物必须结构化、可被下游消费

### 检查点机制
- 每个阶段完成后暂停,等待人工确认
- 提供"继续""重试""暂停"选项
- 失败时自动回滚到上一个成功检查点

## 关键约束

### 全局约束
- 始终按 pipeline.yaml 定义的顺序执行
- 不得跳过阶段或修改已完成产物
- 所有产物必须写入 artifacts/ 目录
- 遵循能力矩阵的权限限制
- **上下文隔离**: Agent 只能从指定输入文件读取信息，不得依赖对话历史（详见 `policies/context-isolation.md`）

### Code Agent 特殊要求
- **必须阅读模板**: 生成代码前必须完整阅读 `skills/code/references/backend-template.md` 和 `frontend-template.md`
- 技术栈: 后端使用 Express + Prisma,前端使用 React Native (或 React Native Web)
- 禁止硬编码敏感信息
- 输出必须包含 package.json 和 README

**生成应用必需包含**:
- **测试框架**: 后端 Vitest,前端 Jest + React Testing Library
- **种子数据**: `prisma/seed.ts` 用于开发环境数据填充
- **API 文档**: Swagger/OpenAPI 规范 (`docs/api-spec.yaml`)
- **统一错误码**: 遵循 `policies/error-codes.md` 规范
- **日志和监控**: 结构化日志 (winston/pino) + 健康检查端点
- **安全检查清单**: 输入验证、SQL 注入防护、CORS 配置等
- **性能优化**: 数据库索引、缓存策略、查询优化

### Tech Agent 特殊要求
- 必须包含数据库迁移策略 (Prisma Migrate)
- 提供 SQLite → PostgreSQL 迁移指南
- 包含性能优化建议 (索引、查询优化)

### UI Agent 特殊要求
- 页面数量不超过 3 页
- 选择极端鲜明的审美方向,避免常见 AI 风格 (Inter 字体、紫色渐变等)
- 预览原型必须可在浏览器中打开
- 保持移动优先设计

### Preview Agent 特殊要求
- 生成 `GETTING_STARTED.md` 快速启动指南
- 包含 Docker 部署配置 (docker-compose.yml)
- 提供 CI/CD 配置参考 (GitHub Actions)
- 包含 Git Hooks 配置参考 (Husky)

## 工作流程

1. 用户提供产品想法
2. Sisyphus 读取 pipeline.yaml,开始执行 bootstrap 阶段
3. 每个 Agent 完成任务后,Sisyphus 验证产物和 exit_criteria
4. 验证通过后,向用户汇报产物列表,等待确认
5. 用户确认后,进入下一阶段
6. 若失败,按失败策略处理 (重试/回滚/人工介入)
7. 所有阶段完成后,生成最终的运行说明文档

## 状态管理

流水线通过状态机运行,维护在 `pipeline/state.json`:

- **idle** - 等待启动
- **running** - 正在执行某个 Stage
- **waiting_for_confirmation** - 等待人工确认
- **paused** - 人工暂停
- **failed** - 检测到失败,需要人工介入

只有 Sisyphus 有权限更新状态。

## 质量保证和开发工作流

### 代码规范 (code-standards.md)
- TypeScript 编码规范和最佳实践
- 文件结构和命名约定
- 注释和文档要求
- Git 提交消息规范 (Conventional Commits)

### 错误处理 (error-codes.md)
- 统一错误码结构: `[MODULE]_[ERROR_TYPE]_[SPECIFIC]`
- 标准错误类型: VALIDATION, NOT_FOUND, FORBIDDEN, CONFLICT, INTERNAL_ERROR
- 前后端错误码映射和用户友好提示

### 测试策略
- **后端**: Vitest 单元测试 + 集成测试
- **前端**: Jest + React Testing Library
- 测试覆盖率要求 > 60%
- 关键路径必须有测试

### 数据库管理
- **开发环境**: SQLite + 种子数据 (`prisma/seed.ts`)
- **生产环境**: PostgreSQL
- **迁移策略**: Prisma Migrate (dev/deploy/reset)
- 提供 SQLite → PostgreSQL 迁移指南

### CI/CD 流水线
- **GitHub Actions** 自动化测试和构建
- **后端 CI**: lint, type-check, test, build
- **前端 CI**: lint, type-check, test, web build, EAS preview
- **部署流水线**: Railway (后端), Netlify (前端), App Store/Play Store (移动端)

### Git Hooks (Husky)
- **pre-commit**: lint-staged + type-check
- **commit-msg**: commitlint 验证提交消息格式
- **pre-push**: 运行测试 (可选)

### 代码审查
- PR 模板 (`.github/PULL_REQUEST_TEMPLATE.md`)
- 10 维度代码审查清单:
  - 功能完整性、代码质量、测试覆盖
  - 安全性、性能、文档完整性
  - 错误处理、可维护性、一致性、向后兼容

### Changelog 管理
- 遵循 Keep a Changelog 格式
- Semantic Versioning (MAJOR.MINOR.PATCH)
- 与 Conventional Commits 集成
- 自动化工具: conventional-changelog-cli, release-it

