# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于检查点的 AI Agent 工厂系统,通过流水线式工作流自动化生成可运行的 MVP 应用。系统采用多 Agent 协作模式,每个 Agent 负责特定阶段的任务,由 Sisyphus 调度器统一协调。

## 核心架构

### 流水线工作流

系统通过 `pipeline.yaml` 定义的 6 个阶段顺序执行:

1. **bootstrap** - 将用户想法整理为结构化文档 (`input/idea.md`)
2. **prd** - 生成 MVP 级产品需求文档 (`artifacts/prd/prd.md`)
3. **ui** - 设计 UI 结构和可预览原型 (`artifacts/ui/`)
4. **tech** - 制定技术架构和数据模型 (`artifacts/tech/`, `artifacts/backend/prisma/`)
5. **code** - 生成可运行的前后端代码 (`artifacts/backend/`, `artifacts/client/`)
6. **preview** - 生成运行说明文档 (`artifacts/preview/README.md`)

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
├── agents/                    # Agent 定义
│   ├── orchestrator.checkpoint.md
│   ├── bootstrap.agent.md
│   ├── prd.agent.md
│   ├── ui.agent.md
│   ├── tech.agent.md
│   ├── code.agent.md
│   └── preview.agent.md
├── skills/                    # 可复用技能模块
│   ├── prd/skill.md
│   ├── ui/skill.md
│   ├── tech/skill.md
│   ├── code/skill.md
│   │   └── references/        # 代码生成参考模板
│   └── preview/skill.md
├── policies/                  # 策略文档
│   ├── capability.matrix.md   # 权限矩阵
│   └── failure.policy.md      # 失败处理策略
├── input/                     # 用户输入 (由 bootstrap 生成)
│   └── idea.md
└── artifacts/                 # 各阶段产物
    ├── prd/
    ├── ui/
    ├── tech/
    ├── backend/
    ├── client/
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

### Code Agent 特殊要求
- **必须阅读模板**: 生成代码前必须完整阅读 `skills/code/references/backend-template.md` 和 `frontend-template.md`
- 技术栈: 后端使用 Express + Prisma,前端使用 React Native (或 React Native Web)
- 禁止硬编码敏感信息
- 输出必须包含 package.json 和 README

### UI Agent 特殊要求
- 页面数量不超过 3 页
- 选择极端鲜明的审美方向,避免常见 AI 风格 (Inter 字体、紫色渐变等)
- 预览原型必须可在浏览器中打开
- 保持移动优先设计

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
