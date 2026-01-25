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
├── prisma/
│   ├── schema.prisma     # 必须
│   └── seed.ts           # 推荐
└── src/
    ├── index.ts          # 必须
    ├── app.ts            # 必须
    ├── config/index.ts   # 必须
    ├── lib/prisma.ts     # 必须
    ├── middleware/       # 必须
    ├── routes/           # 必须
    ├── controllers/      # 必须
    ├── services/         # 必须
    └── validators/       # 必须
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
├── App.tsx               # 必须
└── src/
    ├── config/           # 必须
    ├── api/              # 必须
    ├── components/ui/    # 必须
    ├── hooks/            # 必须
    ├── navigation/       # 必须
    ├── screens/          # 必须
    ├── styles/           # 必须
    └── types/            # 必须
```

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
