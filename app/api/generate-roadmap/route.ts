import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { supabaseUrl, supabaseKey } from "@/lib/supabase"

// KHÔNG tin userId từ client: luôn lấy user từ access token trong header.
// Client được tạo "thay mặt" user (gắn token), nên RLS trên Supabase vẫn áp dụng.
function clientForUser(token: string) {
  return createClient(supabaseUrl!, supabaseKey!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const ROADMAP_STEPS = [
  "Month 1 - Learn HTML & CSS",
  "Month 2 - JavaScript Basics",
  "Month 3 - React Fundamentals",
  "Month 4 - Build React Project",
  "Month 5 - Learn Node.js",
  "Month 6 - Build Fullstack App",
]

export async function POST(request: Request) {
  try {
    // 1. Xác thực người dùng bằng access token
    const authHeader = request.headers.get("authorization") ?? ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = clientForUser(token)
    const { data: userData, error: authError } = await db.auth.getUser(token)
    if (authError || !userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = userData.user.id

    // 2. Xóa roadmap cũ để "Làm mới" không bị trùng bước
    const { error: deleteError } = await db
      .from("roadmap_progress")
      .delete()
      .eq("user_id", userId)

    if (deleteError) {
      console.error("Delete DB Error:", deleteError)
      throw new Error("Không xóa được roadmap cũ")
    }

    // 3. Lưu các bước mới
    // Mỗi bước cách nhau 1 giây để sắp xếp theo created_at luôn đúng thứ tự
    const base = Date.now()
    const { error: insertError } = await db
      .from("roadmap_progress")
      .insert(
        ROADMAP_STEPS.map((step, i) => ({
          user_id: userId,
          skill: "Web Development",
          step,
          completed: false,
          created_at: new Date(base + i * 1000).toISOString(),
        }))
      )

    if (insertError) {
      console.error("Insert DB Error:", insertError)
      throw new Error("Ghi vào database thất bại")
    }

    return NextResponse.json({
      roadmap: ROADMAP_STEPS.join("\n"),
      message: "Lưu roadmap thành công!",
    })
  } catch (err) {
    console.error("ROADMAP ERROR:", err)
    return NextResponse.json(
      { error: "Failed to generate or save roadmap" },
      { status: 500 }
    )
  }
}
