# Sisyphus 调度器实现指南

本文档为 Sisyphus 调度器提供具体的实现方案和操作指引，是 [orchestrator.checkpoint.md](orchestrator.checkpoint.md) 的补充文档。

## 核心数据结构

### 状态文件 (.factory/state.json)

```json
{
  "version": "1.0",
  "status": "idle",
  "currentStage": null,
  "completedStages": [],
  "failedStages": [],
  "stageHistory": [
    {
      "stageId": "prd",
      "status": "completed",
      "startTime": "2026-01-25T10:00:00Z",
      "endTime": "2026-01-25T10:15:00Z",
      "attempts": 1,
      "outputs": ["artifacts/prd/prd.md"]
    }
  ],
  "lastCheckpoint": "prd",
  "createdAt": "2026-01-25T09:00:00Z",
  "updatedAt": "2026-01-25T10:15:00Z"
}
```

**字段说明**:
- `status`: 流水线状态 (`idle` | `running` | `waiting_for_confirmation` | `paused` | `failed`)
- `currentStage`: 当前正在执行的 Stage ID
- `completedStages`: 已完成的 Stage ID 列表
- `failedStages`: 失败的 Stage ID 列表
- `stageHistory`: 每个 Stage 的执行历史
- `lastCheckpoint`: 最后一个成功的检查点
- `attempts`: Stage 尝试次数（用于失败重试控制）

### 状态机定义

```
┌─────────────────────────────────────────────────────────────┐
│                         State Machine                        │
└─────────────────────────────────────────────────────────────┘

         ┌──────┐
    ┌───│ idle │◄────────────────────┐
    │   └──────┘                      │
    │                                 │
    │ start_pipeline()                │ reset()
    │                                 │
    ▼                                 │
┌──────────┐                    ┌─────────┐
│ running  │───────────────────►│ failed  │
└──────────┘  validation_failed └─────────┘
    │                                 ▲
    │ stage_completed()               │
    │                                 │
    ▼                                 │
┌───────────────────────┐             │
│ waiting_for_confirmation│────────────┤
└───────────────────────┘  retry_failed│
    │              │                   │
    │              └──────────────┐    │
    │ confirm()    pause()        │    │
    │                             │    │
    ▼                             ▼    │
┌──────────┐                  ┌────────┐
│ running  │                  │ paused │
└──────────┘                  └────────┘
                                   │
                                   │ resume()
                                   │
                                   ▼
                              ┌──────────┐
                              │ running  │
                              └──────────┘
```

## 执行流程实现

### 1. 初始化流水线

```typescript
function initPipeline(): void {
  // 检查 .factory/state.json 是否存在
  if (!exists('.factory/state.json')) {
    // 创建初始状态文件
    writeStateFile({
      version: "1.0",
      status: "idle",
      currentStage: null,
      completedStages: [],
      failedStages: [],
      stageHistory: [],
      lastCheckpoint: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 读取 .factory/pipeline.yaml
  const pipeline = readYaml('.factory/pipeline.yaml');

  // 验证 pipeline 结构
  validatePipeline(pipeline);

  console.log('Pipeline initialized successfully');
}
```

### 2. 执行单个 Stage

