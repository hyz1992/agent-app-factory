---
name: 演示与部署指南
description: "为生成的应用准备运行说明、部署配置和演示指南。包括本地运行、Docker 部署、云平台部署和演示流程。当需要向团队或用户展示MVP并指导如何运行和部署时触发。"
---

## 思维框架

* **本地优先**: 确保任何具有基本开发环境的人按照说明即可在本地启动并体验应用
* **部署就绪**: 提供生产环境部署所需的所有配置文件，降低上线门槛
* **用户故事**: 设计简短的演示流程，帮助演示者展示应用的核心价值
* **透明风险**: 主动列出当前版本存在的限制或已知问题，避免演示中出现意外

---

## 输出文件要求

Preview Agent 必须生成以下文件：

### 必须文件

1. **`artifacts/preview/README.md`** - 主运行说明文档
2. **`artifacts/backend/Dockerfile`** - 后端 Docker 配置
3. **`artifacts/backend/docker-compose.yml`** - 开发环境 Docker Compose
4. **`artifacts/backend/.env.production.example`** - 生产环境变量模板
5. **`artifacts/client/eas.json`** - Expo EAS 构建配置 (React Native)

### 推荐文件

6. **`artifacts/preview/DEPLOYMENT.md`** - 详细部署指南
7. **`docker-compose.production.yml`** - 生产环境 Docker Compose

---

## 本地运行文档结构

`artifacts/preview/README.md` 必须包含以下章节：

```markdown
# [项目名称]

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9
- [其他依赖]

### 后端启动

```bash
# 进入后端目录
cd artifacts/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入必要配置

# 初始化数据库
npx prisma migrate dev

# (可选) 填充种子数据
npm run db:seed

# 启动开发服务器
npm run dev
```

后端运行在: http://localhost:3000
健康检查: http://localhost:3000/health
API 文档: http://localhost:3000/api-docs (如有)

### 前端启动

```bash
# 进入前端目录
cd artifacts/client

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 API_URL 指向后端地址

# 启动开发服务器
npm start
```

- iOS 模拟器: 按 `i`
- Android 模拟器: 按 `a`
- Web 浏览器: 按 `w`

### 验证安装

运行以下命令验证安装是否成功：

```bash
# 后端测试
cd artifacts/backend && npm test

# 前端测试
cd artifacts/client && npm test

# API 健康检查
curl http://localhost:3000/health
```

---

## 演示流程

### 准备工作
1. 确保后端和前端都已启动
2. 清空或重置演示数据 (可选)

### 演示步骤

1. **场景介绍** (30秒)
   - 介绍目标用户和核心问题

2. **功能演示** (3-5分钟)
   - 步骤 1: [具体操作]
   - 步骤 2: [具体操作]
   - 步骤 3: [具体操作]

3. **技术亮点** (可选, 1分钟)
   - [技术特点说明]

### 演示注意事项
- [注意事项 1]
- [注意事项 2]

---

## 已知问题与限制

### 功能限制
- [ ] [限制 1]
- [ ] [限制 2]

### 技术债务
- [ ] [技术债务 1]
- [ ] [技术债务 2]

### 演示时需避免的操作
- [操作 1] - 可能导致 [问题]
- [操作 2] - 可能导致 [问题]

---

## 常见问题

### Q: [问题 1]?
A: [解答]

### Q: [问题 2]?
A: [解答]

### Q: 端口被占用怎么办?
A: 修改 `.env` 中的 `PORT` 变量，或先终止占用端口的进程。

### Q: 数据库连接失败怎么办?
A: 检查 `.env` 中的 `DATABASE_URL` 配置是否正确。
```

---

## 部署配置生成

### Docker 配置

**`artifacts/backend/Dockerfile`**:

```dockerfile
# 基础镜像
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci --only=production

# 生成 Prisma Client
RUN npx prisma generate

# 复制源码
COPY . .

# 构建
RUN npm run build

# 生产镜像
FROM node:20-alpine AS production

WORKDIR /app

# 安装生产依赖
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["npm", "start"]
```

**`artifacts/backend/docker-compose.yml`** (开发环境):

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=file:./dev.db
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

**`artifacts/backend/.env.production.example`**:

```bash
# 应用配置
NODE_ENV=production
PORT=3000

# 数据库配置 (PostgreSQL 生产环境)
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# CORS 配置
CORS_ORIGINS=https://your-frontend-domain.com

# 日志级别
LOG_LEVEL=info

# (如有) 其他敏感配置
# API_KEY=your-api-key
```

### Expo EAS 配置

**`artifacts/client/eas.json`**:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.your-domain.com"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.your-domain.com"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 部署指南结构

**`artifacts/preview/DEPLOYMENT.md`**:

```markdown
# 部署指南

## 部署选项

### 选项 1: Docker 部署 (推荐)

#### 前置条件
- 安装 Docker 和 Docker Compose
- 配置域名和 SSL 证书

#### 部署步骤

1. 克隆代码到服务器
2. 配置生产环境变量
3. 构建和启动容器

```bash
# 配置环境变量
cp .env.production.example .env.production
# 编辑 .env.production 填入正式配置

# 构建镜像
docker-compose -f docker-compose.production.yml build

# 启动服务
docker-compose -f docker-compose.production.yml up -d

# 运行数据库迁移
docker-compose exec api npx prisma migrate deploy
```

### 选项 2: Railway 部署

1. 连接 GitHub 仓库
2. 设置环境变量
3. 部署

详细步骤参见: https://docs.railway.app/

### 选项 3: Render 部署

1. 创建 Web Service
2. 连接 GitHub 仓库
3. 配置构建和启动命令
4. 设置环境变量

详细步骤参见: https://render.com/docs/

---

## 移动应用发布

### iOS 发布 (App Store)

1. 配置 Apple Developer 账号
2. 运行 EAS Build

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android 发布 (Google Play)

1. 配置 Google Play Console
2. 运行 EAS Build

```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## 数据库迁移

