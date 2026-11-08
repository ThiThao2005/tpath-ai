"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { getQuizResult, toPercent } from "@/lib/quiz"
import { 
  Lightbulb, 
  Sparkles, 
  Rocket, 
  ChevronRight, 
  Loader2, 
  Code2, 
  BarChart 
} from "lucide-react"

// Định nghĩa cấu trúc dữ liệu Project để TypeScript hỗ trợ gợi ý code
interface Project {
  title: string;
  description: string;
  difficulty: string;
  reason: string;
  stack: string[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  const generateProjectIdeas = async () => {
    setLoading(true)
    try {
      // 1. Lấy thông tin user hiện tại
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session
      if (!session) return alert("Vui lòng đăng nhập để dùng tính năng này!")

      // 2. Lấy kỹ năng từ bảng quiz_results (Dùng maybeSingle để tránh lỗi nếu chưa có dữ liệu)
      const quizRaw = await getQuizResult(session.user.id)
      const quizData = quizRaw ? toPercent(quizRaw) : null

      // Tạo chuỗi kỹ năng gửi cho AI
      const skills = quizData 
        ? `Frontend ${quizData.frontend}%, Backend ${quizData.backend}%, AI ${quizData.ai}%`
        : "React, Node.js, TypeScript"

      // 3. Gọi API Route
      const res = await fetch("/api/recommend-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ skills })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "API AI gặp sự cố");
      }

      // Cập nhật danh sách dự án (API trả về { projects: [...] })
      setProjects(data.projects || [])

    } catch (error: any) {
      console.error("Lỗi gọi AI:", error)
      alert(`Lỗi: ${error.message || "Không thể kết nối với trí tuệ nhân tạo lúc này."}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* 1. Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-2xl mb-4 shadow-sm">
            <Lightbulb size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            AI Project Ideas
          </h1>
          <p className="text-slate-500 text-lg">
            Dựa trên kết quả đánh giá năng lực, AI sẽ thiết kế các dự án thực tế giúp bạn tối ưu hóa Portfolio.
          </p>
        </div>

        {/* 2. Action Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={generateProjectIdeas}
            disabled={loading}
            className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Sparkles className="group-hover:rotate-12 transition-transform" size={20} />
            )}
            {loading ? "AI đang phân tích kỹ năng..." : "Gợi ý dự án cho tôi"}
          </button>
        </div>

        {/* 3. Results List */}
        <div className="space-y-6">
          {projects.length > 0 ? (
            projects.map((p, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:border-blue-300 transition-all group">
                
                {/* Badge: Icon và Độ khó */}
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-2.5 rounded-xl text-blue-500">
                    <Rocket size={22} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                    {p.difficulty}
                  </div>
                </div>

                {/* Tiêu đề & Mô tả */}
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {p.title}
                </h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  {p.description}
                </p>

                {/* Phần lý do phù hợp (Dòng mới thêm) */}
                <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-xl">
                  <p className="text-xs font-bold text-emerald-700 uppercase mb-1 flex items-center gap-1">
                    <Sparkles size={14} /> Tại sao phù hợp?
                  </p>
                  <p className="text-slate-600 text-sm italic leading-relaxed">
                    "{p.reason}"
                  </p>
                </div>

                {/* Danh sách công nghệ */}
                <div className="flex flex-wrap gap-2">
                  {p.stack.map((tech, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <Code2 size={14} /> {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : !loading && (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 bg-white/50">
              <p className="text-lg font-medium text-slate-500">Hệ thống đã sẵn sàng</p>
              <p className="text-sm">Nhấn nút phía trên để AI quét qua hồ sơ kỹ năng của bạn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

