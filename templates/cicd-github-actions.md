# CI/CD 配置指南 (GitHub Actions)

本文档提供了 AI App Factory 生成的应用的 CI/CD 配置模板，使用 GitHub Actions 实现自动化测试、构建和部署。

## 目录结构

CI/CD 配置文件应放在项目根目录的 `.github/workflows/` 目录:

```
.github/
└── workflows/
    ├── backend-ci.yml      # 后端 CI 流水线
    ├── frontend-ci.yml     # 前端 CI 流水线
    └── deploy.yml          # 部署流水线 (可选)
```

---

## 后端 CI 流水线

**文件**: `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [main, develop]
    paths:
      - 'backend/**'

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Run linter
        working-directory: backend
        run: npm run lint

      - name: Run type check
        working-directory: backend
        run: npx tsc --noEmit

      - name: Validate Prisma schema
        working-directory: backend
        run: npx prisma validate

      - name: Generate Prisma Client
        working-directory: backend
        run: npx prisma generate

      - name: Run tests
        working-directory: backend
        run: npm test
        env:
          NODE_ENV: test
          DATABASE_URL: file:./test.db

      - name: Upload coverage
        if: matrix.node-version == '20.x'
        uses: codecov/codecov-action@v3
        with:
          files: backend/coverage/coverage-final.json
          flags: backend

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Build
        working-directory: backend
        run: npm run build

      - name: Archive build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: backend-dist
          path: backend/dist
```

---

## 前端 CI 流水线

**文件**: `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'client/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [main, develop]
    paths:
      - 'client/**'

jobs:
  test:
    name: Test & Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        working-directory: client
        run: npm ci

      - name: Run linter
        working-directory: client
        run: npm run lint

      - name: Run type check
        working-directory: client
        run: npx tsc --noEmit

      - name: Run tests
        working-directory: client
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: client/coverage/coverage-final.json
          flags: frontend

  build:
    name: Build (Web)
    runs-on: ubuntu-latest
    needs: test

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        working-directory: client
        run: npm ci

      - name: Build for web
        working-directory: client
        run: npx expo export:web

      - name: Archive web build
        uses: actions/upload-artifact@v4
        with:
          name: web-dist
          path: client/web-build

  build-preview:
    name: Build (EAS Preview)
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        working-directory: client
        run: npm ci

      - name: Build preview
        working-directory: client
        run: eas build --platform all --profile preview --non-interactive
```

---

## 部署流水线 (可选)

**文件**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-backend:
    name: Deploy Backend
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    name: Deploy Frontend (Web)
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install dependencies
        working-directory: client
        run: npm ci

      - name: Build for production
        working-directory: client
        run: npx expo export:web
        env:
          EXPO_PUBLIC_API_URL: ${{ secrets.PROD_API_URL }}

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './client/web-build'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-mobile:
    name: Deploy Mobile App
    runs-on: ubuntu-latest
    environment: production
    if: github.event_name == 'workflow_dispatch'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        working-directory: client
        run: npm ci

      - name: Build and submit to stores
        working-directory: client
        run: |
          eas build --platform all --profile production --non-interactive
          eas submit --platform all --latest
```

---

## Docker 构建流水线

**文件**: `.github/workflows/docker-build.yml`

```yaml
name: Docker Build

on:
  push:
    branches: [main]
    tags:
      - 'v*'

jobs:
  build-and-push:
    name: Build and Push Docker Image
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.DOCKER_USERNAME }}/my-app-backend
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## 数据库迁移流水线

**文件**: `.github/workflows/db-migrate.yml`

```yaml
name: Database Migration

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        type: choice
        options:
          - staging
          - production

jobs:
  migrate:
    name: Run Database Migration
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Run Prisma migration
        working-directory: backend
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Verify migration
        working-directory: backend
        run: npx prisma migrate status
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## GitHub Secrets 配置

需要在 GitHub 仓库中配置以下 Secrets:

### 通用

- `CODECOV_TOKEN` - Codecov 上传 token (可选)

### 后端部署

- `RAILWAY_TOKEN` - Railway 部署 token
- `DOCKER_USERNAME` - Docker Hub 用户名
- `DOCKER_PASSWORD` - Docker Hub 密码
- `DATABASE_URL` - 生产环境数据库 URL

### 前端部署

- `EXPO_TOKEN` - Expo 账号 token
- `NETLIFY_AUTH_TOKEN` - Netlify 部署 token
- `NETLIFY_SITE_ID` - Netlify 站点 ID
- `PROD_API_URL` - 生产环境 API 地址

---

## 分支保护规则

建议在 GitHub 仓库设置中配置以下分支保护:

### main 分支

- ✅ Require a pull request before merging
- ✅ Require approvals (至少 1 个)
- ✅ Require status checks to pass before merging
  - Backend CI / test
  - Backend CI / build
  - Frontend CI / test
  - Frontend CI / build
- ✅ Require branches to be up to date before merging
- ✅ Require linear history (可选)

### develop 分支

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - Backend CI / test
  - Frontend CI / test

---

## CI/CD 最佳实践

### 1. 快速反馈

- 优先运行快速检查（lint, type check）
- 并行运行独立的任务
- 使用缓存加速依赖安装

### 2. 环境一致性

- 固定 Node.js 版本
- 使用 `npm ci` 而非 `npm install`
- 在 CI 中使用与本地相同的命令

### 3. 安全性

- 使用 GitHub Secrets 存储敏感信息
- 不在日志中打印密钥
- 限制部署权限到特定环境

### 4. 可维护性

- 为每个工作流添加清晰的名称
- 使用 `working-directory` 组织 monorepo
- 提取可复用的步骤为 composite actions

### 5. 成本优化

- 只在相关文件变更时触发 CI
- 使用 GitHub Actions 缓存
- 避免不必要的重复构建

---

## 使用示例

### 本地测试 CI

在提交前，可以本地运行 CI 中的命令:

```bash
# 后端
cd backend
npm run lint
npx tsc --noEmit
npx prisma validate
npm test

# 前端
cd client
npm run lint
npx tsc --noEmit
npm test
```

### 手动触发部署

在 GitHub Actions 页面，选择 "Deploy" workflow，点击 "Run workflow" 手动触发部署。

### 查看 CI 状态

在 PR 页面底部可以看到所有 CI 检查的状态。点击 "Details" 查看详细日志。

---

## 故障排查

### 常见问题

**1. npm ci 失败**

```yaml
# 解决方案: 清理缓存
- name: Clear npm cache
  run: npm cache clean --force
```

**2. 测试超时**

```yaml
# 解决方案: 增加超时时间
- name: Run tests
  run: npm test
  timeout-minutes: 10
```

**3. Prisma 生成失败**

```yaml
# 解决方案: 确保先运行 prisma generate
- name: Generate Prisma Client
  run: npx prisma generate

- name: Run tests
  run: npm test
```

---

## CI/CD 检查清单

### 初始设置

- [ ] 创建 `.github/workflows/` 目录
- [ ] 添加后端 CI 配置
- [ ] 添加前端 CI 配置
- [ ] 配置必要的 GitHub Secrets
- [ ] 设置分支保护规则

### 每次 PR

- [ ] CI 自动运行
- [ ] 所有检查通过
- [ ] 代码覆盖率报告生成
- [ ] 构建产物正常

### 部署前

- [ ] 所有测试通过
- [ ] 数据库迁移已准备
- [ ] 环境变量已配置
- [ ] 回滚方案已准备

---

遵循此指南可以建立稳定、高效的 CI/CD 流水线，提高开发效率和代码质量。