### SQLite -> PostgreSQL 迁移

1. 导出 SQLite 数据
2. 更新 schema.prisma 中的 provider
3. 创建 PostgreSQL 数据库
4. 运行 Prisma migrate
5. 导入数据

```bash
# 更新 DATABASE_URL
export DATABASE_URL="postgresql://..."

# 推送 schema
npx prisma db push

# 或使用迁移
npx prisma migrate deploy
```

---

## 监控和维护

### 健康检查

```bash
# 检查 API 状态
curl https://api.your-domain.com/health

# 检查数据库连接
curl https://api.your-domain.com/health/db
```

### 日志查看

```bash
# Docker 日志
docker-compose logs -f api

# 或查看日志文件
tail -f /var/log/app/app.log
```

### 备份

```bash
# PostgreSQL 备份
pg_dump -U user database > backup.sql

# 恢复
psql -U user database < backup.sql
```
```

---

## 生产环境 Docker Compose

**`docker-compose.production.yml`**:

```yaml
version: '3.8'

services:
  api:
    build: ./artifacts/backend
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - ./artifacts/backend/.env.production
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER:-app}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-password}
      POSTGRES_DB: ${DB_NAME:-app}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-app}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## 决策原则

* **安装步骤**: 清楚列出后端和前端所需的依赖安装命令
* **启动命令**: 分别提供启动后端和前端的命令
* **访问路径**: 说明演示时需要访问的地址和端口
* **部署选项**: 提供多种部署方式供用户选择
* **演示流程**: 使用列表或步骤分项，帮助演示者把握节奏
* **已知问题**: 坦诚列出目前存在的缺陷或未完成的功能

---

## 质量检查清单

在完成 Preview 阶段之前，确认以下各项：

### 本地运行
- [ ] README.md 包含完整的环境要求
- [ ] 安装步骤可以一步步执行
- [ ] 启动命令正确无误
- [ ] 访问地址和端口清晰说明

### 部署配置
- [ ] Dockerfile 存在且可构建
- [ ] docker-compose.yml 可正常启动
- [ ] 生产环境变量模板完整
- [ ] EAS 配置正确 (如为移动应用)

### 演示准备
- [ ] 演示流程清晰、有条理
- [ ] 已知问题和限制已列出
- [ ] 常见问题有解答

### 测试验证
- [ ] 按照 README 可以成功启动应用
- [ ] Docker 构建无错误
- [ ] 健康检查端点可访问

---

## 不要做 (NEVER)

* **NEVER** 忽略依赖安装或配置步骤，否则运行或部署很可能失败
* **NEVER** 提供与应用无关的额外说明或营销语言
* **NEVER** 夸大产品能力，隐瞒缺陷或限制
* **NEVER** 在部署配置中硬编码敏感信息 (密码、API Key 等)
* **NEVER** 忽略健康检查配置，这对生产环境监控至关重要
* **NEVER** 跳过数据库迁移说明，这是上线的关键步骤
* **NEVER** 使用 `latest` 作为 Docker 镜像标签，应使用具体版本号
* **NEVER** 在生产环境使用 SQLite (应迁移到 PostgreSQL)

---

遵循这些指南，可以使运行说明和部署配置清晰可靠，有助于团队快速启动、演示和部署产品。

---

## 常见问题与解决方案 (生成 artifacts/preview/README.md 时需包含)

### 后端启动问题

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `Invalid environment variables: { DATABASE_URL: [ 'Required' ] }` | .env 文件未加载或格式错误 | 1. 安装 `dotenv`；2. 在 `src/index.ts` 首行添加 `import 'dotenv/config';`；3. 移除 .env 中变量值的引号 |
| `Error: Prisma schema validation - Composite types are not supported on sqlite` | SQLite 不支持 `type` 定义 | 将 `type` 改为 `String` 类型存储 JSON |
| `Cannot find module 'xxx'` | 依赖未安装 | 运行 `npm install` |

### 前端启动问题

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `Unable to resolve react-native-web` | 缺少 Web 支持依赖 | 运行 `npx expo install react-native-web react-dom @expo/metro-runtime` |
| `Unable to resolve @react-native-async-storage/async-storage` | 缺少存储依赖 | 运行 `npm install @react-native-async-storage/async-storage` |
| `View is not defined` | 组件未正确导入 | 添加 `import { View } from 'react-native';` |
| `SyntaxError: Unterminated string constant` | 代码语法错误 | 检查是否有连续的引号或未闭合的字符串 |
| `404 Not Found` API 调用 | 后端未启动或端口错误 | 1. 确认后端运行；2. 检查 .env 中的 `EXPO_PUBLIC_API_URL` |

### AI 推荐问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `No response from AI` | API Key 无效或模型名错误 | 检查 .env 中的 `OPENAI_API_KEY` 和 `OPENAI_MODEL` |
| 总是推荐同一种菜系 | AI 提示词不够多样化 | 增加 `temperature` 参数，改进提示词要求多样化 |

### 快速修复命令

```bash
# 后端 - 安装缺失依赖
cd artifacts/backend
npm install dotenv
npm install

# 前端 - 安装 Web 支持依赖
cd artifacts/client
npx expo install react-native-web react-dom @expo/metro-runtime
npm install @react-native-async-storage/async-storage

# 重启服务
# 按 Ctrl+C 停止，然后重新运行 npm run dev / npm start
```
