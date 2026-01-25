# 后端骨架模板

以下示例展示一个使用 TypeScript、Express 和 Prisma 的最小后端项目结构。你可以根据 `schema.prisma` 自动生成 Prisma 客户端，并在此基础上扩展 API。

## 目录结构示例

```
├── package.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── index.ts
    ├── routes/
    │   └── receipts.ts
    └── controllers/
        └── receipts.ts
```

## `src/index.ts` 示例

```typescript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 示例路由：获取所有收据
app.get('/api/receipts', async (req, res) => {
  const receipts = await prisma.receipt.findMany();
  res.json(receipts);
});

// 监听端口
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

在实现其他 API 端点时，可参考此模式：从 Prisma 客户端读取或写入数据，再将结果返回给前端。