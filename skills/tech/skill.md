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

---

## 性能优化指南

虽然 MVP 阶段以快速交付为主，但应在设计时考虑基本的性能优化，避免明显的性能瓶颈。

### 数据库性能

#### 1. 索引策略

**必须添加索引的场景**:
- 外键字段 (Prisma 会自动添加)
- 频繁查询的字段 (如 email, username)
- 排序字段 (如 createdAt)
- 唯一约束字段 (如 @unique)

**Prisma Schema 示例**:
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique              // 自动创建索引
  username  String   @unique              // 自动创建索引
  createdAt DateTime @default(now())

  posts     Post[]

  @@index([createdAt])                    // 手动创建索引用于排序
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  authorId  Int                           // 外键自动创建索引
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  author    User     @relation(fields: [authorId], references: [id])

  @@index([published, createdAt])         // 复合索引
}
```

**索引原则**:
- 查询条件中的字段应考虑索引
- 避免过度索引 (每个索引增加写入成本)
- 复合索引顺序: 先等值查询，再范围查询，最后排序

#### 2. 查询优化

**使用 select 限制字段**:
```typescript
// ✅ 好 - 只返回需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ❌ 避免 - 返回所有字段包括大文本
const users = await prisma.user.findMany();
```

**避免 N+1 查询**:
```typescript
// ✅ 好 - 使用 include 预加载关联
const posts = await prisma.post.findMany({
  include: {
    author: {
      select: { id: true, name: true },
    },
  },
});

// ❌ 避免 - N+1 查询
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
}
```

**使用游标分页 (Cursor Pagination)**:
```typescript
// ✅ 好 - 游标分页性能稳定
async function getPosts(cursor?: number, limit = 20) {
  return prisma.post.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: 'desc' },
  });
}

// ❌ 避免 - 偏移分页在大数据量时性能差
async function getPosts(page = 1, limit = 20) {
  return prisma.post.findMany({
    skip: (page - 1) * limit,  // OFFSET 在大表中很慢
    take: limit,
  });
}
```

#### 3. 事务使用

**仅在必要时使用事务**:
```typescript
// ✅ 好 - 需要原子性时使用事务
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.profile.create({ data: { userId: user.id, ...profileData } });
});

// ❌ 避免 - 单个操作不需要事务
await prisma.$transaction(async (tx) => {
  await tx.user.create({ data: userData });
});
```

### API 性能

#### 1. 响应压缩

在 tech.md 中建议启用 gzip 压缩:

```markdown
**中间件推荐**:
- compression: 启用 gzip 压缩减少响应体积
- 配置: `app.use(compression())`
```

#### 2. 请求超时

设置合理的超时时间防止慢查询阻塞:

```markdown
**超时配置**:
- API 请求超时: 30s
- 数据库查询超时: 10s (Prisma 配置)
- 文件上传超时: 5min
```

#### 3. 分页必须

所有列表接口必须支持分页:

```markdown
**分页规范**:
- 默认每页 20 条
- 最大每页 100 条
- 使用游标分页 (cursor) 而非偏移分页 (offset)
- 返回 hasMore 字段指示是否有更多数据
```

#### 4. 缓存策略 (可选)

对于 MVP 阶段，不强制要求缓存，但可在 tech.md 中标注扩展点:

```markdown
**未来扩展点**:
- 添加 Redis 缓存频繁查询的数据
- 实现 HTTP 缓存头 (ETag, Cache-Control)
```

### 前端性能

#### 1. 列表渲染优化

对于 React Native，必须使用 FlatList:

```markdown
**列表组件选择**:
- ✅ 使用 FlatList/SectionList (虚拟化渲染)
- ❌ 避免使用 ScrollView + map (渲染所有项)
- 配置: getItemLayout (固定高度列表)
```

#### 2. 图片优化

```markdown
**图片处理**:
- 使用 expo-image 或 react-native-fast-image
- 配置占位符和加载状态
- 限制图片尺寸 (如最大 1080p)
- 使用 CDN 加速 (生产环境)
```

#### 3. 组件优化

```markdown
**React 优化**:
- 使用 React.memo 包裹纯展示组件
- 使用 useMemo 缓存计算结果
- 使用 useCallback 稳定函数引用
- 避免在 render 中创建新对象/函数
```

#### 4. 状态更新优化

```markdown
**状态管理**:
- 避免在根组件存储所有状态
- 按功能拆分 Context，减少不必要的重渲染
- 使用 Context 分离读写操作
```

### 性能监控

在 tech.md 中建议添加基本的性能监控:

```markdown
## 性能监控 (可选)