```typescript
async function executeStage(stageConfig: Stage): Promise<StageResult> {
  const startTime = new Date().toISOString();

  // 1. 更新状态为 running
  updateState({
    status: 'running',
    currentStage: stageConfig.id
  });

  // 2. 验证输入文件存在
  const inputsExist = verifyInputs(stageConfig.inputs);
  if (!inputsExist) {
    throw new Error(`Stage ${stageConfig.id}: Required inputs missing`);
  }

  // 3. 检查权限矩阵
  const permissions = getPermissions(stageConfig.id);
  logPermissions(stageConfig.id, permissions);

  // 4. 调用 Agent
  console.log(`\n=== Executing Stage: ${stageConfig.id} ===`);
  console.log(`Description: ${stageConfig.description}`);
  console.log(`Agent: ${stageConfig.agent}`);
  console.log(`Inputs: ${stageConfig.inputs.join(', ')}`);
  console.log(`Expected Outputs: ${stageConfig.outputs.join(', ')}`);

  // 读取 Agent 定义
  const agentContent = readFile(stageConfig.agent);

  // 执行 Agent (这里需要调用 LLM API 或子进程)
  const agentResult = await invokeAgent({
    agentDefinition: agentContent,
    inputs: stageConfig.inputs,
    outputs: stageConfig.outputs,
    stageId: stageConfig.id
  });

  // 5. 验证输出
  const outputsValid = verifyOutputs(stageConfig.outputs);
  if (!outputsValid) {
    throw new Error(`Stage ${stageConfig.id}: Required outputs missing`);
  }

  // 6. 验证退出条件
  const exitCriteriaMet = verifyExitCriteria(stageConfig.exit_criteria, stageConfig.outputs);
  if (!exitCriteriaMet) {
    throw new Error(`Stage ${stageConfig.id}: Exit criteria not met`);
  }

  // 7. 权限检查：验证 Agent 没有越权写入
  const unauthorizedWrites = checkUnauthorizedWrites(stageConfig.id, permissions);
  if (unauthorizedWrites.length > 0) {
    handleUnauthorizedWrites(stageConfig.id, unauthorizedWrites);
    throw new Error(`Stage ${stageConfig.id}: Unauthorized file writes detected`);
  }

  // 8. 记录执行历史
  const endTime = new Date().toISOString();
  recordStageHistory({
    stageId: stageConfig.id,
    status: 'completed',
    startTime,
    endTime,
    attempts: 1,
    outputs: stageConfig.outputs
  });

  return {
    success: true,
    stageId: stageConfig.id,
    outputs: stageConfig.outputs
  };
}
```

### 3. 检查点确认机制

```typescript
async function waitForCheckpointConfirmation(stageId: string, outputs: string[]): Promise<CheckpointAction> {
  // 更新状态为等待确认
  updateState({
    status: 'waiting_for_confirmation',
    currentStage: stageId
  });

  // 向用户展示产物
  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║  Checkpoint: Stage "${stageId}" completed successfully    ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);
  console.log(`\nGenerated outputs:`);
  outputs.forEach(file => {
    console.log(`  ✓ ${file}`);
    // 可选：显示文件摘要
    displayFileSummary(file);
  });

  console.log(`\nOptions:`);
  console.log(`  1. Continue to next stage`);
  console.log(`  2. Retry this stage`);
  console.log(`  3. Pause pipeline`);
  console.log(`  4. Abort pipeline`);

  // 等待用户输入
  const choice = await getUserInput('Your choice (1-4): ');

  switch (choice) {
    case '1':
      return { action: 'continue' };
    case '2':
      return { action: 'retry' };
    case '3':
      updateState({ status: 'paused' });
      return { action: 'pause' };
    case '4':
      return { action: 'abort' };
    default:
      console.log('Invalid choice, defaulting to continue');
      return { action: 'continue' };
  }
}
```

### 4. 失败处理实现

```typescript
async function handleStageFailure(
  stageConfig: Stage,
  error: Error,
  attemptNumber: number
): Promise<FailureAction> {
  console.error(`\n❌ Stage "${stageConfig.id}" failed:`);
  console.error(`   Error: ${error.message}`);
  console.error(`   Attempt: ${attemptNumber}`);

  // 读取失败策略
  const failurePolicy = readFile('policies/failure.policy.md');

  // 移动失败产物
  const failedDir = `artifacts/_failed/${stageConfig.id}/attempt-${attemptNumber}`;
  moveFailedArtifacts(stageConfig.outputs, failedDir);

  // 记录失败历史
  recordStageHistory({
    stageId: stageConfig.id,
    status: 'failed',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    attempts: attemptNumber,
    error: error.message
  });

  // 判断是否可以重试
  if (attemptNumber < 2) {
    console.log(`\n⚠️  Attempting automatic retry (${attemptNumber}/1)...`);
    return { action: 'retry', attemptNumber: attemptNumber + 1 };
  }

  // 连续失败两次，暂停流水线
  console.log(`\n⛔ Stage failed twice. Pipeline paused for manual intervention.`);
  console.log(`\nFailed artifacts moved to: ${failedDir}`);
  console.log(`\nPlease:`);
  console.log(`  1. Review the error message and logs`);
  console.log(`  2. Check ${failedDir} for failed outputs`);
  console.log(`  3. Fix the issue (update inputs, agent, or skills)`);
  console.log(`  4. Resume the pipeline when ready`);

  updateState({
    status: 'failed',
    currentStage: stageConfig.id
  });

  return { action: 'pause_for_intervention' };
}
```

### 5. 权限验证实现

