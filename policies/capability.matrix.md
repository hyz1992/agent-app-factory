# Agent 能力边界矩阵

此矩阵定义了每个 Agent 在执行流程中被授权读取和写入的目录范围。Sisyphus 在调度阶段时必须告知 Agent 其权限，并在执行完毕后依据此矩阵检查输出路径。越权操作将被视为失败，并按照失败策略处理。

| Agent | 可读取目录 | 可写入目录 | 说明 |
| --- | --- | --- | --- |
| **bootstrap** | 无 | `input/` | 仅在 `input/` 目录创建或修改 `idea.md` |
| **prd** | `input/` | `artifacts/prd/` | 读取想法文件，生成 PRD；禁止写入其他目录 |
| **ui** | `artifacts/prd/` | `artifacts/ui/` | 读取 PRD，生成 UI Schema 与预览 |
| **tech** | `artifacts/prd/` | `artifacts/tech/`, `artifacts/backend/prisma/` | 读取 PRD，生成技术设计和数据模型 |
| **code** | `artifacts/ui/`, `artifacts/tech/`, `artifacts/backend/prisma/` | `artifacts/backend/`, `artifacts/client/` | 根据 UI 和技术设计生成后端和客户端代码；不得修改上游产物 |
| **preview** | `artifacts/backend/`, `artifacts/client/` | `artifacts/preview/` | 读取已生成的服务与客户端，编写演示说明 |

## 越权处理

在阶段完成后，Sisyphus 必须检查输出目录。如果某个 Agent 写入了未在其授权列表中的目录：

1. 调度器应将该文件移动到 `artifacts/_untrusted/<stage-id>/` 目录；
2. 将该事件作为失败记录，并暂停流水线；
3. 报告越权详情，等待人类介入决定是否忽略、调整权限或修改 Agent 行为。

清晰的权限边界有助于防止不同 Agent 之间的职责混淆，保证产物的可追溯性和质量。