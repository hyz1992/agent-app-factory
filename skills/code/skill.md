---
name: 全栈代码生成指南
description: "在已有UI结构和技术架构基础上生成可运行的前后端代码，实现MVP的核心功能。触发条件：需要创建应用骨架、构建API端点、执行数据库迁移和生成客户端界面时。"
---

## 思维框架

* **需求驱动**：始终以 PRD 和 UI Schema 中确认的功能为开发范围，任何代码都应有明确的业务需求支撑；
* **迭代式开发**：先生成最小可运行的骨架，再逐步补充细节；
* **一致性**：遵循技术设计文件中定义的技术栈、项目结构和命名规范，不随意更改；
* **可测试性**：生成的代码应易于本地运行和调试，方便发现并修复问题。

## 决策原则

* **项目初始化**：使用官方或社区推荐的 CLI 工具创建基础结构，如 `npm init`、`npx prisma init`、`npx create-express-api` 或 `npx expo init`，然后根据 UI Schema 调整目录；
* **后端开发**：
  - 使用 Express 搭建 RESTful API，并基于 Prisma 定义的数据模型生成 CRUD 控制器；
  - 专注于核心业务流程，错误处理清晰简洁；
  - 将配置（端口、数据库连接）参数化，便于环境调整。
* **数据库操作**：
  - 使用 Prisma schema 生成迁移脚本；
  - 自动创建和种子填充开发环境数据库；
* **前端开发**：
  - 使用 React Native (或 React Native Web) 创建页面；
  - 根据 UI Schema 设计组件，优先实现核心页面；
  - 使用 Axios 或 Fetch 调用后端 API；
  - 先使用 mock 数据验证 UI，再接入真实接口。
* **文档和说明**：在生成的仓库中包含简要的 README，说明如何安装依赖、启动服务和连接数据库。

---

## 最小测试要求 (MVP Test Requirements)

即使是 MVP 阶段，也必须包含基础测试以保证代码质量。测试不求全面，但求覆盖关键路径。

### 后端测试要求

**必须生成的测试**:
- [ ] 健康检查端点测试 (`GET /health` 返回 200)
- [ ] 每个资源的核心 CRUD 端点冒烟测试 (至少创建、读取、列表)
- [ ] 输入验证测试 (测试 Zod schema 拒绝无效数据)

**测试工具**: Vitest 或 Jest
**测试文件位置**: `src/__tests__/` 或 `src/**/*.test.ts`

**测试示例结构**:
```typescript
// src/__tests__/items.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Items API', () => {
  it('should return health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('should create a new item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ title: 'Test Item', amount: 100 });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('should reject invalid item', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ title: '' }); // 缺少必填字段

    expect(res.status).toBe(400);
  });

  it('should list all items', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
```

**package.json 测试脚本**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.0"
  }
}
```

### 前端测试要求

**必须生成的测试**:
- [ ] 关键页面渲染测试 (主页、详情页至少各一个)
- [ ] 核心组件渲染测试 (Button, Input 等基础组件)
- [ ] API Hook 基础测试 (模拟请求成功和失败场景)

**测试工具**: Jest + React Native Testing Library
**测试文件位置**: `src/**/__tests__/` 或 `src/**/*.test.tsx`

**测试示例结构**:
```typescript
// src/screens/__tests__/HomeScreen.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('should render without crashing', () => {
    render(<HomeScreen />);
    expect(screen.getByText(/home/i)).toBeTruthy();
  });

  it('should show loading state initially', () => {
    render(<HomeScreen />);
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });
});

