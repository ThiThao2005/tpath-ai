import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Khởi tạo Supabase client với Service Role Key để có quyền ghi dữ liệu
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
)

export async function POST(request: Request) {
  try {
    // 1. Lấy userId từ request body (bạn cần truyền cái này từ frontend lên)
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing User ID" }, { status: 400 })
    }

    // 2. Nội dung roadmap của bạn
    const roadmapText = `
Month 1 - Learn HTML & CSS
Month 2 - JavaScript Basics
Month 3 - React Fundamentals
Month 4 - Build React Project
Month 5 - Learn Node.js
Month 6 - Build Fullstack App
`
    // Tách chuỗi thành mảng các dòng và lọc bỏ dòng trống
    const steps = roadmapText.trim().split("\n")

    // 3. Lưu từng bước vào Database
    // Chúng ta dùng map để tạo mảng object rồi insert một lần cho nhanh
    const { error: insertError } = await supabase
      .from("roadmap_progress")
      .insert(
        steps.map((step) => ({
          user_id: userId,
          skill: "Web Development", // Bạn có thể thay đổi tùy ý
          step: step.trim(),
          completed: false
        }))
      )

    if (insertError) {
      console.error("Insert DB Error:", insertError)
      throw new Error("Ghi vào database thất bại")
    }

    return NextResponse.json({
      roadmap: roadmapText.trim(),
      message: "Lưu roadmap thành công!"
    })

  } catch (err) {
    console.error("ROADMAP ERROR:", err)
    return NextResponse.json(
      { error: "Failed to generate or save roadmap" },
      { status: 500 }
    )
  }
}