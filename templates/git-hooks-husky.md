# Git Hooks 配置指南 (Husky)

本文档提供了 AI App Factory 生成的应用的 Git Hooks 配置模板，使用 Husky + lint-staged 实现提交前的自动化检查。

## 工具简介

| 工具 | 用途 |
|------|------|
| Husky | Git Hooks 管理工具 |
| lint-staged | 只对暂存文件运行命令 |
| commitlint | 提交消息格式校验 |

---

## 安装配置

### 1. 安装依赖

```bash
# 安装 Husky
npm install -D husky

# 安装 lint-staged
npm install -D lint-staged

# 安装 commitlint
npm install -D @commitlint/cli @commitlint/config-conventional
```

### 2. 初始化 Husky

```bash
# 初始化 Husky
npx husky init

# 这会创建 .husky/ 目录并添加 prepare 脚本
```

### 3. package.json 配置

```json
{
  "scripts": {
    "prepare": "husky",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## Hook 配置

### pre-commit Hook

在提交前运行代码检查和格式化。

**`.husky/pre-commit`**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 运行 lint-staged
npx lint-staged

# 检查 TypeScript 类型
echo "📝 Type checking..."
npm run type-check

echo "✅ Pre-commit checks passed!"
```

### commit-msg Hook

校验提交消息格式。

**`.husky/commit-msg`**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "📋 Validating commit message..."

npx --no -- commitlint --edit "$1"

echo "✅ Commit message is valid!"
```

### pre-push Hook (可选)

在推送前运行测试。

**`.husky/pre-push`**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."

npm run test

echo "✅ All tests passed!"
```

---

## Commitlint 配置

### 配置文件

**`commitlint.config.js`**:

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // Bug 修复
        'docs',     // 文档更新
        'style',    // 代码格式（不影响代码运行）
        'refactor', // 重构（不新增功能或修复 Bug）
        'perf',     // 性能优化
        'test',     // 测试相关
        'chore',    // 构建过程或辅助工具
        'revert',   // 回滚
        'ci',       // CI 配置
      ],
    ],
    // 标题不能为空
    'subject-empty': [2, 'never'],
    // 类型不能为空
    'type-empty': [2, 'never'],
    // 标题最大长度
    'subject-max-length': [2, 'always', 72],
    // 类型小写
    'type-case': [2, 'always', 'lower-case'],
  },
};
```

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**:

```bash
# 简单格式
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复订单列表分页问题"
git commit -m "docs: 更新 README 安装说明"

# 带 scope
git commit -m "feat(auth): 添加微信登录支持"
git commit -m "fix(order): 修复金额计算精度问题"

# 带 body 和 footer
git commit -m "feat(user): 添加用户头像上传功能

- 支持 JPG/PNG 格式
- 自动裁剪为正方形
- 最大文件大小 2MB

Closes #42"
```

---

## lint-staged 配置

### 基础配置

**`package.json`**:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml}": [
      "prettier --write"
    ],
    "*.css": [
      "prettier --write"
    ]
  }
}
```

### 高级配置

**`.lintstagedrc.js`**:

```javascript
module.exports = {
  // TypeScript 文件
  '*.{ts,tsx}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
    'tsc --noEmit', // 全量类型检查
  ],

  // Prisma schema
  'prisma/schema.prisma': () => [
    'npx prisma validate',
    'npx prisma format',
  ],

  // JSON 和 Markdown
  '*.{json,md}': ['prettier --write'],
};
```

---

## 完整项目配置

### 目录结构

```
项目根目录/
├── .husky/
│   ├── _/
│   │   └── husky.sh
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push (可选)
├── commitlint.config.js
├── .lintstagedrc.js (可选)
├── .eslintrc.json
├── .prettierrc
└── package.json
```

### 后端项目配置

**`backend/package.json`**:

```json
{
  "name": "backend",
  "scripts": {
    "prepare": "cd .. && husky install backend/.husky",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "prisma:validate": "prisma validate",
    "prisma:format": "prisma format"
  },
  "lint-staged": {
    "src/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ],
    "prisma/schema.prisma": [
      "npx prisma validate",
      "npx prisma format"
    ]
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 前端项目配置

**`client/package.json`**:

```json
{
  "name": "client",
  "scripts": {
    "prepare": "cd .. && husky install client/.husky",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\"",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Monorepo 配置

对于包含前后端的 Monorepo 项目:

### 项目根目录

**`package.json`**:

```json
{
  "name": "my-app",
  "private": true,
  "workspaces": [
    "backend",
    "client"
  ],
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0"
  },
  "lint-staged": {
    "backend/**/*.ts": [
      "npm run lint:fix --workspace=backend"
    ],
    "client/**/*.{ts,tsx}": [
      "npm run lint:fix --workspace=client"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Husky Hooks

**`.husky/pre-commit`**:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 运行 lint-staged
npx lint-staged

# 后端类型检查
echo "📝 Type checking backend..."
npm run type-check --workspace=backend

# 前端类型检查
echo "📝 Type checking client..."
npm run type-check --workspace=client

echo "✅ Pre-commit checks passed!"
```

---

## 跳过 Hooks

在特殊情况下需要跳过 hooks:

```bash
# 跳过 pre-commit hook
git commit -m "fix: emergency fix" --no-verify

# 跳过所有 hooks
HUSKY=0 git commit -m "fix: emergency fix"
```

**注意**: 尽量避免使用 `--no-verify`，这会绕过所有检查。

---

## 故障排查

### 常见问题

**1. Husky hooks 不执行**

```bash
# 重新安装 hooks
rm -rf .husky
npx husky init
npx husky add .husky/pre-commit "npx lint-staged"
```

**2. lint-staged 报错**

```bash
# 清理 Git 暂存区
git reset HEAD

# 重新暂存文件
git add .
git commit
```

**3. commitlint 验证失败**

```bash
# 检查提交消息格式
echo "fix: your message" | npx commitlint

# 查看详细错误
npx commitlint --from HEAD~1 --to HEAD --verbose
```

**4. 权限问题 (Unix)**

```bash
# 添加执行权限
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

---

## 检查清单

### 初始化

- [ ] 安装 husky, lint-staged, commitlint
- [ ] 运行 `npx husky init`
- [ ] 配置 pre-commit hook
- [ ] 配置 commit-msg hook
- [ ] 创建 commitlint.config.js
- [ ] 配置 lint-staged

### 验证

- [ ] 提交代码时自动运行 lint
- [ ] 错误的提交消息被拒绝
- [ ] TypeScript 类型检查通过
- [ ] 所有团队成员安装了 hooks

### 维护

- [ ] 新成员运行 `npm install` 自动安装 hooks
- [ ] CI 不受 hooks 影响
- [ ] 定期更新 husky 和相关依赖

---

## 最佳实践

### 1. 保持 hooks 快速

pre-commit 应该在 10 秒内完成:

```javascript
// ✅ 好: 只检查暂存文件
"lint-staged": {
  "*.ts": ["eslint --fix"]
}

// ❌ 避免: 全量检查
"scripts": {
  "pre-commit": "npm run lint && npm run test"
}
```

### 2. 使用 lint-staged

只对修改的文件运行检查，提高效率。

### 3. 分层检查

- **pre-commit**: 快速检查 (lint, format)
- **pre-push**: 完整检查 (test, build)

### 4. 提供绕过方式

紧急修复时允许使用 `--no-verify`，但应记录并补充检查。

### 5. 团队一致性

确保所有团队成员使用相同的 hooks 配置。

---

遵循此指南可以建立有效的本地代码质量门禁，在代码提交前发现问题，提高代码库的整体质量。
