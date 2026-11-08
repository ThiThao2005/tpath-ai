import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// Hỗ trợ cả key kiểu mới (publishable) và kiểu cũ (anon)
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Thiếu cấu hình Supabase: hãy tạo file .env.local với NEXT_PUBLIC_SUPABASE_URL và ' +
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY), rồi khởi động lại `npm run dev`.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)