// src/components/ui/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Click</Button>);

    fireEvent.press(getByText('Click'));
    expect(onPress).toHaveBeenCalled();
  });

  it('should be disabled when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress} loading>Click</Button>);

    fireEvent.press(getByText('Click'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

**package.json 测试配置**:
```json
{
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.4.0"
  }
}
```

### 测试覆盖率目标 (MVP 阶段)

**不要求**:
- 100% 代码覆盖率
- 集成测试或 E2E 测试
- 复杂的 Mock 和 Stub

**只要求**:
- 关键路径可运行 (Happy Path)
- 基本的错误处理验证
- 冒烟测试 (Smoke Test) 保证应用能启动

### 测试运行要求

- [ ] 后端测试必须能通过 `npm test` 运行
- [ ] 前端测试必须能通过 `npm test` 运行
- [ ] 所有测试在 CI 环境下能通过 (不依赖本地配置)
- [ ] 测试时间不超过 30 秒 (MVP 阶段)

---

## API 文档生成 (Swagger/OpenAPI)

后端必须生成可浏览的 API 文档，让前端开发者和测试人员无需阅读代码即可了解接口定义。

### 必须实现

**依赖安装**:
```json
{
  "dependencies": {
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.0"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.1.0",
    "@types/swagger-jsdoc": "^6.0.0"
  }
}
```

**Swagger 配置** (`src/config/swagger.ts`):
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'MVP 后端 API 文档',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境',
      },
    ],
    components: {
      schemas: {
        // 定义通用响应格式
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                details: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // 扫描路由文件中的注释
};

export const swaggerSpec = swaggerJsdoc(options);
```

**路由注册** (`src/app.ts`):
```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// JSON 格式的 OpenAPI spec
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});
```

### 路由注释格式

每个 API 端点必须添加 JSDoc 注释描述：

```typescript
/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: 获取项目列表
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Item'
 *       500:
 *         description: 服务器错误
 */
router.get('/', itemController.list);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: 创建项目
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *             properties:
 *               title:
 *                 type: string
 *                 description: 项目标题
 *                 example: 午餐
 *               description:
 *                 type: string
 *                 description: 项目描述
 *               amount:
 *                 type: number
 *                 description: 金额
 *                 example: 25.5
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 参数验证失败
 */
router.post('/', itemController.create);
```

### Schema 定义

为每个数据模型添加 Swagger schema 定义：

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: 唯一标识
 *         title:
 *           type: string
 *           description: 项目标题
 *         description:
 *           type: string
 *           description: 项目描述
 *         amount:
 *           type: number
 *           description: 金额
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */
```

### 访问 API 文档

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### API 文档检查清单

- [ ] 所有 GET 端点有 Swagger 注释
- [ ] 所有 POST/PUT 端点有 requestBody 定义
- [ ] 所有响应状态码有描述
- [ ] 数据模型有 Schema 定义
- [ ] 示例数据 (example) 填写正确
- [ ] Swagger UI 可正常访问

---

## 后端实现检查清单

在生成后端代码时，必须逐项确认以下要求：

### 项目结构
- [ ] 使用 TypeScript 严格模式 (`strict: true`)
- [ ] 按照模板创建目录结构: `src/config`, `src/lib`, `src/middleware`, `src/routes`, `src/controllers`, `src/services`, `src/validators`
- [ ] 包含 `package.json` 完整的依赖和脚本
- [ ] 包含 `tsconfig.json` 正确的编译配置
- [ ] 包含 `.env.example` 环境变量模板
- [ ] 包含 `.gitignore` 排除敏感文件

### API 设计
- [ ] 所有路由使用 Express Router 组织
- [ ] RESTful 命名: `GET /api/items`, `POST /api/items`, `GET /api/items/:id`
- [ ] 统一响应格式: `{ success: boolean, data?: T, error?: { message, details } }`
- [ ] 包含健康检查端点 `GET /health`
- [ ] 404 处理返回统一格式

### 数据层
- [ ] Prisma Client 使用单例模式
- [ ] 所有数据库操作通过 Service 层
- [ ] 查询结果按需排序 (通常按 `createdAt desc`)
- [ ] 存在性检查抛出 `AppError(404, 'Not found')`

### 输入验证
- [ ] 所有用户输入使用 Zod 验证
- [ ] 创建和更新分别定义 Schema
- [ ] ID 参数验证和类型转换
- [ ] 验证错误返回 400 状态码和详细信息

### 错误处理
- [ ] 全局错误处理中间件
- [ ] 区分 Zod 错误、AppError、Prisma 错误
- [ ] 生产环境隐藏内部错误详情
- [ ] 所有 async 控制器使用 try-catch

### 安全和配置
- [ ] 环境变量通过 Zod 验证
- [ ] 使用 helmet 中间件
- [ ] CORS 配置白名单
- [ ] 敏感信息不硬编码

---

## 前端实现检查清单

在生成前端代码时，必须逐项确认以下要求：