```typescript
function checkUnauthorizedWrites(stageId: string, permissions: Permissions): string[] {
  const capabilityMatrix = readCapabilityMatrix();
  const allowedWritePaths = capabilityMatrix[stageId]?.write || [];

  // 扫描文件系统，找出所有新创建或修改的文件
  const modifiedFiles = getModifiedFiles();

  const unauthorized: string[] = [];

  for (const file of modifiedFiles) {
    const isAuthorized = allowedWritePaths.some(pattern => {
      return matchPath(file, pattern);
    });

    if (!isAuthorized) {
      unauthorized.push(file);
    }
  }

  return unauthorized;
}

function handleUnauthorizedWrites(stageId: string, files: string[]): void {
  const untrustedDir = `artifacts/_untrusted/${stageId}`;

  console.warn(`\n⚠️  Unauthorized writes detected for stage "${stageId}":`);
  files.forEach(file => console.warn(`   - ${file}`));

  // 移动到隔离目录
  moveFiles(files, untrustedDir);

  console.warn(`\nFiles moved to quarantine: ${untrustedDir}`);
  console.warn(`Please review these files before proceeding.`);
}
```

## 主执行循环

```typescript
async function runPipeline(): Promise<void> {
  // 1. 初始化
  initPipeline();

  // 2. 读取 pipeline 配置
  const pipeline = readYaml('.factory/pipeline.yaml');
  const stages = pipeline.stages;

  // 3. 读取当前状态
  const state = readStateFile();

  // 4. 确定起始位置
  const startIndex = state.completedStages.length;

  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║         AI App Factory - Checkpoint Pipeline            ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);
  console.log(`\nPipeline: ${pipeline.pipeline.name}`);
  console.log(`Mode: ${pipeline.pipeline.mode}`);
  console.log(`Total stages: ${stages.length}`);
  console.log(`Completed stages: ${state.completedStages.length}`);
  console.log(`Starting from: ${stages[startIndex]?.id || 'end'}`);

  // 5. 执行各个 Stage
  for (let i = startIndex; i < stages.length; i++) {
    const stage = stages[i];
    let attemptNumber = 1;
    let stageCompleted = false;

    while (!stageCompleted) {
      try {
        // 执行 Stage
        const result = await executeStage(stage);

        // 添加到已完成列表
        updateState({
          completedStages: [...state.completedStages, stage.id],
          lastCheckpoint: stage.id
        });

        // 检查点确认
        const checkpointAction = await waitForCheckpointConfirmation(stage.id, result.outputs);

        if (checkpointAction.action === 'continue') {
          stageCompleted = true;
        } else if (checkpointAction.action === 'retry') {
          attemptNumber++;
          continue;
        } else if (checkpointAction.action === 'pause') {
          console.log('\n⏸️  Pipeline paused by user.');
          return;
        } else if (checkpointAction.action === 'abort') {
          console.log('\n🛑 Pipeline aborted by user.');
          updateState({ status: 'idle' });
          return;
        }

      } catch (error) {
        // 处理失败
        const failureAction = await handleStageFailure(stage, error as Error, attemptNumber);

        if (failureAction.action === 'retry') {
          attemptNumber = failureAction.attemptNumber;
          continue;
        } else if (failureAction.action === 'pause_for_intervention') {
          return;
        }
      }
    }
  }

  // 6. 全部完成
  updateState({
    status: 'idle',
    currentStage: null
  });

  console.log(`\n╔═══════════════════════════════════════════════════════════╗`);
  console.log(`║          🎉 Pipeline completed successfully! 🎉          ║`);
  console.log(`╚═══════════════════════════════════════════════════════════╝`);
  console.log(`\nAll stages completed. Check artifacts/ for generated outputs.`);
}
```

## 工具函数

### 权限矩阵读取

```typescript
interface Permissions {
  read: string[];
  write: string[];
}

function getPermissions(stageId: string): Permissions {
  const matrixContent = readFile('policies/capability.matrix.md');

  // 解析矩阵表格，提取该 Stage 的权限
  // 这里需要实现 Markdown 表格解析逻辑

  // 示例返回值
  const permissionsMap: Record<string, Permissions> = {
    'bootstrap': {
      read: [],
      write: ['input/']
    },
    'prd': {
      read: ['input/'],
      write: ['artifacts/prd/']
    },
    'ui': {
      read: ['artifacts/prd/'],
      write: ['artifacts/ui/']
    },
    'tech': {
      read: ['artifacts/prd/'],
      write: ['artifacts/tech/', 'artifacts/backend/prisma/']
    },
    'code': {
      read: ['artifacts/ui/', 'artifacts/tech/', 'artifacts/backend/prisma/'],
      write: ['artifacts/backend/', 'artifacts/client/']
    },
    'validation': {
      read: ['artifacts/backend/', 'artifacts/client/'],
      write: ['artifacts/validation/']
    },
    'preview': {
      read: ['artifacts/backend/', 'artifacts/client/'],
      write: ['artifacts/preview/']
    }
  };

  return permissionsMap[stageId] || { read: [], write: [] };
}
```

