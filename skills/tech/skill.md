---
name: 技术架构设计指南
description: "将产品需求转化为最小可行的技术方案，制定合理的技术栈和数据模型。当需要确定系统技术栈、定义数据实体和描述服务分层及数据流时触发。"
---

## 思维框架

* **目标对应**：技术方案必须服务于产品的核心价值。先明确哪些功能是必要的，再考虑如何实现；
* **简单优先**：选择简洁成熟的技术栈，以便快速交付和易于维护；
* **可扩展性**：在设计中预留扩展点，让未来添加功能或调整架构时不需要大规模重构；
* **数据驱动**：通过清晰的数据模型表达实体及其关系，让代码和数据库层一一对应。

---

## 技术选型决策树

### 后端技术栈选择

#### 语言和运行时
**推荐**: Node.js + TypeScript
- **适用场景**: 大多数 CRUD 应用、实时应用、快速原型
- **优势**: 生态丰富、前后端技术栈统一、开发效率高
- **限制**: CPU 密集型计算性能相对较弱

**备选**: Python + FastAPI (仅当团队熟悉 Python 时)
- **适用场景**: 数据处理、AI/ML 集成、科学计算
- **优势**: 数据处理库丰富、简洁易读
- **限制**: 异步生态不如 Node.js 成熟

#### Web 框架
**推荐**: Express
- **适用场景**: RESTful API、中小型应用
- **优势**: 成熟稳定、中间件丰富、社区活跃
- **使用建议**: 配合 TypeScript、分层架构、统一错误处理

**备选**: Fastify (性能敏感场景)
- **适用场景**: 高并发、低延迟要求
- **优势**: 性能优秀、内置 Schema 验证
- **限制**: 生态相对较小

**不推荐**: NestJS (MVP 阶段过于复杂)
- 适合大型企业应用，但对 MVP 过度设计

#### ORM/数据库工具
**推荐**: Prisma
- **适用场景**: 所有关系型数据库场景
- **优势**: 类型安全、迁移管理优秀、开发体验好
- **使用建议**: 使用 schema-first 设计、定期生成迁移

**备选**: TypeORM (需要更灵活的查询)
- **适用场景**: 复杂查询、多数据库切换
- **限制**: TypeScript 支持不如 Prisma

#### 数据库选择
**MVP 开发环境**: SQLite
- **适用场景**: 本地开发、快速原型、演示
- **优势**: 零配置、文件数据库、轻量
- **限制**: 不支持并发写入、生产环境需迁移

**生产环境**: PostgreSQL
- **适用场景**: 生产部署、需要并发、复杂查询
- **优势**: 功能完整、性能优秀、支持 JSON
- **迁移建议**: 使用 Prisma 迁移，只需修改 DATABASE_URL

**不推荐**: MongoDB (除非确实需要 NoSQL)
- 关系型数据更适合大多数 MVP 场景

### 前端技术栈选择

#### 平台选择
**仅移动端**: React Native + Expo
- **适用场景**: iOS + Android 原生应用
- **优势**: 跨平台、热更新、丰富组件
- **使用建议**: 使用 Expo Go 快速测试、EAS Build 发布

**移动端 + Web**: React Native Web
- **适用场景**: 需要同时支持移动和 Web
- **优势**: 一套代码多端运行
- **限制**: 部分原生功能需要适配

**仅 Web**: React + Vite
- **适用场景**: 桌面优先、管理后台
- **优势**: 性能优秀、生态成熟
- **使用建议**: 使用 Vite 快速开发、React Router 路由

#### 状态管理
**简单状态**: React Context API
- **适用场景**: < 5 个全局状态、简单数据流
- **优势**: 零依赖、学习成本低
- **使用建议**: 按功能拆分 Context、避免过度嵌套

**中等复杂度**: Zustand
- **适用场景**: 多个独立状态、需要中间件
- **优势**: 轻量、API 简洁、性能好
- **使用建议**: 按模块拆分 store

**复杂应用**: Redux Toolkit (MVP 阶段不推荐)
- 适合大型应用，但 MVP 阶段过于复杂

#### UI 组件
**React Native**: React Native Paper / NativeBase
- **推荐**: React Native Paper (Material Design)
- **使用建议**: 自定义主题、复用基础组件

**React Web**: Tailwind CSS / shadcn/ui
- **推荐**: Tailwind CSS (快速开发)
- **使用建议**: 配置设计系统、避免内联样式

### 实时功能选择

**简单轮询**: 定时 fetch (< 10s 延迟可接受)
- **适用场景**: 非关键数据更新、低频刷新
- **优势**: 实现简单、无需额外基础设施

**服务器推送**: WebSocket / Socket.io
- **适用场景**: 聊天、通知、实时协作
- **优势**: 双向通信、延迟低
- **使用建议**: 使用 Socket.io 处理重连和降级

**服务器发送事件**: Server-Sent Events (SSE)
- **适用场景**: 单向推送、日志流
- **优势**: 基于 HTTP、自动重连
- **限制**: 仅服务器到客户端

### 文件存储选择

**MVP 阶段**: 本地文件系统
- **适用场景**: 小文件、低并发
- **限制**: 不支持分布式、备份需自行处理

**生产环境**: 对象存储 (S3 / Cloudflare R2)
- **适用场景**: 图片、视频、文档
- **优势**: 可扩展、CDN 加速、版本管理
- **迁移建议**: 使用统一的文件服务抽象层

---

## 决策原则

