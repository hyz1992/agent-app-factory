# PR 模板和代码审查清单

本文档定义了 AI App Factory 生成的应用中使用的 Pull Request 模板和代码审查标准。

## PR 模板

以下模板应添加到 `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## 变更描述

<!-- 简要描述本次 PR 的主要变更内容 -->

## 变更类型

<!-- 请勾选适用的类型 -->

- [ ] 新功能 (Feature)
- [ ] Bug 修复 (Bug Fix)
- [ ] 性能优化 (Performance)
- [ ] 重构 (Refactoring)
- [ ] 文档更新 (Documentation)
- [ ] 测试更新 (Testing)
- [ ] 依赖更新 (Dependencies)
- [ ] 配置变更 (Configuration)

## 相关 Issue

<!-- 关联的 Issue 编号，例如: Closes #123 -->

Closes #

## 变更详情

### 后端变更
<!-- 列出后端的主要变更 -->

-

### 前端变更
<!-- 列出前端的主要变更 -->

-

### 数据库变更
<!-- 如果有数据库 schema 变更，请说明 -->

-

## 测试

<!-- 描述如何测试这些变更 -->

### 测试步骤

1.
2.
3.

### 测试结果

- [ ] 所有单元测试通过
- [ ] 手动测试通过
- [ ] 后端可正常启动
- [ ] 前端可正常运行

## 截图/录屏

<!-- 如果有 UI 变更，请提供截图或录屏 -->

## 检查清单

### 代码质量

- [ ] 代码遵循项目的代码规范
- [ ] 已删除所有 console.log 和调试代码
- [ ] 没有遗留 TODO 或 FIXME 注释
- [ ] 变量和函数命名清晰有意义
- [ ] 复杂逻辑添加了必要注释

### 类型安全

- [ ] 没有使用 `any` 类型
- [ ] 所有新增的函数有类型定义
- [ ] TypeScript 编译无错误

### 测试

- [ ] 为新功能添加了测试
- [ ] 更新了受影响的测试
- [ ] 测试覆盖了主要场景

### 安全

- [ ] 没有硬编码敏感信息（密码、API Key）
- [ ] 用户输入已验证
- [ ] 没有 SQL 注入风险
- [ ] 没有 XSS 风险

### 性能

- [ ] 没有明显的性能问题
- [ ] 数据库查询已优化
- [ ] 列表使用了分页

### 文档

- [ ] 更新了相关文档
- [ ] API 变更更新了 Swagger 文档
- [ ] 如有重大变更，更新了 README

## 部署注意事项

<!-- 部署此 PR 需要注意的事项 -->

- [ ] 需要运行数据库迁移
- [ ] 需要更新环境变量
- [ ] 需要重启服务
- [ ] 其他: _______

## 额外说明

<!-- 任何需要审查者注意的其他信息 -->

---

**审查者**: @<!-- 指定审查者 GitHub 用户名 -->
```

---

## 代码审查清单

### 审查者指南

代码审查时，按以下清单逐项检查：

#### 1. 功能正确性

**检查项**:
- [ ] PR 描述清晰，变更范围明确
- [ ] 变更符合相关 Issue 的需求
- [ ] 核心功能实现正确
- [ ] 边界情况已处理
- [ ] 错误处理完善

**审查要点**:
- 理解变更的业务目的
- 验证实现方式是否合理
- 检查是否有遗漏的场景

#### 2. 代码质量

**检查项**:
- [ ] 代码符合 [code-standards.md](code-standards.md)
- [ ] 命名清晰有意义
- [ ] 函数职责单一，长度适中 (< 50 行)
- [ ] 没有重复代码
- [ ] 复杂逻辑有注释说明

**审查要点**:
```typescript
// ❌ 避免: 函数过长、职责不清
async function processItem(item) {
  // 100+ 行混杂逻辑...
}

// ✅ 好: 拆分为小函数
async function processItem(item) {
  const validated = await validateItem(item);
  const transformed = transformItem(validated);
  const saved = await saveItem(transformed);
  await notifyChange(saved);
  return saved;
}
```

#### 3. TypeScript 类型