**后端监控**:
- 记录慢查询 (> 1s)
- 监控 API 响应时间
- 记录错误率

**前端监控**:
- 使用 React DevTools Profiler 分析渲染
- 监控 API 请求时间
- 记录应用崩溃
```

### 性能检查清单

在完成技术设计时，确认:

#### 数据库
- [ ] 外键字段有索引
- [ ] 查询条件字段有索引
- [ ] 列表查询使用分页
- [ ] 避免 N+1 查询

#### API
- [ ] 所有列表接口支持分页
- [ ] 响应启用压缩
- [ ] 设置合理的超时时间

#### 前端
- [ ] 长列表使用 FlatList
- [ ] 图片使用优化库
- [ ] 纯展示组件使用 React.memo

#### 文档
- [ ] tech.md 中标注性能相关配置
- [ ] 标注未来的性能优化扩展点

---

**性能优化原则**:
- **MVP 阶段**: 避免明显的性能问题即可，不过度优化
- **可测量**: 在优化前先测量，找到真正的瓶颈
- **逐步改进**: 随着用户增长逐步添加优化措施
- **保持简单**: 不因性能优化而过度复杂化架构

遵循这些性能指南可以确保应用在 MVP 阶段有良好的基础性能，同时为未来的优化预留空间。

---

## 数据库迁移指南

正确的数据库迁移策略对于应用的稳定性和可维护性至关重要。

### Prisma 迁移基础

#### 1. 开发环境迁移

**创建迁移**:

```bash
# 修改 schema.prisma 后，创建新迁移
npx prisma migrate dev --name add_user_email

# 迁移文件会生成在 prisma/migrations/[timestamp]_[name]/
```

**常用命令**:

| 命令 | 用途 | 场景 |
|------|------|------|
| `prisma migrate dev` | 开发环境迁移 | 本地开发时使用 |
| `prisma migrate deploy` | 生产环境迁移 | CI/CD 部署时使用 |
| `prisma migrate reset` | 重置数据库 | 开发环境清空数据 |
| `prisma migrate status` | 查看迁移状态 | 检查是否有未应用的迁移 |
| `prisma db push` | 同步 schema (无迁移) | 原型阶段快速迭代 |

#### 2. 生产环境迁移

**部署流程**:

```bash
# 在生产环境运行
npx prisma migrate deploy

# 此命令只运行迁移，不会自动生成新迁移
# 适用于 CI/CD 流水线
```

**安全检查**:
```bash
# 部署前查看待执行的迁移
npx prisma migrate status

# 确认无误后执行
npx prisma migrate deploy
```

### 迁移最佳实践

#### 1. 向后兼容的变更

**推荐**: 先添加新字段，后删除旧字段

```prisma
// 步骤 1: 添加新字段 (可选)
model User {
  id       Int     @id @default(autoincrement())
  name     String
  fullName String? // 新增，可选
}

// 步骤 2: 数据迁移脚本 (单独迁移)
// 将 name 的值复制到 fullName

// 步骤 3: 使 fullName 必填，删除 name (单独迁移)
model User {
  id       Int    @id @default(autoincrement())
  fullName String
}
```

#### 2. 添加新字段

**可选字段 (推荐)**:

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String
  phone String? // 可选，不需要默认值
}
```

**必填字段 (需要默认值)**:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String
  createdAt DateTime @default(now()) // 有默认值，可以添加
}
```

**必填字段 (无默认值)**:

```sql
-- 需要分步骤:
-- 1. 先添加为可选
-- 2. 填充数据
-- 3. 修改为必填

-- prisma/migrations/xxx_add_phone/migration.sql
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
UPDATE "User" SET "phone" = 'unknown' WHERE "phone" IS NULL;
ALTER TABLE "User" ALTER COLUMN "phone" SET NOT NULL;
```

#### 3. 删除字段

**安全删除流程**:

1. 确保代码不再使用该字段
2. 部署代码变更
3. 等待观察期（建议 1-2 周）
4. 删除数据库字段

```prisma
// 步骤 1: 标记字段为 @deprecated (注释)
model User {
  id    Int    @id @default(autoincrement())
  email String
  // @deprecated 将在 v2.0 删除
  phone String?
}