* **技术栈选择**：优先选用社区活跃、文档齐全的语言和框架，例如 Node.js + Express、Prisma ORM；
* **数据库**：在 MVP 阶段选择轻量数据库（如 SQLite），如预期数据和并发增长较大，可规划后期迁移至 PostgreSQL；
* **系统分层**：遵循路由层→业务逻辑层→数据访问层的分层模式，确保逻辑清晰、职责单一；
* **接口设计**：使用 RESTful API 标准，明确请求路径、方法和返回数据结构；
* **配置与部署**：记录依赖版本、环境变量和启动命令，便于团队成员快速搭建环境；
* **扩展策略**：在文档中标注哪些组件未来可能拆分或重构，但不提前实现。

---

## 数据模型设计原则

### 实体识别
1. 从 PRD 的用户故事中提取名词 → 候选实体
2. 区分核心实体 (必须) 和辅助实体 (可选)
3. 每个实体必须有明确的业务含义

### 关系设计
- **一对多** (1:N): 如 User → Posts
- **多对多** (M:N): 通过中间表，如 Posts ↔ Tags
- **一对一** (1:1): 少用，如 User → UserProfile

### 字段原则
- 必须字段: `id`, `createdAt`, `updatedAt`
- 避免冗余字段 (可通过计算或关联获取)
- 使用合适的数据类型 (String, Int, Float, Boolean, DateTime)
- 敏感字段标注 (如密码不应直接存储)

### Prisma Schema 示例结构
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 技术文档输出要求

生成的 `tech.md` 必须包含以下章节：

### 1. 技术栈总览
```markdown
## 技术栈

**后端**
- 运行时: Node.js 20+
- 语言: TypeScript 5+
- 框架: Express 4.x
- ORM: Prisma 5.x
- 数据库: SQLite (开发) / PostgreSQL (生产)

**前端**
- 框架: React Native + Expo
- 语言: TypeScript
- 导航: React Navigation 6
- 状态管理: React Context API
- HTTP 客户端: Axios

**开发工具**
- 包管理: npm
- 代码规范: ESLint + TypeScript
- 版本控制: Git
```

### 2. 系统架构
```markdown
## 架构设计

**分层结构**
- 路由层 (routes/): 定义 API 端点
- 控制器层 (controllers/): 处理请求和响应
- 服务层 (services/): 业务逻辑
- 数据访问层: Prisma ORM

**数据流**
Client → API Gateway → Controller → Service → Prisma → Database
```

### 3. API 设计
```markdown
## API 端点设计

| 端点 | 方法 | 描述 | 请求体 | 响应 |
|------|------|------|--------|------|
| /api/items | GET | 获取列表 | - | Item[] |
| /api/items/:id | GET | 获取详情 | - | Item |
| /api/items | POST | 创建 | CreateItemDto | Item |
| /api/items/:id | PUT | 更新 | UpdateItemDto | Item |
| /api/items/:id | DELETE | 删除 | - | { deleted: true } |
```

### 4. 数据模型说明
```markdown
## 数据模型

### Item
- id: 主键
- title: 标题 (必填)
- description: 描述 (可选)
- amount: 金额 (必填)
- createdAt: 创建时间
- updatedAt: 更新时间

**关系**: 无
```

### 5. 环境配置
```markdown
## 环境变量

**后端 (.env)**
- PORT: 服务端口 (默认 3000)
- DATABASE_URL: 数据库连接字符串
- NODE_ENV: 环境 (development/production)
- CORS_ORIGINS: 允许的跨域来源

**前端 (.env)**
- EXPO_PUBLIC_API_URL: 后端 API 地址
```

### 6. 扩展规划
```markdown
## 未来扩展点

**短期 (v1.1)**
- 添加分页和筛选
- 实现数据导出功能

**中期 (v2.0)**
- 迁移到 PostgreSQL
- 添加用户认证

**长期**
- 拆分为微服务
- 添加缓存层 (Redis)
```

---

## 不要做 (NEVER)

* **NEVER** 过度设计，如在 MVP 阶段引入微服务、复杂消息队列或高性能缓存；
* **NEVER** 选择冷门或维护不佳的技术，仅因为个人喜好；
* **NEVER** 在数据模型中添加未通过产品验证的字段或关系；
* **NEVER** 为尚未确定的场景编写冗余代码；
* **NEVER** 在技术文档中包含具体代码实现（那是 Code Agent 的职责）；
* **NEVER** 选择需要复杂配置或学习成本高的技术栈；
* **NEVER** 在 Prisma Schema 中使用 `@default(now())` 之外的复杂默认值；
* **NEVER** 设计超过 10 个数据表的数据模型（MVP 阶段）。

---

## 决策检查清单

在完成技术设计前，确认以下各项：

### 技术选型
- [ ] 后端技术栈明确且合理
- [ ] 前端平台选择符合产品需求
- [ ] 数据库选择适合 MVP 阶段
- [ ] 所选技术都有活跃的社区支持

### 数据模型
- [ ] 所有实体都来自 PRD
- [ ] 关系设计清晰无冗余
- [ ] 每个表都有 id, createdAt, updatedAt
- [ ] 没有未经验证的字段

### API 设计
- [ ] 端点遵循 RESTful 规范
- [ ] 响应格式统一
- [ ] 错误处理有明确定义

### 文档完整性
- [ ] tech.md 包含所有必需章节
- [ ] schema.prisma 语法正确
- [ ] 环境变量清晰列出
- [ ] 扩展规划合理

遵循这些指南可以让技术设计简洁而有弹性，为后续开发提供清晰路线。
