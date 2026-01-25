# 前端骨架模板

以下示例展示一个使用 React Native 和 Expo 的简单项目结构，以及如何调用后端 API。你可以根据 UI Schema 扩展页面和组件。

## 目录结构示例

```
├── App.js
├── screens/
│   ├── HomeScreen.js
│   └── ReceiptScreen.js
└── api/
    └── receipts.js
```

## `api/receipts.js` 示例

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const getReceipts = async () => {
  const response = await axios.get(`${API_BASE_URL}/receipts`);
  return response.data;
};
```

## `screens/HomeScreen.js` 示例

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getReceipts } from '../api/receipts';

export default function HomeScreen() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    getReceipts().then(setReceipts).catch(console.error);
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>最近收据</Text>
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text>{item.title} - {item.amount}</Text>
        )}
      />
    </View>
  );
}
```

这个骨架演示了如何在页面挂载时调用后端 API 并展示数据。根据你的 UI Schema，你可以新增页面和组件，并调用相应 API 函数。