### 项目结构
- [ ] 使用 TypeScript
- [ ] 按照模板创建目录结构: `src/api`, `src/components`, `src/hooks`, `src/screens`, `src/navigation`, `src/styles`, `src/types`
- [ ] 包含 `package.json` 完整的依赖
- [ ] 包含 `.env.example` API 地址配置
- [ ] 配置路径别名 (`@/`, `@components/` 等)

### API 调用
- [ ] 创建统一的 API Client 类
- [ ] 配置请求/响应拦截器
- [ ] 处理统一响应格式
- [ ] 设置合理的超时时间 (10s)
- [ ] 开发环境打印请求日志

### 状态管理
- [ ] 为数据资源创建自定义 Hook
- [ ] Hook 返回: `{ data, loading, error, refresh }`
- [ ] 支持 CRUD 操作方法
- [ ] 乐观更新本地状态

### UI 组件
- [ ] 使用主题系统定义颜色、间距、字号
- [ ] 创建基础 UI 组件: Button, Input, Card, Loading
- [ ] 组件支持 loading 和 disabled 状态
- [ ] 输入组件支持 error 状态显示

### 页面要求
- [ ] 使用 SafeAreaView 处理异形屏
- [ ] 所有页面处理 Loading 状态
- [ ] 所有页面处理 Error 状态并提供重试
- [ ] 列表页支持下拉刷新 (RefreshControl)
- [ ] 空状态显示友好提示

### 导航配置
- [ ] 使用 React Navigation 6+
- [ ] 定义类型安全的 `RootStackParamList`
- [ ] 配置统一的 header 样式
- [ ] 页面标题使用中文

---

## 代码质量要求

### 命名规范
- 文件名: `camelCase.ts` 或 `PascalCase.tsx` (组件)
- 变量/函数: `camelCase`
- 类型/接口: `PascalCase`
- 常量: `UPPER_SNAKE_CASE`

### TypeScript 要求
- 避免使用 `any`，必要时使用 `unknown`
- 为所有 API 响应定义类型
- 为导航参数定义类型
- Props 使用 interface 定义

### 代码组织
- 每个文件单一职责
- 相关代码放在同一目录
- 公共代码提取到 `utils/` 或 `lib/`
- 避免超过 200 行的文件

---

## 输出文件清单

### 后端 (`artifacts/backend/`)
```
├── package.json          # 必须
├── tsconfig.json         # 必须
├── .env.example          # 必须
├── .gitignore            # 必须
├── README.md             # 必须
├── GETTING_STARTED.md    # 必须 (快速启动指南)
├── prisma/
│   ├── schema.prisma     # 必须
│   └── seed.ts           # 必须 (开发环境种子数据)
└── src/
    ├── index.ts          # 必须
    ├── app.ts            # 必须
    ├── config/index.ts   # 必须
    ├── lib/prisma.ts     # 必须
    ├── middleware/       # 必须
    ├── routes/           # 必须
    ├── controllers/      # 必须
    ├── services/         # 必须
    ├── validators/       # 必须
    └── __tests__/        # 必须 (基础测试)
```

### 前端 (`artifacts/client/`)
```
├── package.json          # 必须
├── tsconfig.json         # 必须
├── app.json              # 必须
├── babel.config.js       # 必须
├── .env.example          # 必须
├── .gitignore            # 必须
├── README.md             # 必须
├── GETTING_STARTED.md    # 必须 (快速启动指南)
├── App.tsx               # 必须
└── src/
    ├── config/           # 必须
    ├── api/              # 必须
    ├── components/ui/    # 必须
    ├── hooks/            # 必须
    ├── navigation/       # 必须
    ├── screens/          # 必须
    ├── styles/           # 必须
    ├── types/            # 必须
    └── **/__tests__/     # 必须 (基础测试)
```

---

## 快速启动指南 (GETTING_STARTED.md)

每个项目必须包含一个开发者友好的快速启动文档，让新成员能在 10 分钟内运行项目。

### 后端快速启动模板

**`artifacts/backend/GETTING_STARTED.md`**:

```markdown
# 快速启动指南

本文档帮助开发者在本地环境快速运行后端服务。

## 前置条件

确保已安装以下工具:

- [ ] Node.js >= 18 (`node -v`)
- [ ] npm >= 9 (`npm -v`)
- [ ] Git (`git --version`)

## 5 分钟启动

### 1. 克隆项目

```bash
git clone [repository-url]
cd backend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