**检查项**:
- [ ] 没有使用 `any` 类型
- [ ] 公共 API 有明确的类型定义
- [ ] interface/type 使用正确
- [ ] 没有类型断言滥用

**审查要点**:
```typescript
// ❌ 避免: 使用 any
function process(data: any) { ... }

// ✅ 好: 明确类型
interface ProcessData {
  id: number;
  name: string;
}

function process(data: ProcessData) { ... }
```

#### 4. 测试覆盖

**检查项**:
- [ ] 新功能有对应的测试
- [ ] 测试覆盖主要场景
- [ ] 测试用例清晰易懂
- [ ] 所有测试通过

**审查要点**:
- 验证测试是否真正测试了功能
- 检查是否有遗漏的边界情况
- 确保测试不依赖外部服务

#### 5. 安全性

**检查项**:
- [ ] 用户输入已验证（使用 Zod schema）
- [ ] 敏感数据不出现在日志中
- [ ] SQL 注入风险已防范（使用 Prisma）
- [ ] XSS 风险已防范
- [ ] CORS 配置正确
- [ ] 没有硬编码密钥或 Token

**审查要点**:
```typescript
// ❌ 避免: 未验证输入
app.post('/api/items', async (req, res) => {
  const item = await prisma.item.create({ data: req.body });
});

// ✅ 好: 验证输入
import { createItemSchema } from '@/validators/item';

app.post(
  '/api/items',
  validateRequest(createItemSchema),
  async (req, res) => {
    const item = await itemService.create(req.body);
  }
);
```

#### 6. 性能

**检查项**:
- [ ] 数据库查询已优化
- [ ] 列表查询使用分页
- [ ] 没有 N+1 查询
- [ ] 没有明显的性能瓶颈

**审查要点**:
```typescript
// ❌ 避免: N+1 查询
const posts = await prisma.post.findMany();
for (const post of posts) {
  post.author = await prisma.user.findUnique({ where: { id: post.authorId } });
}

// ✅ 好: 预加载关联
const posts = await prisma.post.findMany({
  include: { author: true },
});
```

#### 7. 错误处理

**检查项**:
- [ ] 使用统一的错误码（参考 [error-codes.md](error-codes.md)）
- [ ] 错误消息对用户友好
- [ ] 错误日志记录完整
- [ ] 生产环境不泄露敏感信息

**审查要点**:
```typescript
// ❌ 避免: 错误处理不当
try {
  await doSomething();
} catch (e) {
  console.error(e);
}

// ✅ 好: 完善的错误处理
try {
  await doSomething();
} catch (error) {
  logger.error('Operation failed', {
    operation: 'doSomething',
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  throw new AppError(500, 'OPERATION_FAILED', '操作失败，请稍后重试');
}
```

#### 8. API 设计

**检查项**:
- [ ] RESTful 规范正确
- [ ] 响应格式统一
- [ ] HTTP 状态码使用正确
- [ ] API 文档已更新（Swagger）

**审查要点**:
```typescript
// ✅ 好的 API 响应格式
{
  "success": true,
  "data": { ... }
}

{
  "success": false,
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "项目不存在"
  }
}
```

#### 9. 数据库变更

**检查项**:
- [ ] Prisma schema 语法正确
- [ ] 迁移文件存在
- [ ] 迁移可逆（如可能）
- [ ] 外键关系正确
- [ ] 索引添加合理

**审查要点**:
- 运行 `npx prisma validate` 验证 schema
- 检查迁移对现有数据的影响
- 确认索引策略合理

#### 10. 前端代码

**检查项**:
- [ ] 组件职责单一
- [ ] 使用 TypeScript 类型
- [ ] 使用 StyleSheet 而非内联样式
- [ ] 长列表使用 FlatList
- [ ] 错误状态已处理
- [ ] 加载状态已处理

**审查要点**:
```typescript
// ❌ 避免: 内联样式
<View style={{ flex: 1, padding: 16 }}>

// ✅ 好: 使用 StyleSheet
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

<View style={styles.container}>
```

---

## 审查流程

### 1. 快速检查 (5 分钟)

- 阅读 PR 描述，理解变更目的
- 查看变更的文件列表和行数
- 检查测试是否通过
- 检查是否有明显的代码质量问题

