# 御签

上传日本寺庙签纸图片，AI 智能解读运势。

## 功能特点

- 拍照或上传签纸图片
- 自动识别签文文字（使用智谱视觉 API）
- AI 智能解读签文
- 邮箱注册登录（Supabase Auth）
- 历史记录保存
- 每日调用次数限制（5次/天）
- 移动端 UI 优化
- 日式风格设计

## 调用次数限制

- 每天最多 5 次解读
- 每分钟最多 1 次请求
- 使用 localStorage 本地存储
- 第二天自动重置计数

## 技术栈

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (认证 + 数据库)
- 智谱 API (视觉识别 + 文本解读)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入对应的 API Key：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 智谱 API 配置
VITE_ZHIPU_API_KEY=your_zhipu_api_key_here
```

### 3. 配置 Supabase

#### 创建项目

1. 访问 [supabase.com](https://supabase.com) 创建免费账号
2. 创建新项目

#### 启用邮箱认证

在 Supabase Dashboard 中：
- 进入 Authentication > Providers
- 启用 Email provider

#### 创建数据库表

在 Supabase SQL Editor 中执行：

```sql
-- 创建 signs 表
CREATE TABLE signs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  ocr_text TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  temple_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_signs_user_id ON signs(user_id);
CREATE INDEX idx_signs_created_at ON signs(created_at DESC);

-- 启用 RLS (Row Level Security)
ALTER TABLE signs ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的记录
CREATE POLICY "Users can view own signs" ON signs
  FOR SELECT USING (auth.uid() = user_id);

-- 创建策略：用户可以插入自己的记录
CREATE POLICY "Users can insert own signs" ON signs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户可以删除自己的记录
CREATE POLICY "Users can delete own signs" ON signs
  FOR DELETE USING (auth.uid() = user_id);
```

#### 创建 Storage Bucket

在 Supabase Dashboard 中：
- 进入 Storage
- 创建名为 `signs` 的 bucket
- 设置为 Public（公开访问）
- 添加 RLS policy 允许用户上传自己的图片

```sql
-- Storage policies
INSERT INTO storage.policies (
  name,
  definition,
  bucket_id
)
VALUES (
  'Users can upload own signs',
  'auth.uid()::text = (storage.foldername(name))[1]',
  'signs'
);
```

### 4. 运行项目

```bash
npm run dev
```

访问 http://localhost:5173

## API Key 获取方式

### Supabase

1. 访问 [supabase.com](https://supabase.com) 创建免费账号
2. 创建项目
3. 在 Settings > API 中获取 URL 和 anon key

### 智谱 API

1. 访问 [open.bigmodel.cn](https://open.bigmodel.cn)
2. 登录或注册账号
3. 创建 API Key

## 本地网络访问

在手机上访问本地开发服务器：

1. 段保电脑和手机连接同一个 WiFi
2. 获取电脑 IP 地址：
```bash
ifconfig | grep -A 1 "en0" | grep "inet " | awk '{print $2}'
```
3. 在手机浏览器中访问：`http://你的IP:5173`

## 部署到 Vercel

### 方法 1：通过 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm i -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署：
```bash
vercel
```

### 方法 2：通过 Vercel Dashboard

1. 访问 [vercel.com](https://vercel.com)
2. 导入你的 GitHub 仓库或直接上传项目
3. 在项目设置中配置环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ZHIPU_API_KEY`
4. 点击 Deploy

### 环境变量

在 Vercel 中设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | Supabase URL | 从 Supabase Dashboard 获取 |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | 从 Supabase Dashboard 获取 |
| `VITE_ZHIPU_API_KEY` | 智谱 API Key | 从智谱控制台获取 |

## 项目结构

```
src/
├── components/       # 公共组件
│   ├── ProtectedRoute.tsx
│   └── JapaneseDecorations.tsx
├── contexts/         # 上下文
│   └── AuthContext.tsx
├── hooks/            # 自定义 hooks
│   └── useRateLimit.ts
├── lib/              # 工具库
│   └── supabase.ts
├── pages/            # 页面组件
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Upload.tsx
│   ├── Result.tsx
│   └── History.tsx
├── services/         # API 服务
│   ├── ai.ts
│   └── storage.ts
├── types/            # 类型定义
│   └── supabase.ts
└── App.tsx           # 主应用
```

## License

MIT
