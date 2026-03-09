"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// --- 4. UI Progress Bar Component ---
// Đặt ở ngoài để code chính bên dưới gọn gàng hơn
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
      <div
        className="bg-green-500 h-4 rounded-full transition-all duration-500 shadow-sm"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default function RoadmapPage() {
  const [roadmapSteps, setRoadmapSteps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 1. Hàm Load Roadmap từ Database
  const loadProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("roadmap_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (error) console.error("Error loading progress:", error)
    if (data) setRoadmapSteps(data)
  }

  // Chạy load dữ liệu ngay khi trang web khởi động
  useEffect(() => {
    loadProgress()
  }, [])

  // 2. Logic tính toán phần trăm
  const completedCount = roadmapSteps.filter(d => d.completed).length
  const total = roadmapSteps.length
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0

  // 3. Hàm tạo Roadmap mới qua API
  const generateRoadmap = async () => {
    try {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        alert("Vui lòng đăng nhập!")
        return
      }

      // Lấy kết quả quiz để gửi cho AI (nếu có)
      const { data: quizData } = await supabase
        .from("quiz_results")
        .select("*")
        .eq("user_id", user.id)
        .single()

      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          frontend: quizData?.frontend || 0,
          backend: quizData?.backend || 0,
          ai: quizData?.ai || 0
        
        })
      })

      if (!res.ok) throw new Error("API error")
      
      // Sau khi API tạo xong và lưu vào DB, ta tải lại dữ liệu mới nhất
      await loadProgress()

    } catch (err) {
      console.error(err)
      alert("Không tạo được lộ trình học tập")
    } finally {
      setLoading(false)
    }
  }

  // --- 5. Hàm đánh dấu "đã học xong" ---
  async function markDone(id: string) {
    const { error } = await supabase
      .from("roadmap_progress")
      .update({ completed: true })
      .eq("id", id)

    if (error) {
      console.error("Lỗi cập nhật:", error)
    } else {
      // Gọi lại loadProgress để đồng bộ lại thanh phần trăm và danh sách
      loadProgress()
    }
  }

  return (
    <div className="p-10 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-2">AI Learning Roadmap</h1>
      <p className="text-gray-500 mb-8">Lộ trình được thiết kế riêng cho năng lực của bạn</p>

      {/* Sử dụng Component ProgressBar đã tạo ở mục số 4 */}
      <div className="mb-10 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Tiến độ của bạn</span>
          <span className="text-sm font-bold text-green-600">{percent}% completed</span>
        </div>
        <ProgressBar percent={percent} />
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={generateRoadmap}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-md disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Đang tạo lộ trình..." : roadmapSteps.length > 0 ? "Làm mới Roadmap" : "Bắt đầu tạo Roadmap"}
        </button>
      </div>

      {/* Danh sách các bước học kèm nút Complete ở mục số 5 */}
      <div className="space-y-4">
        {roadmapSteps.length === 0 && !loading && (
          <p className="text-center text-gray-400 py-10 border-2 border-dashed rounded-xl">
            Chưa có lộ trình nào. Hãy nhấn nút phía trên để AI bắt đầu tạo!
          </p>
        )}

        {roadmapSteps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center justify-between p-5 border rounded-xl transition-all shadow-sm ${
              step.completed ? "bg-gray-50 border-gray-100 shadow-none" : "bg-white border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${step.completed ? "bg-green-400" : "bg-blue-400 animate-pulse"}`} />
              <span className={`text-lg font-medium ${step.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                {step.step}
              </span>
            </div>

            {/* Nút Complete ở mục số 5 */}
            {!step.completed && (
              <button
                onClick={() => markDone(step.id)}
                className="text-green-600 font-bold border border-green-200 px-4 py-1.5 rounded-lg hover:bg-green-600 hover:text-white transition-all text-sm"
              >
                Complete
              </button>
            )}

            {step.completed && (
              <span className="text-green-500 text-sm font-bold flex items-center gap-1">
                ✓ Done
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}