打开 `.env` 文件，默认配置已可用于本地开发:
- `PORT`: API 端口 (默认 3000)
- `DATABASE_URL`: SQLite 数据库路径

### 4. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库并应用迁移
npx prisma migrate dev

# (可选) 填充演示数据
npm run db:seed
```

### 5. 启动服务

```bash
npm run dev
```

**成功!** 服务运行在 http://localhost:3000

### 验证安装

```bash
# 健康检查
curl http://localhost:3000/health

# 应返回
# {"status":"ok","timestamp":"..."}
```

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (热重载) |
| `npm run build` | 构建生产版本 |
| `npm start` | 启动生产服务器 |
| `npm test` | 运行测试 |
| `npm run db:studio` | 打开 Prisma Studio |
| `npm run db:seed` | 填充种子数据 |

---

## 常见问题

### Q: 端口 3000 被占用?

```bash
# 查看占用进程
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# 或修改 .env 中的 PORT
PORT=3001
```

### Q: Prisma 迁移失败?

```bash
# 重置数据库
npx prisma migrate reset

# 或手动删除数据库文件
rm prisma/dev.db
npx prisma migrate dev
```

### Q: 依赖安装失败?

```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 下一步

- [ ] 阅读 `README.md` 了解项目架构
- [ ] 运行 `npm test` 查看测试覆盖
- [ ] 使用 `npx prisma studio` 查看数据库
```

### 前端快速启动模板

**`artifacts/client/GETTING_STARTED.md`**:

```markdown
# 快速启动指南

本文档帮助开发者在本地环境快速运行移动应用。

## 前置条件

确保已安装以下工具:

- [ ] Node.js >= 18 (`node -v`)
- [ ] npm >= 9 (`npm -v`)
- [ ] Expo CLI (`npx expo --version`)
- [ ] (iOS) Xcode + iOS Simulator
- [ ] (Android) Android Studio + Android Emulator
- [ ] (Web) 现代浏览器

## 5 分钟启动

### 1. 克隆项目

```bash
git clone [repository-url]
cd client
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

打开 `.env` 文件:
- `EXPO_PUBLIC_API_URL`: 后端 API 地址 (默认 http://localhost:3000)

**注意**: 确保后端服务已启动!

### 4. 启动应用

```bash
npm start
```

Metro Bundler 启动后，选择运行平台:
- 按 `i` - iOS 模拟器
- 按 `a` - Android 模拟器
- 按 `w` - Web 浏览器

### 5. 使用 Expo Go 在真机测试

1. 手机下载 Expo Go 应用
2. 扫描终端中显示的二维码
3. 应用会在手机上运行

**注意**: 真机测试时需修改 `EXPO_PUBLIC_API_URL` 为电脑的局域网 IP

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Metro Bundler |
| `npm run ios` | 直接启动 iOS 模拟器 |
| `npm run android` | 直接启动 Android 模拟器 |
| `npm run web` | 启动 Web 版本 |
| `npm test` | 运行测试 |
| `npm run lint` | 代码检查 |

---

## 常见问题

### Q: Metro Bundler 启动失败?

```bash
# 清除缓存重启
npx expo start -c
```

### Q: iOS 模拟器无法启动?

```bash
# 检查 Xcode 命令行工具
xcode-select --install

# 重置模拟器
xcrun simctl erase all
```

### Q: Android 模拟器无法连接?

```bash
# 检查 ADB 连接
adb devices

# 重启 ADB 服务
adb kill-server
adb start-server
```

### Q: 无法连接后端 API?

1. 确认后端已启动: `curl http://localhost:3000/health`
2. 检查 `.env` 中的 `EXPO_PUBLIC_API_URL`
3. 如使用真机，改为电脑局域网 IP (如 `http://192.168.1.100:3000`)

### Q: 依赖安装失败?

```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 下一步

- [ ] 阅读 `README.md` 了解项目架构
- [ ] 运行 `npm test` 查看测试覆盖
- [ ] 修改 `src/styles/theme.ts` 自定义主题
```

---

## 种子数据 (Seed Data)

每个项目必须包含种子数据脚本，用于快速初始化开发环境数据。

### 种子数据要求

**必须生成**: `prisma/seed.ts`

**目的**:
- 为开发环境提供演示数据
- 让新开发者快速了解数据结构
- 支持 UI 开发和测试
- 便于演示时展示功能

