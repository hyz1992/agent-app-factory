# 错误码规范

本文档定义了 AI App Factory 生成的应用中使用的统一错误码系统，确保前后端错误处理的一致性和可维护性。

## 错误码结构

### 格式定义

```
[业务模块]_[错误类型]_[具体错误]

示例: AUTH_VALIDATION_INVALID_EMAIL
```

### 命名规范

- **全大写**: 使用 SCREAMING_SNAKE_CASE
- **业务模块**: 2-4 个字符，表示功能模块（如 AUTH, USER, ITEM）
- **错误类型**: 通用错误类型（如 VALIDATION, NOT_FOUND, FORBIDDEN）
- **具体错误**: 详细描述（可选）

---

## 标准错误类型

### 1. 验证错误 (VALIDATION)

**HTTP 状态码**: 400

| 错误码 | 说明 | 示例场景 |
|--------|------|----------|
| `[MODULE]_VALIDATION_REQUIRED` | 缺少必填字段 | 创建时未提供 title |
| `[MODULE]_VALIDATION_INVALID_FORMAT` | 格式不正确 | email 格式错误 |
| `[MODULE]_VALIDATION_OUT_OF_RANGE` | 超出范围 | amount < 0 或 > 10000 |
| `[MODULE]_VALIDATION_DUPLICATE` | 重复值 | email 已存在 |

**示例**:
```typescript
AUTH_VALIDATION_REQUIRED       // 缺少必填字段
AUTH_VALIDATION_INVALID_EMAIL  // 邮箱格式错误
ITEM_VALIDATION_OUT_OF_RANGE   // 金额超出范围
```

### 2. 未找到错误 (NOT_FOUND)

**HTTP 状态码**: 404

| 错误码 | 说明 | 示例场景 |
|--------|------|----------|
| `[MODULE]_NOT_FOUND` | 资源不存在 | 查询的 ID 不存在 |
| `[MODULE]_ROUTE_NOT_FOUND` | 路由不存在 | 访问未定义的端点 |

**示例**:
```typescript
ITEM_NOT_FOUND   // Item ID 不存在
USER_NOT_FOUND   // User ID 不存在
```

### 3. 权限错误 (FORBIDDEN / UNAUTHORIZED)

**HTTP 状态码**: 401 (未认证), 403 (无权限)

| 错误码 | 说明 | 示例场景 |
|--------|------|----------|
| `AUTH_UNAUTHORIZED` | 未登录或 Token 无效 | JWT 过期 |
| `[MODULE]_FORBIDDEN` | 无权访问 | 尝试访问他人数据 |

**示例**:
```typescript
AUTH_UNAUTHORIZED     // Token 过期或缺失
ITEM_FORBIDDEN        // 尝试删除他人的 Item
```

### 4. 冲突错误 (CONFLICT)

**HTTP 状态码**: 409

| 错误码 | 说明 | 示例场景 |
|--------|------|----------|
| `[MODULE]_CONFLICT_DUPLICATE` | 资源冲突 | 创建已存在的资源 |
| `[MODULE]_CONFLICT_STATE` | 状态冲突 | 操作不符合当前状态 |

**示例**:
```typescript
USER_CONFLICT_DUPLICATE   // Email 已注册
ITEM_CONFLICT_STATE       // 已完成的项目不能删除
```

### 5. 服务器错误 (INTERNAL_ERROR)

**HTTP 状态码**: 500

| 错误码 | 说明 | 示例场景 |
|--------|------|----------|
| `INTERNAL_ERROR` | 未知内部错误 | 数据库连接失败 |
| `DATABASE_ERROR` | 数据库错误 | Prisma 查询失败 |
| `EXTERNAL_SERVICE_ERROR` | 外部服务错误 | 第三方 API 失败 |

**示例**:
```typescript
INTERNAL_ERROR             // 通用服务器错误
DATABASE_ERROR             // 数据库操作失败
EXTERNAL_SERVICE_ERROR     // 第三方 API 调用失败
```

### 6. 限流错误 (RATE_LIMIT)

**HTTP 状态码**: 429

| 错误码 | 说明 | 示例场景 |
|--------|------|----------|
| `RATE_LIMIT_EXCEEDED` | 超过请求频率限制 | 1 分钟内请求超过 100 次 |

---

## 错误响应格式

### 标准响应结构

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // 错误码
    message: string;        // 用户友好的错误消息
    details?: unknown;      // 详细信息（可选，仅开发环境）
    timestamp?: string;     // 时间戳（可选）
    path?: string;          // 请求路径（可选）
  };
}
```

### 响应示例

**验证错误**:
```json
{
  "success": false,
  "error": {
    "code": "ITEM_VALIDATION_REQUIRED",
    "message": "缺少必填字段: title",
    "details": {
      "field": "title",
      "constraint": "required"
    }
  }
}
```

**未找到错误**:
```json
{
  "success": false,
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "未找到 ID 为 123 的项目"
  }
}
```

**服务器错误**:
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "数据库操作失败，请稍后重试"
  }
}
```

---

## 实现示例

### 错误类定义

**`src/lib/errors.ts`**:

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 验证错误
export class ValidationError extends AppError {
  constructor(code: string, message: string, details?: unknown) {
    super(400, code, message, details);
  }
}

// 未找到错误
export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(404, code, message);
  }
}

// 权限错误
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(401, 'AUTH_UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: string, message: string) {
    super(403, code, message);
  }
}

