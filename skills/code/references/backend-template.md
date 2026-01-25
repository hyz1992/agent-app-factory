# 后端骨架模板

本模板提供使用 TypeScript、Express 和 Prisma 的生产就绪后端项目结构。请完整阅读后根据你的数据模型进行调整。

## 目录结构

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── index.ts              # 应用入口
    ├── app.ts                # Express 应用配置
    ├── config/
    │   └── index.ts          # 环境变量配置
    ├── lib/
    │   └── prisma.ts         # Prisma 客户端单例
    ├── middleware/
    │   ├── errorHandler.ts   # 全局错误处理
    │   └── logger.ts         # 请求日志
    ├── routes/
    │   ├── index.ts          # 路由聚合
    │   └── [resource].ts     # 资源路由
    ├── controllers/
    │   └── [resource].ts     # 控制器
    ├── services/
    │   └── [resource].ts     # 业务逻辑层
    ├── validators/
    │   └── [resource].ts     # 请求验证
    └── types/
        └── index.ts          # 类型定义
```

## package.json

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "helmet": "^7.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.15",
    "@types/express": "^4.17.20",
    "@types/node": "^20.9.0",
    "eslint": "^8.54.0",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "prisma": "^5.0.0",
    "tsx": "^4.1.0",
    "typescript": "^5.3.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## .env.example

```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DATABASE_URL="file:./dev.db"

# CORS 配置 (逗号分隔多个域名)
CORS_ORIGINS=http://localhost:8081,http://localhost:19006
```

## .gitignore

```
node_modules/
dist/
.env
*.db
*.db-journal
```

## src/config/index.ts

```typescript
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  CORS_ORIGINS: z.string().default('http://localhost:8081'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map(s => s.trim()),
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
};
```

## src/lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

## src/middleware/errorHandler.ts

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// 自定义应用错误
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 统一响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  const response: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500, details?: unknown): void {
  const response: ApiResponse = {
    success: false,
    error: { message, details },
  };
  res.status(statusCode).json(response);
}

// 全局错误处理中间件
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  // Zod 验证错误
  if (err instanceof ZodError) {
    sendError(res, 'Validation failed', 400, err.errors);
    return;
  }

  // 自定义应用错误
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma 错误
  if (err.name === 'PrismaClientKnownRequestError') {
    sendError(res, 'Database operation failed', 400);
    return;
  }

  // 未知错误
  sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
}
```

## src/middleware/logger.ts

```typescript
import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}
```

## src/app.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import routes from './routes';

const app = express();

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// 请求解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志
app.use(requestLogger);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api', routes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Cannot ${req.method} ${req.path}` },
  });
});

// 全局错误处理
app.use(errorHandler);

export default app;
```

## src/index.ts

```typescript
import app from './app';
import { config } from './config';
import { prisma } from './lib/prisma';

async function main() {
  try {
    // 测试数据库连接
    await prisma.$connect();
    console.log('Database connected');

    // 启动服务器
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

main();
```

## src/routes/index.ts (路由聚合示例)

```typescript
import { Router } from 'express';
import itemsRouter from './items';

const router = Router();

// 注册所有资源路由
router.use('/items', itemsRouter);

export default router;
```

## src/validators/items.ts (验证器示例)

```typescript
import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  amount: z.number().positive('Amount must be positive'),
});

export const updateItemSchema = createItemSchema.partial();

export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID').transform(Number),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
```

## src/services/items.ts (服务层示例)

```typescript
import { prisma } from '../lib/prisma';
import { CreateItemInput, UpdateItemInput } from '../validators/items';
import { AppError } from '../middleware/errorHandler';

export const itemsService = {
  async findAll() {
    return prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number) {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      throw new AppError(404, 'Item not found');
    }
    return item;
  },

  async create(data: CreateItemInput) {
    return prisma.item.create({ data });
  },

  async update(id: number, data: UpdateItemInput) {
    await this.findById(id); // 确保存在
    return prisma.item.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    await this.findById(id); // 确保存在
    return prisma.item.delete({ where: { id } });
  },
};
```

## src/controllers/items.ts (控制器示例)

```typescript
import { Request, Response, NextFunction } from 'express';
import { itemsService } from '../services/items';
import { createItemSchema, updateItemSchema, idParamSchema } from '../validators/items';
import { sendSuccess } from '../middleware/errorHandler';

export const itemsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await itemsService.findAll();
      sendSuccess(res, items);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const item = await itemsService.findById(id);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createItemSchema.parse(req.body);
      const item = await itemsService.create(data);
      sendSuccess(res, item, 201);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      const data = updateItemSchema.parse(req.body);
      const item = await itemsService.update(id, data);
      sendSuccess(res, item);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = idParamSchema.parse(req.params);
      await itemsService.delete(id);
      sendSuccess(res, { deleted: true });
    } catch (error) {
      next(error);
    }
  },
};
```

## src/routes/items.ts (路由示例)

```typescript
import { Router } from 'express';
import { itemsController } from '../controllers/items';

const router = Router();

router.get('/', itemsController.getAll);
router.get('/:id', itemsController.getById);
router.post('/', itemsController.create);
router.put('/:id', itemsController.update);
router.delete('/:id', itemsController.delete);

export default router;
```

## prisma/schema.prisma (示例)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Item {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  amount      Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## prisma/seed.ts (种子数据示例)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 清空现有数据 (开发环境)
  await prisma.item.deleteMany();

  // 创建示例数据
  const items = await prisma.item.createMany({
    data: [
      { title: 'Example Item 1', description: 'First example', amount: 100 },
      { title: 'Example Item 2', description: 'Second example', amount: 200 },
      { title: 'Example Item 3', amount: 50 },
    ],
  });

  console.log(`Created ${items.count} items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## README.md (后端)

```markdown
# Backend

基于 Express + Prisma + TypeScript 的后端服务。

## 快速开始

1. 安装依赖
   ```bash
   npm install
   ```

2. 配置环境变量
   ```bash
   cp .env.example .env
   ```

3. 初始化数据库
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. 启动开发服务器
   ```bash
   npm run dev
   ```

服务将运行在 http://localhost:3000

## 可用脚本

- `npm run dev` - 开发模式 (热重载)
- `npm run build` - 编译 TypeScript
- `npm start` - 生产模式运行
- `npm run db:studio` - Prisma 数据库管理界面
- `npm run lint` - 代码检查

## API 端点

- `GET /health` - 健康检查
- `GET /api/items` - 获取所有项目
- `GET /api/items/:id` - 获取单个项目
- `POST /api/items` - 创建项目
- `PUT /api/items/:id` - 更新项目
- `DELETE /api/items/:id` - 删除项目

## 响应格式

所有 API 返回统一格式：

```json
{
  "success": true,
  "data": { ... }
}
```

错误响应：

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [...]
  }
}
```
```

---

## 使用指南

1. **根据你的数据模型修改 `prisma/schema.prisma`**
2. **为每个数据模型创建对应的**:
   - `validators/[model].ts` - 输入验证
   - `services/[model].ts` - 业务逻辑
   - `controllers/[model].ts` - 请求处理
   - `routes/[model].ts` - 路由定义
3. **在 `routes/index.ts` 中注册新路由**
4. **运行 `npm run db:push` 同步数据库**
5. **根据需要修改 `prisma/seed.ts` 添加测试数据**

## 关键约束

- **所有数据库操作必须通过 Service 层**
- **所有输入必须通过 Zod 验证**
- **所有控制器必须使用 try-catch 并调用 next(error)**
- **使用 `sendSuccess()` 和 `sendError()` 保持响应格式一致**
- **敏感配置必须使用环境变量**