### 种子数据模板

**`prisma/seed.ts`**:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始填充种子数据...');

  // 清理现有数据 (开发环境)
  await prisma.item.deleteMany();

  // 创建示例数据
  const items = await Promise.all([
    prisma.item.create({
      data: {
        title: '示例项目 1',
        description: '这是第一个示例项目的描述',
        amount: 100,
      },
    }),
    prisma.item.create({
      data: {
        title: '示例项目 2',
        description: '这是第二个示例项目的描述',
        amount: 250,
      },
    }),
    prisma.item.create({
      data: {
        title: '示例项目 3',
        description: '这是第三个示例项目的描述',
        amount: 500,
      },
    }),
  ]);

  console.log(`✅ 已创建 ${items.length} 条示例数据`);
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Prisma 配置

在 `package.json` 中配置种子脚本:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma migrate reset"
  },
  "devDependencies": {
    "ts-node": "^10.9.0"
  }
}
```

### 种子数据原则

**必须遵循**:
- [ ] 数据有意义，能展示应用功能
- [ ] 包含边界情况（空字符串、最大值、最小值）
- [ ] 数据量适中（5-20 条，足够演示但不过多）
- [ ] 使用中文或英文，与目标用户一致
- [ ] 不包含敏感信息（真实邮箱、电话等）

**推荐**:
- 使用 faker 库生成更真实的数据（可选）
- 为不同场景创建不同的种子配置
- 添加时间戳数据展示排序功能

### 种子数据示例（带关联）

当数据模型有关联时:

```typescript
async function main() {
  // 创建用户
  const user = await prisma.user.create({
    data: {
      name: '测试用户',
      email: 'test@example.com',
    },
  });

  // 创建关联数据
  await prisma.post.createMany({
    data: [
      { title: '第一篇文章', content: '内容...', authorId: user.id },
      { title: '第二篇文章', content: '内容...', authorId: user.id },
    ],
  });
}
```

### 种子数据检查清单

- [ ] `prisma/seed.ts` 文件存在
- [ ] `package.json` 包含 `prisma.seed` 配置
- [ ] 运行 `npm run db:seed` 无报错
- [ ] 种子数据覆盖所有核心模型
- [ ] 种子数据支持重复执行（幂等性）

---

## 日志和监控规范

即使是 MVP 阶段，也需要基本的日志和监控能力以便调试和运维。

### 日志原则

**必须遵循**:
- [ ] 使用结构化日志（JSON 格式）
- [ ] 区分日志级别（error, warn, info, debug）
- [ ] 生产环境不输出 debug 日志
- [ ] 敏感信息（密码、Token）不出现在日志中

**推荐做法**:
- 使用成熟的日志库（winston, pino）
- 日志包含请求 ID 以便追踪
- 记录关键业务操作（创建、更新、删除）

### 后端日志实现

**日志工具**: winston 或 pino

**`src/lib/logger.ts`**:

```typescript
import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// 生产环境写入文件
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
    })
  );
}
```

### 日志使用示例

**Controller 层**:

```typescript
import { logger } from '@/lib/logger';

export const itemController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Creating item', {
        body: req.body,
        ip: req.ip,
      });

      const item = await itemService.create(req.body);

      logger.info('Item created successfully', {
        itemId: item.id,
      });

      res.status(201).json({ success: true, data: item });
    } catch (error) {
      logger.error('Failed to create item', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body,
      });

      next(error);
    }
  },
};
```

### 请求日志中间件

**`src/middleware/requestLogger.ts`**:

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // 响应完成后记录
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    // 慢请求警告
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      });
    }
  });

  next();
}

// 使用
app.use(requestLogger);
```

### 日志级别规范

| 级别 | 使用场景 | 示例 |
|------|----------|------|
| **error** | 错误和异常 | 数据库连接失败、未捕获的异常 |
| **warn** | 警告和潜在问题 | 慢查询、即将达到限制 |
| **info** | 重要业务操作 | 用户注册、订单创建 |
| **debug** | 调试信息 | 函数调用、变量值（仅开发环境） |

### 监控指标

**必须监控的指标** (MVP 阶段):

1. **健康检查端点**
   ```typescript
   app.get('/health', (req, res) => {
     res.status(200).json({
       status: 'ok',
       timestamp: new Date().toISOString(),
       uptime: process.uptime(),
     });
   });
   ```

