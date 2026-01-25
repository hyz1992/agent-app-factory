# 前端骨架模板

本模板提供使用 React Native + Expo + TypeScript 的生产就绪移动应用项目结构。请完整阅读后根据你的 UI Schema 进行调整。

## 目录结构

```
client/
├── package.json
├── tsconfig.json
├── app.json
├── babel.config.js
├── .env.example
├── .gitignore
├── README.md
├── App.tsx                   # 应用入口
├── src/
│   ├── config/
│   │   └── index.ts          # 环境变量配置
│   ├── api/
│   │   ├── client.ts         # API 客户端
│   │   └── [resource].ts     # 资源 API
│   ├── hooks/
│   │   ├── useApi.ts         # 通用 API Hook
│   │   └── [resource].ts     # 资源 Hook
│   ├── contexts/
│   │   └── AppContext.tsx    # 全局状态
│   ├── navigation/
│   │   └── index.tsx         # 导航配置
│   ├── screens/
│   │   └── [Screen].tsx      # 页面组件
│   ├── components/
│   │   ├── ui/               # 通用 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   └── [Feature]/        # 功能组件
│   ├── styles/
│   │   ├── theme.ts          # 主题定义
│   │   └── common.ts         # 通用样式
│   ├── types/
│   │   └── index.ts          # 类型定义
│   └── utils/
│       └── index.ts          # 工具函数
└── assets/
    └── images/
```

## package.json

```json
{
  "name": "client",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-status-bar": "~1.11.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-safe-area-context": "4.8.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "react-native-screens": "~3.29.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.54.0",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  }
}
```

## tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@api/*": ["src/api/*"],
      "@hooks/*": ["src/hooks/*"],
      "@styles/*": ["src/styles/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## babel.config.js

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@api': './src/api',
            '@hooks': './src/hooks',
            '@styles': './src/styles',
            '@types': './src/types',
          },
        },
      ],
    ],
  };
};
```

## app.json

```json
{
  "expo": {
    "name": "MyApp",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## .env.example

```bash
# API 配置
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# 开发配置
EXPO_PUBLIC_DEBUG=true
```

## .gitignore

```
node_modules/
.expo/
dist/
*.log
.env
```

## src/config/index.ts

```typescript
export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  debug: process.env.EXPO_PUBLIC_DEBUG === 'true',
};
```

## src/styles/theme.ts

```typescript
export const theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      inverse: '#ffffff',
    },
    border: '#e2e8f0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type Theme = typeof theme;
```

## src/styles/common.ts

```typescript
import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  padding: {
    padding: theme.spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: theme.spacing.md,
  },
  marginBottom: {
    marginBottom: theme.spacing.md,
  },
});
```

## src/types/index.ts

```typescript
// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

// 通用实体类型示例
export interface Item {
  id: number;
  title: string;
  description?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

// 创建/更新输入类型
export interface CreateItemInput {
  title: string;
  description?: string;
  amount: number;
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  amount?: number;
}
```

## src/api/client.ts

```typescript
import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '../config';
import { ApiResponse } from '../types';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        if (__DEV__) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (__DEV__) {
          console.error('[API Error]', error.response?.data || error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.instance.get<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.post<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.put<ApiResponse<T>>(url, data);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.instance.delete<ApiResponse<T>>(url);
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Request failed');
    }
    return response.data.data!;
  }
}

export const apiClient = new ApiClient();
```

## src/api/items.ts (资源 API 示例)

```typescript
import { apiClient } from './client';
import { Item, CreateItemInput, UpdateItemInput } from '../types';

export const itemsApi = {
  getAll: () => apiClient.get<Item[]>('/items'),

  getById: (id: number) => apiClient.get<Item>(`/items/${id}`),

  create: (data: CreateItemInput) => apiClient.post<Item>('/items', data),

  update: (id: number, data: UpdateItemInput) =>
    apiClient.put<Item>(`/items/${id}`, data),

  delete: (id: number) => apiClient.delete<{ deleted: boolean }>(`/items/${id}`),
};
```

## src/hooks/useApi.ts

```typescript
import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

export function useApi<T>(apiFunction: () => Promise<T>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await apiFunction();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setState({ data: null, loading: false, error: message });
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
```

## src/hooks/useItems.ts (资源 Hook 示例)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { itemsApi } from '../api/items';
import { Item, CreateItemInput, UpdateItemInput } from '../types';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsApi.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(async (input: CreateItemInput) => {
    const newItem = await itemsApi.create(input);
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback(async (id: number, input: UpdateItemInput) => {
    const updatedItem = await itemsApi.update(id, input);
    setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    return updatedItem;
  }, []);

  const deleteItem = useCallback(async (id: number) => {
    await itemsApi.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refresh: fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
}
```

## src/contexts/AppContext.tsx

```typescript
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  // 全局状态
  isLoading: boolean;
  errorMessage: string | null;
}

interface AppContextValue extends AppState {
  setLoading: (loading: boolean) => void;
  setError: (message: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const value: AppContextValue = {
    isLoading,
    errorMessage,
    setLoading: setIsLoading,
    setError: setErrorMessage,
    clearError: () => setErrorMessage(null),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

## src/components/ui/Button.tsx

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../styles/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'outline' ? styles.outlineText : styles.filledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.colors.primary : '#fff'}
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  filledText: {
    color: theme.colors.text.inverse,
  },
  outlineText: {
    color: theme.colors.primary,
  },
});
```

## src/components/ui/Input.tsx

```typescript
import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { theme } from '../../styles/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={theme.colors.text.secondary}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    fontSize: theme.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background,
    minHeight: 48,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
```

## src/components/ui/Card.tsx

```typescript
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../styles/theme';

interface CardProps extends ViewProps {
  children: ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

## src/components/ui/Loading.tsx

```typescript
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message, fullScreen = false }: LoadingProps) {
  const content = (
    <>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
  },
});
```

## src/components/ui/ErrorMessage.tsx

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';
import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button title="重试" onPress={onRetry} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  message: {
    fontSize: theme.fontSize.base,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  button: {
    minWidth: 120,
  },
});
```

## src/navigation/index.tsx

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../styles/theme';

// 导入页面
import { HomeScreen } from '../screens/HomeScreen';
import { DetailScreen } from '../screens/DetailScreen';

// 定义导航参数类型
export type RootStackParamList = {
  Home: undefined;
  Detail: { id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: theme.colors.text.inverse,
          headerTitleStyle: {
            fontWeight: theme.fontWeight.semibold,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '首页' }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: '详情' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## src/screens/HomeScreen.tsx (页面示例)

```typescript
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useItems } from '../hooks/useItems';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { theme } from '../styles/theme';
import { Item } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { items, loading, error, refresh } = useItems();

  const handleItemPress = (item: Item) => {
    navigation.navigate('Detail', { id: item.id });
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <Card style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
        <Text style={styles.amount}>¥{item.amount.toFixed(2)}</Text>
      </Card>
    </TouchableOpacity>
  );

  if (loading && items.length === 0) {
    return <Loading fullScreen message="加载中..." />;
  }

  if (error && items.length === 0) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无数据</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  list: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  amount: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  empty: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
  },
});
```

## src/screens/DetailScreen.tsx (详情页示例)

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { itemsApi } from '../api/items';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { theme } from '../styles/theme';
import { Item } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export function DetailScreen({ route }: Props) {
  const { id } = route.params;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await itemsApi.getById(id);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error || !item) {
    return <ErrorMessage message={error || 'Item not found'} onRetry={fetchItem} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.title}>{item.title}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>金额</Text>
            <Text style={styles.amount}>¥{item.amount.toFixed(2)}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              创建于 {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  amountLabel: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text.secondary,
  },
  amount: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  meta: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});
```

