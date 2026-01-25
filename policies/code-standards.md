# 代码规范文档

本文档定义了 AI App Factory 生成代码应遵循的编码规范和最佳实践。所有 Agent 在生成代码时必须遵守这些规范。

## 一、通用规范

### 1.1 语言和格式

| 项目 | 规范 |
|------|------|
| 语言 | TypeScript (严格模式) |
| 缩进 | 2 空格 |
| 行尾 | LF (Unix) |
| 编码 | UTF-8 |
| 最大行长 | 100 字符 (代码), 80 字符 (注释) |
| 分号 | 必须使用 |
| 引号 | 单引号 (字符串), 双引号 (JSX 属性) |

### 1.2 命名规范

| 类型 | 风格 | 示例 |
|------|------|------|
| 文件名 (普通) | camelCase.ts | `userService.ts`, `apiClient.ts` |
| 文件名 (组件) | PascalCase.tsx | `Button.tsx`, `HomeScreen.tsx` |
| 文件名 (测试) | *.test.ts/tsx | `user.test.ts`, `Button.test.tsx` |
| 变量 | camelCase | `userName`, `isLoading` |
| 函数 | camelCase | `getUserById`, `formatDate` |
| 类/接口/类型 | PascalCase | `User`, `ApiResponse`, `CreateItemDto` |
| 常量 | UPPER_SNAKE_CASE | `API_URL`, `MAX_RETRY_COUNT` |
| 私有属性 | 不使用下划线前缀 | 使用 TypeScript private 关键字 |
| 布尔变量 | is/has/can 前缀 | `isActive`, `hasPermission`, `canEdit` |
| 事件处理器 | handle 前缀 | `handleClick`, `handleSubmit` |
| Hook | use 前缀 | `useItems`, `useAuth` |

### 1.3 文件组织

**每个文件单一职责**:
- 一个组件一个文件
- 一个服务一个文件
- 相关的类型可以放在同一个 types.ts 文件

**导入顺序**:
```typescript
// 1. Node.js 内置模块
import path from 'path';

// 2. 外部依赖
import express from 'express';
import { z } from 'zod';

// 3. 内部模块 (绝对路径)
import { prisma } from '@/lib/prisma';
import { config } from '@/config';

// 4. 相对路径导入
import { UserService } from './userService';
import type { User } from './types';
```

---

## 二、TypeScript 规范

### 2.1 类型定义

**优先使用 interface 定义对象类型**:
```typescript
// ✅ 好
interface User {
  id: number;
  name: string;
  email: string;
}

// ❌ 避免 (除非需要联合类型或映射类型)
type User = {
  id: number;
  name: string;
  email: string;
};
```

**为所有公共 API 定义类型**:
```typescript
// ✅ 好
interface CreateUserDto {
  name: string;
  email: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

function createUser(data: CreateUserDto): Promise<ApiResponse<User>> {
  // ...
}

// ❌ 避免
function createUser(data: any): Promise<any> {
  // ...
}
```

### 2.2 类型断言

**避免使用 `any`**:
```typescript
// ✅ 好
function parseJson(text: string): unknown {
  return JSON.parse(text);
}

const data = parseJson(text);
if (isUser(data)) {
  // data 被推断为 User
}

// ❌ 避免
const data: any = JSON.parse(text);
```

**使用类型守卫**:
```typescript
// ✅ 好
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

// ❌ 避免
const user = data as User; // 不安全的断言
```

### 2.3 泛型

**为泛型参数使用有意义的名称**:
```typescript
// ✅ 好
interface Repository<TEntity> {
  findById(id: number): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TEntity>;
}

// ❌ 避免
interface Repository<T> {
  findById(id: number): Promise<T | null>;
  save(entity: T): Promise<T>;
}
```

---

## 三、后端规范

### 3.1 Express 路由

**使用 Router 组织路由**:
```typescript
// ✅ 好
// src/routes/items.ts
import { Router } from 'express';
import { itemController } from '@/controllers/item';
import { validateRequest } from '@/middleware/validation';
import { createItemSchema, updateItemSchema } from '@/validators/item';

const router = Router();

router.get('/', itemController.list);
router.get('/:id', itemController.getById);
router.post('/', validateRequest(createItemSchema), itemController.create);
router.put('/:id', validateRequest(updateItemSchema), itemController.update);
router.delete('/:id', itemController.remove);

export default router;
```

