# AI 解签

上传日本寺庙签纸图片，AI 帮你解读签文含义。

## 功能特点

- 拍照或上传签纸图片
- 自动识别签文文字（OCR）
- AI 智能解读签文
- 邮箱注册登录
- 历史记录保存
- 移动端优化

## 技术栈

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (认证 + 数据库)
- 百度 OCR API (文字识别)
- Claude API (AI 解读)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入对应的 API Key：

```bash
cp .env.example .env
```

填写以下配置：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Claude API 配置
VITE_CLAUDE_API_KEY=your_claude_api_key_here

# 百度 OCR 配置
VITE_BAIDU_API_KEY=your_baidu_api_key_here
VITE_BAIDU_SECRET_KEY=your_baidu_secret_key_here
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
- 注册账号并创建项目
- 在 Settings > API 中获取 URL 和 anon key

### Claude API
- 访问 [console.anthropic.com](https://console.anthropic.com)
- 创建 API Key

### 百度 OCR
- 访问 [cloud.baidu.com](https://cloud.baidu.com)
- 开通「通用文字识别」服务
- 获取 API Key 和 Secret Key

## 项目结构

```
src/
├── components/       # 公共组件
│   └── ProtectedRoute.tsx
├── contexts/         # 上下文
│   └── AuthContext.tsx
├── lib/              # 工具库
│   └── supabase.ts
├── pages/            # 页面组件
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Upload.tsx
│   ├── Result.tsx
│   └── History.tsx
├── services/         # API 服务
│   ├── ocr.ts
│   ├── ai.ts
│   └── storage.ts
├── types/            # 类型定义
│   └── supabase.ts
└── App.tsx           # 主应用
```

## 部署

项目可以部署到任何支持 Vite 的平台：

- Vercel
- Netlify
- Cloudflare Pages

部署时记得设置环境变量。