2. **API 响应时间** (通过日志)
   - 记录每个请求的耗时
   - 慢请求警告 (> 1s)

3. **错误率** (通过日志统计)
   - 记录所有错误和异常
   - 按端点统计错误次数

### 前端监控

**基础监控**:

```typescript
// src/lib/monitoring.ts
export function logError(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('Error:', error, context);
  } else {
    // 生产环境上报到监控服务
    // 如 Sentry, LogRocket 等
  }
}

export function logPerformance(metric: string, value: number) {
  if (__DEV__) {
    console.log(`Performance [${metric}]: ${value}ms`);
  } else {
    // 生产环境上报性能数据
  }
}
```

**API 请求监控**:

```typescript
// src/api/client.ts
import axios from 'axios';
import { logError, logPerformance } from '@/lib/monitoring';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// 请求拦截器 - 记录开始时间
apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// 响应拦截器 - 记录耗时和错误
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    logPerformance(`API ${response.config.url}`, duration);

    if (duration > 3000) {
      console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
    }

    return response;
  },
  (error) => {
    logError(error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);
```

### 关键操作日志

**必须记录的操作**:

```typescript
// 数据创建
logger.info('Resource created', { resourceType: 'item', id: item.id });

// 数据更新
logger.info('Resource updated', { resourceType: 'item', id: item.id, changes: updatedFields });

// 数据删除
logger.info('Resource deleted', { resourceType: 'item', id: item.id });

// 认证操作 (如适用)
logger.info('User logged in', { userId: user.id });
logger.info('User logged out', { userId: user.id });

// 错误和异常
logger.error('Operation failed', { operation: 'createItem', error: error.message });
```

### 日志和监控检查清单

#### 后端
- [ ] 使用结构化日志库（winston/pino）
- [ ] 配置日志级别（开发: debug, 生产: info）
- [ ] 实现请求日志中间件
- [ ] 记录慢请求 (> 1s)
- [ ] 记录所有错误和异常
- [ ] 健康检查端点 `/health`
- [ ] 日志不包含敏感信息

#### 前端
- [ ] 实现全局错误捕获
- [ ] 记录 API 请求耗时
- [ ] 慢 API 警告 (> 3s)
- [ ] 开发环境详细日志，生产环境简化

#### 通用
- [ ] 日志采用 JSON 格式
- [ ] 日志包含时间戳
- [ ] 关键业务操作有日志记录
- [ ] 生产环境日志写入文件

### 可选扩展

对于 MVP 后期或生产环境，可考虑：

- **错误追踪服务**: Sentry (前后端错误监控)
- **性能监控**: New Relic, DataDog
- **日志聚合**: ELK Stack, Grafana Loki
- **告警机制**: 错误率超过阈值时发送通知

---

## 不要做 (NEVER)

* **NEVER** 超出技术设计文件描述的范围添加功能或模块；
* **NEVER** 硬编码敏感信息，如数据库密码或 API 密钥；
* **NEVER** 在 MVP 阶段引入认证、授权或复杂的状态管理库；
* **NEVER** 在一个提交或生成过程中做过多变更，保持产物原子化；
* **NEVER** 跳过 Loading 或 Error 状态处理；
* **NEVER** 使用内联样式，应使用 StyleSheet 或主题系统；
* **NEVER** 忽略 TypeScript 类型错误；
* **NEVER** 在组件中直接调用 API，应通过 Hook 或 Service；
* **NEVER** 使用 `console.log` 作为错误处理，应使用错误边界或统一错误处理。

---

## 安全检查清单

即使是 MVP 阶段，也必须遵循基本的安全实践，防止常见的安全漏洞。

### 后端安全要求

#### 1. 输入验证和清理

**必须**:
- [ ] 所有用户输入使用 Zod 验证
- [ ] 验证数据类型、长度和格式
- [ ] 对字符串输入进行长度限制

```typescript
// ✅ 好
const createItemSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  amount: z.number().positive().max(1000000),
});

// ❌ 避免
const createItem = (data: any) => {
  // 直接使用未验证的输入
  return prisma.item.create({ data });
};
```

#### 2. SQL 注入防护

**必须**:
- [ ] 使用 Prisma ORM (自动参数化查询)
- [ ] 禁止字符串拼接 SQL
- [ ] 禁止使用 `$queryRawUnsafe`

