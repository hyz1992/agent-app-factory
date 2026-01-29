# npm 发布指南

## 前置检查清单

在发布之前，请确保：

- [ ] **包名可用** - 在 https://www.npmjs.com/ 搜索 `agent-app-factory`，确认没有同名包（或有发布权限）
- [ ] **npm 账号** - 注册了 npm 账号（https://www.npmjs.com/signup）
- [ ] **本地登录** - 已执行 `npm login`
- [ ] **清理文件** - 删除了不需要的文件（如 `.git`、`node_modules`、测试文件等）
- [ ] **版本号** - 更新了 `package.json` 中的版本号
- [ ] **README** - 有清晰的 README.md 说明如何使用
- [ ] **License** - 指定了开源协议（当前是 MIT）

## 发布步骤

### 1. 准备工作

```bash
# 1.1 清理项目
npm run build  # 如果有构建步骤
rm -rf node_modules
npm install --production

# 1.2 检查将要发布的文件
npm pack --dry-run

# 查看输出，确认只包含必要的文件
```

### 2. 更新 .npmignore（可选）

如果需要排除某些文件，创建 `.npmignore` 文件：

```
# 开发文件
.git
.gitignore
.claude/
.idea/
.vscode/

# 测试文件
test/
*.test.js
**/*.test.md

# 文档（除了 README 和 LICENSE）
docs/
CLAUDE.md
DESIGN.md

# CI/CD
.github/

# 其他
.npmrc
.env
.env.*
*.log
```

### 3. 更新版本号

```bash
# 补丁版本（bug 修复）：1.0.0 -> 1.0.1
npm version patch

# 次版本（新功能）：1.0.0 -> 1.1.0
npm version minor

# 主版本（破坏性变更）：1.0.0 -> 2.0.0
npm version major
```

### 4. 测试包（推荐）

```bash
# 4.1 打包
npm pack

# 这会生成 agent-app-factory-1.0.0.tgz 文件

# 4.2 在本地测试
# 切换到测试目录
cd /tmp/test-factory
mkdir test-factory && cd test-factory

# 安装本地包
npm install /path/to/agent-app-factory-1.0.0.tgz

# 测试 CLI 命令
npx factory init
```

### 5. 登录 npm

```bash
npm login
# 输入用户名、密码、邮箱
```

### 6. 发布到 npm

```bash
# 6.1 发布到公共 registry
npm publish

# 6.2 如果是第一次发布，可能需要加 --access public
npm publish --access public

# 6.3 发布到测试环境（npm 的镜像测试）
npm publish --dry-run
```

### 7. 验证发布

```bash
# 7.1 在浏览器访问
# https://www.npmjs.com/package/agent-app-factory

# 7.2 或使用命令
npm view agent-app-factory

# 7.3 全局安装测试
npm install -g agent-app-factory
factory --version
```

## 常见问题

### 包名已被占用

如果 `agent-app-factory` 已被占用，需要修改 `package.json`：

```json
{
  "name": "@your-scope/agent-app-factory"
  // 或者
  "name": "agent-app-factory-cli"
  // 或者
  "name": "ai-app-factory"
}
```

### 发布失败：403 Forbidden

可能是包名作用域问题：
- 如果包名带 `@scope/`，需要使用 `npm publish --access public`

### 如何撤回已发布的版本

```bash
# 24 小时内可以撤回（不推荐）
npm unpublish agent-app-factory@1.0.0

# 24 小时后，只能弃用（deprecate）
npm deprecate agent-app-factory@1.0.0 "This version has security issues"
```

### 如何更新已发布的包

```bash
# 1. 修改代码
# 2. 更新版本号
npm version patch  # 或 minor/major

# 3. 重新发布
npm publish
```

## 发布后的工作

### 1. 创建 GitHub Release

在 GitHub 仓库创建对应的 Release Tag：
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. 更新文档

在 README.md 中添加安装说明：
```markdown
## 安装

```bash
npm install -g agent-app-factory
```

## 使用

```bash
factory init my-project
```
```

### 3. 添加 badges（可选）

在 README.md 顶部添加：
```markdown
![npm version](https://badge.fury.io/js/agent-app-factory.svg)
![downloads](https://img.shields.io/npm/dm/agent-app-factory.svg)
![license](https://img.shields.io/npm/l/agent-app-factory.svg)
```

## 持续集成（CI/CD）

可以在 GitHub Actions 中自动化发布：

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 注意事项

1. **版本号遵循 SemVer 规范**：`主版本.次版本.补丁版本`
2. **每次发布都要更新版本号**：npm 不允许覆盖已发布的版本
3. **检查敏感信息**：确保不包含 API keys、密码等
4. **测试所有命令**：发布前确保 `factory init`、`factory continue` 等命令都能正常工作
5. **files 字段**（可选）：如果只想发布特定文件，在 package.json 中添加：

```json
{
  "files": [
    "cli",
    "agents",
    "skills",
    "policies",
    "templates",
    "pipeline.yaml",
    "README.md",
    "LICENSE"
  ]
}
```

## 快速发布命令总结

```bash
# 完整流程
npm version patch     # 更新版本
npm pack              # 打包测试
npm publish           # 发布到 npm
git push             # 推送代码到 GitHub
```