### 退出条件验证

```typescript
function verifyExitCriteria(criteria: string[], outputs: string[]): boolean {
  console.log('\nVerifying exit criteria:');

  let allMet = true;

  for (const criterion of criteria) {
    const result = evaluateCriterion(criterion, outputs);
    const status = result ? '✓' : '✗';
    console.log(`  ${status} ${criterion}`);

    if (!result) {
      allMet = false;
    }
  }

  return allMet;
}

function evaluateCriterion(criterion: string, outputs: string[]): boolean {
  // 简单的规则引擎实现
  // 示例规则：
  // - "prd.md 存在" → 检查文件是否存在
  // - "prd.md 包含目标用户" → 检查文件内容是否包含特定关键词
  // - "页面数量不超过 3" → 解析文件并验证

  if (criterion.includes('存在')) {
    const filename = criterion.split(' ')[0];
    const filepath = outputs.find(o => o.endsWith(filename));
    return filepath ? fileExists(filepath) : false;
  }

  if (criterion.includes('包含')) {
    const [file, keyword] = criterion.split(' 包含 ');
    const filepath = outputs.find(o => o.includes(file));
    if (!filepath) return false;
    const content = readFile(filepath);
    return content.includes(keyword);
  }

  // 更多规则...

  return true; // 默认通过
}
```

## 使用示例

### 启动流水线

```bash
# 初始化并运行
node orchestrator.js run

# 从失败点恢复
node orchestrator.js resume

# 重置流水线
node orchestrator.js reset

# 查看状态
node orchestrator.js status
```

### 状态查询输出示例

```
Pipeline Status
═══════════════════════════════════════════════════════════

Status: waiting_for_confirmation
Current Stage: prd
Last Checkpoint: bootstrap

Completed Stages:
  ✓ bootstrap (2026-01-25 10:00:00)

Pending Stages:
  ○ prd (in progress)
  ○ ui
  ○ tech
  ○ code
  ○ validation
  ○ preview

═══════════════════════════════════════════════════════════
```

## 调试和日志

### 日志级别

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

function log(level: LogLevel, message: string, context?: any): void {
  const timestamp = new Date().toISOString();
  const levelStr = LogLevel[level];

  console.log(`[${timestamp}] [${levelStr}] ${message}`);

  if (context && process.env.DEBUG) {
    console.log(JSON.stringify(context, null, 2));
  }

  // 写入日志文件
  appendToFile('pipeline/pipeline.log', `[${timestamp}] [${levelStr}] ${message}\n`);
}
```

### 执行日志示例

```
[2026-01-25T10:00:00Z] [INFO] Pipeline initialized
[2026-01-25T10:00:01Z] [INFO] Executing stage: bootstrap
[2026-01-25T10:00:01Z] [DEBUG] Reading agent definition: agents/bootstrap.agent.md
[2026-01-25T10:00:02Z] [DEBUG] Permissions - Read: [], Write: [input/]
[2026-01-25T10:00:10Z] [INFO] Stage bootstrap completed successfully
[2026-01-25T10:00:10Z] [INFO] Outputs: input/idea.md
[2026-01-25T10:00:10Z] [INFO] Waiting for checkpoint confirmation
```

## 错误处理最佳实践

1. **明确的错误消息**: 包含 Stage ID、错误类型、具体原因
2. **保存失败产物**: 便于调试和回溯
3. **提供修复建议**: 告诉用户如何解决问题
4. **保留执行历史**: 记录每次尝试的详细信息
5. **安全的回滚**: 确保回滚不会破坏已完成的产物

## 扩展点

未来可以增强的功能：

- **并行执行**: 支持无依赖的 Stage 并行运行
- **条件分支**: 根据条件跳过某些 Stage
- **动态 Stage**: 根据上游输出动态生成 Stage
- **远程执行**: 支持分布式 Agent 执行
- **可视化界面**: Web UI 展示流水线状态
- **通知机制**: 邮件/Slack 通知关键事件
