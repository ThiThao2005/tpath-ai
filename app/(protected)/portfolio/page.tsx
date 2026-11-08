"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { FolderOpen, Trash2, ExternalLink, Briefcase } from "lucide-react"

type Project = {
  id: string // Đổi thành string nếu dùng UUID của Supabase
  title: string
  description: string
  link: string
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Hàm load danh sách dự án
  const loadProjects = async () => {
    setLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user

    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("user_id", user.id)
      .order('created_at', { ascending: false })

    setProjects(data || [])
    setLoading(false)
  }

  // 2. Hàm xóa dự án (Đã đưa ra ngoài useEffect và tối ưu)
const deleteProject = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này không?")) return

    const { error } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Lỗi khi xóa: " + error.message)
    } else {
      // Chỉ khi DB xóa thành công mới xóa trên giao diện
      setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header Section */}
      <div className="bg-slate-900 text-white py-16 mb-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <Briefcase className="text-blue-400" size={32} />
            <h1 className="text-4xl font-extrabold tracking-tight">My Portfolio</h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">
            Nơi lưu trữ và trưng bày những dự án tâm huyết trong hành trình trở thành lập trình viên chuyên nghiệp.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {loading ? (
          <div className="text-center py-20 text-slate-500 italic">Đang tải hồ sơ năng lực...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FolderOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500">Bạn chưa có dự án nào trong Portfolio.</p>
            <p className="text-sm text-slate-400">Hãy thêm dự án mới từ Dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((p) => (
              <div 
                key={p.id} 
                className="group bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {p.description || "Dự án này chưa có mô tả chi tiết."}
                  </p>
                  {p.link && (
                    <a 
                      href={p.link} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-500 font-semibold text-sm hover:underline"
                    >
                      Truy cập sản phẩm <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                <button 
                  onClick={() => deleteProject(p.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-sm font-bold"
                >
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}