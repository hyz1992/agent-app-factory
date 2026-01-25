# Changelog 生成规范

本文档定义了 AI App Factory 生成的应用中使用的 Changelog 格式和生成规范。

## Changelog 格式

采用 [Keep a Changelog](https://keepachangelog.com/) 规范。

### 文件位置

```
项目根目录/CHANGELOG.md
```

### 基本结构

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- 新功能描述

### Changed
- 变更描述

### Fixed
- Bug 修复描述

## [1.0.0] - 2026-01-15

### Added
- 初始版本功能列表

[Unreleased]: https://github.com/user/repo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

---

## 变更类型

### Added (新增)

新功能或新能力。

**示例**:
```markdown
### Added
- 添加用户注册功能
- 添加商品搜索 API
- 支持深色模式
```

### Changed (变更)

对现有功能的修改或改进。

**示例**:
```markdown
### Changed
- 优化列表加载性能，提升 50%
- 更新 API 响应格式为统一结构
- 重构用户认证模块
```

### Deprecated (弃用)

即将移除的功能。

**示例**:
```markdown
### Deprecated
- `/api/v1/users` 将在 v2.0 移除，请使用 `/api/v2/users`
- `getUserInfo()` 方法已弃用，请使用 `getUser()`
```

### Removed (移除)

已移除的功能。

**示例**:
```markdown
### Removed
- 移除旧版 OAuth 1.0 支持
- 删除未使用的 `utils/legacy.ts` 文件
```

### Fixed (修复)

Bug 修复。

**示例**:
```markdown
### Fixed
- 修复登录时密码验证失败的问题 (#123)
- 修复移动端列表滚动卡顿
- 修复日期格式化在 Safari 的兼容性问题
```

### Security (安全)

安全相关的修复或改进。

**示例**:
```markdown
### Security
- 修复 XSS 漏洞 (CVE-2026-XXXX)
- 升级依赖修复已知安全问题
- 添加请求频率限制防止 DDoS
```

---

## 版本号规范

采用 [Semantic Versioning](https://semver.org/) (语义化版本):

```
MAJOR.MINOR.PATCH

示例: 1.2.3
```

### 版本号规则

| 版本 | 何时增加 | 示例 |
|------|----------|------|
| MAJOR | 不兼容的 API 变更 | 1.0.0 → 2.0.0 |
| MINOR | 向后兼容的新功能 | 1.0.0 → 1.1.0 |
| PATCH | 向后兼容的 Bug 修复 | 1.0.0 → 1.0.1 |

### 预发布版本

```
1.0.0-alpha.1   # 内测版本
1.0.0-beta.1    # 公测版本
1.0.0-rc.1      # 候选发布版本
```

---

## 编写规范

### 1. 条目格式

```markdown
- 动词开头的简洁描述 (关联 Issue/PR)
```

**好的示例**:
```markdown
- 添加用户头像上传功能 (#42)
- 修复订单列表分页错误 (#56)
- 优化图片加载速度
```

**避免的示例**:
```markdown
- user avatar feature  (不使用中文或不清晰)
- Fixed bug            (太模糊)
- Update code          (没有具体说明)
```

### 2. 动词使用

| 类型 | 推荐动词 |
|------|----------|
| Added | 添加、新增、支持 |
| Changed | 优化、改进、更新、重构、调整 |
| Deprecated | 弃用、废弃 |
| Removed | 移除、删除 |
| Fixed | 修复、解决 |
| Security | 修复、升级 |

### 3. 关联 Issue/PR

```markdown
### Fixed
- 修复登录失败问题 (#123)
- 解决内存泄漏 (PR #456)
```

### 4. 保持简洁

```markdown
# ✅ 好
- 添加商品收藏功能

# ❌ 避免
- 在商品详情页面添加了一个收藏按钮，用户可以点击该按钮将商品添加到收藏列表中
```

### 5. 按影响排序

重要变更放在前面:

```markdown
### Added
- 添加支付宝支付支持 (重大功能)
- 添加订单导出功能
- 添加页面加载动画
```

---

## 自动化工具

### 1. Conventional Commits

使用约定式提交消息格式:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**类型**:

| Type | 说明 | Changelog 分类 |
|------|------|----------------|
| feat | 新功能 | Added |
| fix | Bug 修复 | Fixed |
| docs | 文档更新 | (不记录) |
| style | 代码格式 | (不记录) |
| refactor | 重构 | Changed |
| perf | 性能优化 | Changed |
| test | 测试 | (不记录) |
| chore | 杂项 | (不记录) |

**示例**:

```bash
git commit -m "feat(auth): 添加微信登录支持"
git commit -m "fix(order): 修复订单金额计算错误 (#123)"
git commit -m "perf(list): 优化列表渲染性能"
```

### 2. 自动生成工具

**conventional-changelog-cli**:

```bash
# 安装
npm install -D conventional-changelog-cli

# 生成 Changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# package.json 脚本
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  }
}
```

**release-it**:

```bash
# 安装
npm install -D release-it @release-it/conventional-changelog

# 配置 .release-it.json
{
  "git": {
    "commitMessage": "chore: release v${version}"
  },
  "plugins": {
    "@release-it/conventional-changelog": {
      "preset": "angular",
      "infile": "CHANGELOG.md"
    }
  }
}

# 运行
npx release-it
```

### 3. Commitlint

校验提交消息格式:

```bash
# 安装
npm install -D @commitlint/cli @commitlint/config-conventional

# 配置 commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] };

# 配合 Husky 使用
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

---

## 发布流程

### 1. 更新 Changelog

```markdown
## [Unreleased]

### Added
- 新功能 1
- 新功能 2

### Fixed
- 修复问题 1

↓ 发布时移动到新版本 ↓

## [1.1.0] - 2026-01-20

### Added
- 新功能 1
- 新功能 2

### Fixed
- 修复问题 1

## [1.0.0] - 2026-01-15
...
```

### 2. 更新版本号

```bash
# 手动更新 package.json
{
  "version": "1.1.0"
}

# 或使用 npm version
npm version minor  # 1.0.0 → 1.1.0
npm version patch  # 1.0.0 → 1.0.1
npm version major  # 1.0.0 → 2.0.0
```

### 3. 创建 Git Tag

```bash
# 创建标签
git tag -a v1.1.0 -m "Release v1.1.0"

# 推送标签
git push origin v1.1.0
```

### 4. 创建 GitHub Release

```bash
# 使用 gh CLI
gh release create v1.1.0 --title "v1.1.0" --notes-file release-notes.md
```

---

## 模板

### 初始 CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

## [0.1.0] - YYYY-MM-DD

### Added
- 项目初始化
- 基础 CRUD API
- 移动端首页和列表页
- 用户认证功能 (如适用)

[Unreleased]: https://github.com/username/repo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/username/repo/releases/tag/v0.1.0
```

### Release Notes 模板

```markdown
## 🎉 v1.1.0 发布

### ✨ 新功能

- **商品收藏**: 用户可以收藏喜欢的商品
- **订单导出**: 支持导出订单为 Excel 文件

### 🐛 Bug 修复

- 修复了登录页面在 iOS 15 的显示问题
- 修复了订单金额计算的精度问题

### 🔧 改进

- 优化了列表页加载速度
- 改进了错误提示的用户体验

### ⚠️ 注意事项

- 此版本需要重新运行数据库迁移
- 最低支持 Node.js 18

### 📦 依赖更新

- 升级 React Native 到 0.72
- 升级 Prisma 到 5.0

---

完整变更日志: [CHANGELOG.md](./CHANGELOG.md)
```

---

## 检查清单

### 每次发布前

- [ ] Changelog 已更新
- [ ] 版本号已更新 (package.json)
- [ ] 所有变更已分类
- [ ] 关联了相关 Issue/PR
- [ ] 日期格式正确 (YYYY-MM-DD)
- [ ] 底部链接已更新

### Changelog 质量

- [ ] 条目以动词开头
- [ ] 描述简洁清晰
- [ ] 没有重复条目
- [ ] 按重要性排序
- [ ] 没有内部代码术语

---

## 最佳实践

### 1. 持续更新

每次合并 PR 时更新 `[Unreleased]` 部分，而非发布时一次性补充。

### 2. 面向用户

Changelog 是给用户看的，使用用户能理解的语言:

```markdown
# ✅ 好
- 添加一键分享到微信功能

# ❌ 避免
- 重构 ShareService 使用策略模式
```

### 3. 保持一致

统一使用中文或英文，统一动词时态和风格。

### 4. 关联上下文

```markdown
### Fixed
- 修复用户无法登录的问题 (#123)

详细说明: 由于 Token 过期时间设置错误，导致部分用户登录失败。
此问题影响约 5% 的用户。
```

---

遵循此规范可以确保 Changelog 的一致性和可读性，帮助用户和团队了解项目的演进历史。