// 步骤 2: 确认代码不再使用后，删除字段
model User {
  id    Int    @id @default(autoincrement())
  email String
}
```

#### 4. 重命名字段

**推荐方式**: 添加 → 迁移数据 → 删除

```prisma
// 不推荐直接重命名，可能导致数据丢失

// 推荐分步骤:
// 1. 添加新字段
model User {
  id       Int    @id @default(autoincrement())
  name     String // 旧字段
  fullName String? // 新字段
}

// 2. 数据迁移脚本
UPDATE "User" SET "fullName" = "name";

// 3. 删除旧字段
model User {
  id       Int    @id @default(autoincrement())
  fullName String
}
```

### 数据迁移脚本

对于复杂的数据转换，创建独立的迁移脚本:

**`prisma/migrations/scripts/migrate_user_names.ts`**:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始迁移用户名...');

  // 批量更新，避免内存问题
  const batchSize = 100;
  let offset = 0;
  let processed = 0;

  while (true) {
    const users = await prisma.user.findMany({
      where: { fullName: null },
      take: batchSize,
      skip: offset,
    });

    if (users.length === 0) break;

    await Promise.all(
      users.map((user) =>
        prisma.user.update({
          where: { id: user.id },
          data: { fullName: user.name },
        })
      )
    );

    processed += users.length;
    console.log(`已处理 ${processed} 条记录`);
    offset += batchSize;
  }

  console.log('迁移完成');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### SQLite → PostgreSQL 迁移

MVP 阶段使用 SQLite，生产环境迁移到 PostgreSQL:

#### 1. 修改 schema.prisma

```prisma
// 开发环境
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// 生产环境
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 2. 使用环境变量切换

**`schema.prisma`**:

```prisma
datasource db {
  provider = env("DB_PROVIDER") // sqlite 或 postgresql
  url      = env("DATABASE_URL")
}
```

**.env (开发)**:
```
DB_PROVIDER=sqlite
DATABASE_URL=file:./dev.db
```

**.env (生产)**:
```
DB_PROVIDER=postgresql
DATABASE_URL=postgresql://user:password@host:5432/database
```

#### 3. 数据迁移步骤

```bash
# 1. 导出 SQLite 数据
sqlite3 prisma/dev.db .dump > backup.sql

# 2. 修改 provider 为 postgresql
# 3. 创建 PostgreSQL 数据库
# 4. 运行迁移
npx prisma migrate deploy

# 5. 导入数据 (需要转换 SQL 语法)
# 或使用 Prisma 脚本导入
```

### 迁移回滚

Prisma 不支持自动回滚，需要手动处理:

#### 1. 开发环境

```bash
# 重置到最后一个稳定状态
npx prisma migrate reset

# 这会删除所有数据并重新运行所有迁移
```

#### 2. 生产环境

**创建回滚迁移**:

```sql
-- prisma/migrations/xxx_rollback_add_email/migration.sql
ALTER TABLE "User" DROP COLUMN "newColumn";
```

**注意**: 生产环境回滚需要谨慎，建议:
1. 先在预发环境测试
2. 备份数据库
3. 选择低峰期执行
4. 准备回滚方案

### 迁移检查清单

#### 开发阶段
- [ ] schema 变更经过团队审查
- [ ] 迁移文件命名清晰 (`add_xxx`, `remove_xxx`)
- [ ] 数据迁移脚本已测试
- [ ] 本地运行 `prisma migrate dev` 无错误

#### 部署前
- [ ] 在预发环境测试迁移
- [ ] 检查迁移是否向后兼容
- [ ] 确认数据库已备份
- [ ] 准备回滚方案

#### 部署时
- [ ] 使用 `prisma migrate deploy` 而非 `migrate dev`
- [ ] 监控迁移执行时间
- [ ] 验证应用功能正常
- [ ] 检查数据完整性

### 迁移常见问题

**1. 迁移文件冲突**

多人开发时可能产生迁移顺序冲突:

```bash
# 解决方案: 重新创建迁移
npx prisma migrate reset
npx prisma migrate dev --name merge_migrations
```

**2. 迁移太慢**

大表迁移可能很慢:

```sql
-- 使用 CONCURRENTLY 创建索引 (PostgreSQL)
CREATE INDEX CONCURRENTLY "User_email_idx" ON "User"("email");
```

**3. 数据丢失风险**

```bash
# 部署前务必备份
pg_dump -U user database > backup_$(date +%Y%m%d).sql
```

---

遵循这些迁移指南可以确保数据库变更安全、可控，减少生产环境事故风险。