**RESTful 命名**:
```typescript
// ✅ 好
GET    /api/items         // 列表
GET    /api/items/:id     // 详情
POST   /api/items         // 创建
PUT    /api/items/:id     // 更新
DELETE /api/items/:id     // 删除

// ❌ 避免
GET    /api/getItems
POST   /api/createItem
POST   /api/items/delete/:id
```

### 3.2 控制器

**保持控制器简洁**:
```typescript
// ✅ 好
export const itemController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await itemService.findAll();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await itemService.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },
};
```

### 3.3 服务层

**业务逻辑放在服务层**:
```typescript
// ✅ 好
// src/services/item.ts
export const itemService = {
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

  async create(data: CreateItemDto) {
    return prisma.item.create({ data });
  },
};
```

### 3.4 错误处理

**使用统一的错误类**:
```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 使用
throw new AppError(404, 'Item not found');
throw new AppError(400, 'Validation failed', errors);
```

**全局错误处理中间件**:
```typescript
// src/middleware/errorHandler.ts
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        details: error.details,
      },
    });
  }

  // 生产环境隐藏内部错误
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message;

  res.status(500).json({
    success: false,
    error: { message },
  });
}
```

---

## 四、前端规范

### 4.1 组件结构

**函数组件格式**:
```tsx
// ✅ 好
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  children,
  onPress,
  loading = false,
  disabled = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      style={styles.container}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={styles.text}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // ...
  },
  text: {
    // ...
  },
});
```

### 4.2 Hook 规范

**自定义 Hook 返回对象**:
```typescript
// ✅ 好
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    // ...
  };

  const create = async (data: CreateItemDto) => {
    // ...
  };

  return {
    items,
    loading,
    error,
    refresh,
    create,
  };
}
```

### 4.3 样式规范

**使用 StyleSheet**:
```typescript
// ✅ 好
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// ❌ 避免内联样式
<View style={{ flex: 1, padding: 16 }}>
```

**使用主题系统**:
```typescript
// src/styles/theme.ts
export const theme = {
  colors: {
    primary: '#2563eb',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    background: '#ffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
  },
};
```

### 4.4 导航

**类型安全的导航参数**:
```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  Detail: { id: number };
  Create: undefined;
};

// 使用
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
navigation.navigate('Detail', { id: 1 });
```

---

## 五、Prisma 规范

### 5.1 Schema 定义

**模型命名使用 PascalCase 单数**:
```prisma
// ✅ 好
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
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 5.2 查询规范

**使用 select 限制返回字段**:
```typescript
// ✅ 好 (只返回需要的字段)
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// ❌ 避免 (返回所有字段包括敏感信息)
const users = await prisma.user.findMany();
```

---

## 六、注释规范

### 6.1 何时添加注释

**需要注释的场景**:
- 复杂的业务逻辑
- 非显而易见的设计决策
- 性能优化的原因
- API 的公共接口

**不需要注释的场景**:
- 自解释的代码
- 简单的 getter/setter
- 明显的实现

### 6.2 注释格式

```typescript
// ✅ 好 - 解释为什么
// 使用乐观更新提升用户体验，失败时回滚
const optimisticUpdate = async (id: number, data: UpdateDto) => {
  const previousData = items;
  setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));

  try {
    await api.update(id, data);
  } catch {
    setItems(previousData); // 回滚
    throw new Error('Update failed');
  }
};

// ❌ 避免 - 解释是什么 (代码已经说明)
// 设置 items
setItems(newItems);
```

---

## 七、ESLint 配置

生成的项目应包含以下 ESLint 配置:

**后端 `.eslintrc.json`**:
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**前端 `.eslintrc.json`**:
```json
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

---

## 八、禁止事项

以下实践在生成的代码中**绝对禁止**:

1. **使用 `any` 类型** - 使用 `unknown` 并添加类型守卫
2. **硬编码敏感信息** - 使用环境变量
3. **忽略错误处理** - 所有 async 操作需要 try-catch
4. **使用 `console.log` 调试** - 使用结构化日志
5. **内联样式** - 使用 StyleSheet
6. **跳过类型定义** - 所有公共接口需要类型
7. **使用 `var`** - 使用 `const` 或 `let`
8. **使用 `==`** - 使用 `===`
9. **修改函数参数** - 创建新对象/数组
10. **嵌套超过 3 层的 if** - 提前返回或拆分函数

---

遵循这些规范可以确保生成的代码质量一致、可维护、易于理解。