## App.tsx

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppContext';
import { Navigation } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Navigation />
        <StatusBar style="light" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
```

## README.md (前端)

```markdown
# Client

基于 React Native + Expo + TypeScript 的移动应用。

## 快速开始

1. 安装依赖
   ```bash
   npm install
   ```

2. 配置环境变量
   ```bash
   cp .env.example .env
   # 修改 .env 中的 API 地址
   ```

3. 启动开发服务器
   ```bash
   npm start
   ```

4. 在设备上运行
   - iOS: 按 `i` 或使用 Expo Go 扫描二维码
   - Android: 按 `a` 或使用 Expo Go 扫描二维码
   - Web: 按 `w` 在浏览器中打开

## 可用脚本

- `npm start` - 启动 Expo 开发服务器
- `npm run android` - 在 Android 模拟器/设备上运行
- `npm run ios` - 在 iOS 模拟器上运行
- `npm run web` - 在 Web 浏览器中运行
- `npm run lint` - 代码检查
- `npm run typecheck` - TypeScript 类型检查

## 项目结构

- `src/api/` - API 调用封装
- `src/components/` - 可复用组件
- `src/contexts/` - React Context 状态管理
- `src/hooks/` - 自定义 Hooks
- `src/navigation/` - 导航配置
- `src/screens/` - 页面组件
- `src/styles/` - 主题和通用样式
- `src/types/` - TypeScript 类型定义

## 添加新页面

1. 在 `src/screens/` 创建新页面组件
2. 在 `src/navigation/index.tsx` 添加路由
3. 更新 `RootStackParamList` 类型定义

## 添加新 API

1. 在 `src/types/` 定义数据类型
2. 在 `src/api/` 创建 API 调用函数
3. 在 `src/hooks/` 创建自定义 Hook（可选）
```

---

## 使用指南

1. **根据 UI Schema 创建页面组件** (`src/screens/`)
2. **根据后端 API 创建对应的**:
   - `types/index.ts` - 数据类型
   - `api/[resource].ts` - API 调用
   - `hooks/use[Resource].ts` - 数据 Hook
3. **在 `navigation/index.tsx` 中配置路由**
4. **根据设计修改 `styles/theme.ts` 主题配置**
5. **复用 `components/ui/` 中的基础组件**

## 关键约束

- **所有 API 调用必须通过 `api/client.ts`**
- **所有页面必须处理 Loading 和 Error 状态**
- **使用 `SafeAreaView` 处理异形屏**
- **使用 theme 中的设计变量,不要硬编码颜色和间距**
- **所有列表必须支持下拉刷新**
- **网络错误必须提供重试选项**
