# CLI 工具设计方案

## 目标

将 Agent Factory 从"项目模板"转变为全局 CLI 工具，用户可以在任意目录下使用。

---

## CLI 命令

### 1. 安装
```bash
npm install -g agent-factory
# 或
npx agent-factory init
```

### 2. 初始化当前目录
```bash
factory init
```

### 3. 启动流水线
```bash
factory run
# 或
factory run bootstrap
factory run prd
```

### 4. 项目管理
```bash
factory list          # 列出所有项目
factory status         # 当前项目状态
factory reset          # 重置当前项目
```

---

## 目录结构

### 全局安装位置（~/.agent-factory/）

```
~/.agent-factory/
├── package.json          # CLI 包本身
├── agents/               # 共享的 Agent 定义
├── skills/               # 共享的 Skill
├── templates/            # 模板文件
├── version               # 工具版本
└── bin/
    └── factory            # CLI 入口
```

### 用户工作目录（初始化后）

```
user/Projects/my-app/
├── .factory/             # 项目配置
│   ├── config.yaml       # 项目配置（项目名、描述等）
│   └── state.json        # 流水线状态
├── agents/               # 符号链接到 ~/.agent-factory/agents/
├── skills/               # 符号链接到 ~/.agent-factory/skills/
├── pipeline/             # 符号链接到 ~/.agent-factory/pipeline/
├── input/idea.md         # 产品想法
├── artifacts/            # 生成的应用
└── .gitignore           # 忽略 .factory/
```

---

## 执行流程

### 1. 安装阶段

```bash
npm install -g agent-factory
```

安装后创建：
- `~/.agent-factory/` 全局目录
- `factory` 命令链接

### 2. 初始化阶段（factory init）

```bash
cd /path/to/my-project
factory init
```

执行：
1. 检查当前目录是否为空（或只有配置文件）
2. 创建 `.factory/` 目录
3. 创建 `.factory/config.yaml`：
   ```yaml
   project:
     name: "my-app"
     description: "我的应用描述"
     created_at: "2024-01-28"
   ```
4. 创建符号链接：
   - `agents/ -> ~/.agent-factory/agents/`
   - `skills/ -> ~/.agent-factory/skills/`
   - `pipeline/ -> ~/.agent-factory/pipeline/`

### 3. 执行阶段（factory run）

AI 助手读取：
1. `.factory/config.yaml` - 项目信息
2. `agents/*.agent.md` - Agent 定义
3. `skills/*.md` - Skill 定义
4. `input/idea.md` - 产品想法
5. 执行流水线，生成 `artifacts/`

---

## AI 助手集成

### Claude Code

**启动方式**：
```bash
# 用户在 Claude Code 中打开项目
factory run
```

**Claude 如何识别**：
- 检测 `agents/` 和 `skills/` 目录存在
- 读取 `.factory/config.yaml` 确认这是一个 Factory 项目

**给 Claude 的提示**（自动显示或用户手动执行）：
```
这是一个 Agent Factory 项目。请阅读以下文件开始：
1. pipeline.yaml - 了解流水线结构
2. agents/orchestrator.checkpoint.md - 了解调度器
3. .factory/config.yaml - 当前项目配置

然后按 pipeline.yaml 定义的阶段开始执行，从
读取 input/idea.md 开始。
```

### Cursor / OpenCode

类似的机制，通过检测目录结构和配置文件识别。

---

## 路径解析逻辑

### Agent 执行时的路径判断

```javascript
// 伪代码
function resolvePaths(projectRoot) {
  const config = loadYaml(`${projectRoot}/.factory/config.yaml`);

  // 如果 config 存在，说明这是工作目录
  if (config) {
    return {
      input: `${projectRoot}/input/idea.md`,
      artifacts: `${projectRoot}/artifacts/`,
      pipeline: `${projectRoot}/pipeline/`,
      agents: `${projectRoot}/agents/`,
      skills: `${projectRoot}/skills/`,
    };
  }

  // 否则，使用根目录（向后兼容）
  return {
    input: `${projectRoot}/input/idea.md`,
    artifacts: `${projectRoot}/artifacts/`,
    pipeline: `${projectRoot}/pipeline/`,
    agents: `${projectRoot}/agents/`,
    skills: `${projectRoot}/skills/`,
  };
}
```

---

## 配置文件

### .factory/config.yaml

```yaml
project:
  name: "智能餐饮推荐"
  description: "帮助用户解决今天吃什么的问题"
  created_at: "2024-01-28T10:00:00Z"
  updated_at: "2024-01-28T10:00:00Z"

pipeline:
  current_stage: "prd"
  completed_stages: ["bootstrap"]
  last_checkpoint: "2024-01-28T10:00:00Z"

settings:
  auto_save: true              # 自动保存进度
  backup_on_error: true         # 出错时自动备份
```

### .factory/state.json

```json
{
  "version": 1,
  "status": "running",
  "current_stage": "prd",
  "completed_stages": ["bootstrap"],
  "started_at": "2024-01-28T10:00:00Z",
  "last_updated": "2024-01-28T10:00:00Z"
}
```

---

## 向后兼容性

保持当前项目模板模式可用：

```bash
# 旧方式：在项目模板中直接执行
cd agent-factory
# 然后 AI 助手读取当前目录
```

```bash
# 新方式：作为 CLI 工具执行
cd my-new-app
factory init
factory run
```

两种方式都支持，新用户推荐使用 CLI 方式。