```typescript
// ✅ 好 - Prisma 自动参数化
const items = await prisma.item.findMany({
  where: { title: { contains: searchTerm } },
});

// ❌ 绝对禁止 - SQL 注入风险
const items = await prisma.$queryRawUnsafe(
  `SELECT * FROM items WHERE title LIKE '%${searchTerm}%'`
);
```

#### 3. XSS 防护

**必须**:
- [ ] 响应头设置 `Content-Type: application/json`
- [ ] 禁止直接渲染用户输入为 HTML
- [ ] 使用 helmet 中间件

```typescript
// ✅ 好 - 使用 helmet
import helmet from 'helmet';
app.use(helmet());

// 设置内容类型
app.use(express.json({ type: 'application/json' }));
```

#### 4. CORS 配置

**必须**:
- [ ] 明确配置允许的来源
- [ ] 生产环境禁止使用 `origin: '*'`
- [ ] 限制允许的 HTTP 方法

```typescript
// ✅ 好 - 明确的 CORS 配置
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// ❌ 避免 - 过于宽松
app.use(cors()); // 允许所有来源
```

#### 5. Rate Limiting

**推荐** (MVP 阶段可简化):
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 个请求
  message: { success: false, error: { message: 'Too many requests' } },
});

app.use('/api/', limiter);
```

#### 6. 敏感信息保护

**必须**:
- [ ] 环境变量存储敏感配置
- [ ] `.env` 文件不提交到 Git
- [ ] 提供 `.env.example` 模板
- [ ] 生产环境隐藏错误详情

```typescript
// ✅ 好 - 使用环境变量
const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET, // (未来使用)
};

// 验证必要的环境变量
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.string().optional(),
});

envSchema.parse(process.env);
```

**.gitignore 必须包含**:
```
.env
.env.local
.env.production
*.pem
*.key
```

### 前端安全要求

#### 1. 敏感数据存储

**必须**:
- [ ] 不在 AsyncStorage 存储敏感数据 (如密码、token)
- [ ] 使用 expo-secure-store 存储敏感信息
- [ ] 不在代码中硬编码密钥

```typescript
// ✅ 好 - 使用安全存储 (如需认证)
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('token', authToken);

// ❌ 避免 - 不安全的存储
await AsyncStorage.setItem('token', authToken);
```

#### 2. API 通信

**必须**:
- [ ] 仅通过 HTTPS 通信 (生产环境)
- [ ] 不在 URL 中传递敏感参数
- [ ] 设置请求超时

```typescript
// ✅ 好
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 3. 输入验证

**必须**:
- [ ] 客户端输入验证 (作为用户体验)
- [ ] 不依赖客户端验证作为安全措施 (服务端必须再次验证)

### 安全检查清单摘要

生成代码前确认:

**后端**:
- [ ] 使用 Zod 验证所有输入
- [ ] 使用 Prisma (防止 SQL 注入)
- [ ] 使用 helmet 中间件
- [ ] 配置 CORS 白名单
- [ ] 敏感信息使用环境变量
- [ ] .env 在 .gitignore 中
- [ ] 生产环境隐藏错误详情

**前端**:
- [ ] API URL 使用环境变量
- [ ] 不硬编码敏感信息
- [ ] 设置请求超时

---

## 加载触发设计

**MANDATORY - READ ENTIRE FILES**：在生成后端和前端代码之前，你必须完整阅读位于 `references/backend-template.md` 和 `references/frontend-template.md` 的模板文件。这些参考文档展示了基本项目结构和示例代码，可帮助你快速搭建骨架并理解如何组织目录。阅读完毕后，根据你的数据模型 (`schema.prisma`) 和 UI Schema 调整目录和文件内容，再开始生成实际代码。切勿跳过这一步，否则可能导致项目结构混乱或缺少关键文件。

---

## 执行流程

1. **阅读模板文件** - 完整阅读 `references/backend-template.md` 和 `references/frontend-template.md`
2. **分析输入** - 理解 `schema.prisma` 数据模型和 UI Schema 页面结构
3. **生成后端** - 按检查清单逐项实现
4. **生成前端** - 按检查清单逐项实现
5. **自检验证** - 对照检查清单确认所有项目完成
6. **输出产物** - 确保所有必须文件存在于正确路径