// 冲突错误
export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(409, code, message);
  }
}

// 服务器错误
export class InternalError extends AppError {
  constructor(message: string = '服务器内部错误') {
    super(500, 'INTERNAL_ERROR', message);
  }
}
```

### 错误码常量

**`src/constants/error-codes.ts`**:

```typescript
// 项目模块错误码
export const ITEM_ERRORS = {
  NOT_FOUND: 'ITEM_NOT_FOUND',
  VALIDATION_REQUIRED: 'ITEM_VALIDATION_REQUIRED',
  VALIDATION_INVALID_AMOUNT: 'ITEM_VALIDATION_INVALID_AMOUNT',
  FORBIDDEN: 'ITEM_FORBIDDEN',
} as const;

// 用户模块错误码
export const USER_ERRORS = {
  NOT_FOUND: 'USER_NOT_FOUND',
  CONFLICT_DUPLICATE: 'USER_CONFLICT_DUPLICATE',
  VALIDATION_INVALID_EMAIL: 'USER_VALIDATION_INVALID_EMAIL',
} as const;

// 认证错误码
export const AUTH_ERRORS = {
  UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  VALIDATION_INVALID_EMAIL: 'AUTH_VALIDATION_INVALID_EMAIL',
  VALIDATION_REQUIRED: 'AUTH_VALIDATION_REQUIRED',
} as const;
```

### 使用示例

**Service 层**:

```typescript
import { NotFoundError, ValidationError } from '@/lib/errors';
import { ITEM_ERRORS } from '@/constants/error-codes';

export const itemService = {
  async findById(id: number) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundError(
        ITEM_ERRORS.NOT_FOUND,
        `未找到 ID 为 ${id} 的项目`
      );
    }

    return item;
  },

  async create(data: CreateItemDto) {
    if (!data.title) {
      throw new ValidationError(
        ITEM_ERRORS.VALIDATION_REQUIRED,
        '缺少必填字段: title',
        { field: 'title' }
      );
    }

    if (data.amount < 0) {
      throw new ValidationError(
        ITEM_ERRORS.VALIDATION_INVALID_AMOUNT,
        '金额不能为负数',
        { field: 'amount', value: data.amount }
      );
    }

    return prisma.item.create({ data });
  },
};
```

### 全局错误处理中间件

**`src/middleware/errorHandler.ts`**:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/lib/errors';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // AppError (已知错误)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
        path: req.path,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Prisma 错误
  if (error.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: '数据库操作失败',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }

  // 未知错误
  console.error('Unexpected error:', error);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : error.message,
    },
  });
}
```

---

## 前端错误处理

### 错误码映射

**`client/src/constants/error-messages.ts`**:

```typescript
export const ERROR_MESSAGES: Record<string, string> = {
  // 项目错误
  ITEM_NOT_FOUND: '项目不存在',
  ITEM_VALIDATION_REQUIRED: '请填写必填字段',
  ITEM_VALIDATION_INVALID_AMOUNT: '金额必须大于 0',

  // 用户错误
  USER_NOT_FOUND: '用户不存在',
  USER_CONFLICT_DUPLICATE: '该邮箱已注册',
  USER_VALIDATION_INVALID_EMAIL: '邮箱格式不正确',

  // 认证错误
  AUTH_UNAUTHORIZED: '请先登录',

  // 通用错误
  INTERNAL_ERROR: '服务器错误，请稍后重试',
  RATE_LIMIT_EXCEEDED: '请求过于频繁，请稍后重试',

  // 默认错误
  DEFAULT: '操作失败，请稍后重试',
};

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.DEFAULT;
}
```

### API 客户端

**`client/src/api/client.ts`**:

```typescript
import axios, { AxiosError } from 'axios';
import { getErrorMessage } from '@/constants/error-messages';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    const errorCode = error.response?.data?.error?.code || 'DEFAULT';
    const errorMessage = getErrorMessage(errorCode);

    // 返回标准化的错误
    return Promise.reject({
      code: errorCode,
      message: errorMessage,
      originalError: error,
    });
  }
);
```

---

## 错误码最佳实践

### 必须遵循

- [ ] 所有 API 错误必须使用标准错误码
- [ ] 错误码必须语义化，见名知意
- [ ] 错误消息对用户友好，避免技术术语
- [ ] 生产环境不暴露敏感的 details 信息
- [ ] 日志记录完整的错误堆栈

### 推荐做法

- [ ] 为每个模块维护独立的错误码常量
- [ ] 前后端共享错误码定义（通过类型文件）
- [ ] 使用 i18n 支持多语言错误消息
- [ ] 记录错误码使用文档

### 避免事项

- ❌ 使用魔法字符串代替错误码常量
- ❌ 错误消息包含堆栈信息（生产环境）
- ❌ 不同错误使用相同错误码
- ❌ 错误码命名不一致

---

## 错误码检查清单

在完成代码生成时，确认:

- [ ] `src/lib/errors.ts` 包含错误类定义
- [ ] `src/constants/error-codes.ts` 包含错误码常量
- [ ] `src/middleware/errorHandler.ts` 实现全局错误处理
- [ ] Service 层使用错误码抛出错误
- [ ] 前端有错误码映射和友好提示
- [ ] README 中说明错误码使用方式

---

遵循此规范可以确保应用的错误处理统一、可维护，并提供良好的开发和用户体验。