### 2. 详细审查 (15-30 分钟)

- 逐文件审查代码变更
- 检查逻辑正确性
- 验证类型安全
- 检查错误处理
- 检查性能和安全

### 3. 测试验证 (10-15 分钟)

- 本地拉取分支
- 运行测试: `npm test`
- 启动应用验证功能
- 测试边界情况

### 4. 反馈和批准

**提供建设性反馈**:
```markdown
## 总体评价
代码质量良好，功能实现正确。有几个小建议。

## 必须修改 (Blocking)
- [ ] line 42: 需要添加输入验证
- [ ] line 78: 修复 TypeScript 类型错误

## 建议改进 (Non-blocking)
- line 15: 建议提取为单独的函数以提高可读性
- line 56: 可以使用更具描述性的变量名

## 测试
✅ 本地测试通过
✅ 功能验证正确
```

---

## 审查标准

### 必须通过 (Blocking Issues)

以下问题必须修复才能合并:

- TypeScript 编译错误
- 测试失败
- 安全漏洞（SQL 注入、XSS、硬编码密钥）
- 明显的功能错误
- 数据库 schema 错误
- 违反代码规范的严重问题

### 建议改进 (Non-blocking Issues)

以下问题建议修复，但不阻塞合并:

- 命名可以更清晰
- 可以提取重复代码
- 注释可以更详细
- 性能可以进一步优化（非关键路径）

---

## 自审清单

提交 PR 前，作者应先自行检查:

### 代码提交前

- [ ] 运行 `npm run lint` 无错误
- [ ] 运行 `npm test` 全部通过
- [ ] 运行 `npx tsc --noEmit` 无类型错误
- [ ] 删除所有 `console.log` 和调试代码
- [ ] 删除所有注释掉的代码
- [ ] 检查没有遗留 TODO

### PR 创建时

- [ ] PR 标题清晰描述变更
- [ ] PR 描述完整，包含变更原因和方式
- [ ] 关联了相关 Issue
- [ ] 勾选了所有适用的检查项
- [ ] 添加了测试
- [ ] 更新了文档

### 合并前

- [ ] 所有审查意见已处理
- [ ] CI 检查全部通过
- [ ] 至少一位审查者批准
- [ ] 冲突已解决
- [ ] 分支是最新的

---

## 常见审查意见

### 1. 类型安全

**问题**: 使用了 `any` 类型

**反馈**:
```
请避免使用 `any` 类型。建议使用更具体的类型或 `unknown`。

// 建议改为:
function process(data: unknown) {
  if (isValidData(data)) {
    // data 现在是 ValidData 类型
  }
}
```

### 2. 错误处理

**问题**: 捕获错误但未处理

**反馈**:
```
请完善错误处理:
1. 记录错误日志
2. 使用统一的错误码
3. 返回用户友好的错误消息

// 参考: policies/error-codes.md
```

### 3. 性能问题

**问题**: 存在 N+1 查询

**反馈**:
```
发现 N+1 查询问题。建议使用 Prisma 的 include 预加载关联数据:

const posts = await prisma.post.findMany({
  include: { author: true },
});
```

### 4. 测试不足

**问题**: 缺少测试或测试覆盖不足

**反馈**:
```
请添加以下场景的测试:
1. 正常情况
2. 输入验证失败
3. 资源不存在
4. 权限不足 (如适用)
```

---

## 审查最佳实践

### 对于审查者

- **及时审查**: 在 24 小时内提供反馈
- **具体明确**: 指出问题的位置和原因
- **建设性**: 提供改进建议，而非仅指出问题
- **鼓励学习**: 解释为什么某种做法更好
- **区分优先级**: 明确哪些是必须修改的

### 对于作者

- **小而频繁**: 避免巨大的 PR，建议每个 PR < 400 行变更
- **单一目的**: 一个 PR 只做一件事
- **自审先行**: 提交前先自己审查一遍
- **快速响应**: 及时回应审查意见
- **虚心接受**: 将审查视为学习机会

---

遵循此规范可以确保代码质量，促进团队协作，并保持代码库的健康。
