import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 调试信息
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseAnonKey ? 'Loaded' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 配置缺失，请检查 .env 文件')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
