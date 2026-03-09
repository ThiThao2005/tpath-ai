"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { LayoutDashboard, Plus, ExternalLink, BrainCircuit, Code2, Server } from "lucide-react" // Cần cài: npm install lucide-react

type Project = {
  id: string
  title: string
  description: string
  link: string
}

type Quiz = {
  frontend: number
  backend: number
  ai: number
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")

  async function loadData() {
    const { data: user } = await supabase.auth.getUser()
    if (!user?.user) return

    const uid = user.user.id

    const { data: projectData } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("user_id", uid)
      .order('created_at', { ascending: false })

    const { data: quizData } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", uid)
      .single()

    setProjects(projectData || [])
    setQuiz(quizData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])
const [isSubmitting, setIsSubmitting] = useState(false);
async function addProject() {
  if (!title || !link) return alert("Vui lòng nhập tên và link dự án!");
  
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return alert("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!");

  // Lấy lỗi từ Supabase để kiểm tra
  const { error } = await supabase.from("portfolio_projects").insert({
    user_id: user.user.id,
    title: title,
    description: description,
    link: link
  });

  if (error) {
    console.error("Lỗi insert dự án:", error.message);
    alert("Không thể thêm dự án: " + error.message);
  } else {
    alert("Thêm dự án thành công!");
    setTitle(""); 
    setDescription(""); 
    setLink("");
    // Tải lại dữ liệu mới nhất
    await loadData();
  }
}

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-medium text-slate-500 italic">
      Đang tải dữ liệu hệ thống...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 mb-10">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Trung tâm Điều khiển</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN KỸ NĂNG */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2 text-lg">
              <BrainCircuit className="text-blue-500" size={20} /> Chỉ số Kỹ năng
            </h2>
            
            {quiz ? (
              <div className="space-y-6">
                <SkillBar label="Frontend" value={quiz.frontend} color="bg-orange-500" icon={<Code2 size={16}/>} />
                <SkillBar label="Backend" value={quiz.backend} color="bg-blue-500" icon={<Server size={16}/>} />
                <SkillBar label="AI / Data" value={quiz.ai} color="bg-purple-500" icon={<BrainCircuit size={16}/>} />
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic">Chưa có dữ liệu Quiz. Hãy làm Quiz ngay!</p>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: QUẢN LÝ DỰ ÁN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Form thêm dự án */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="text-green-500" size={20} /> Thêm dự án mới
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Tên dự án (ví dụ: E-commerce Web)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <input
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Link Demo / GitHub"
                value={link}
                onChange={e => setLink(e.target.value)}
              />
              <input
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Mô tả ngắn gọn"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <button
                onClick={addProject}
                className="col-span-1 md:col-span-2 bg-slate-900 text-white font-bold p-3 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200"
              >
                Cập nhật Portfolio
              </button>
            </div>
          </div>

          {/* Danh sách dự án */}
          <div>
            <h2 className="font-bold text-slate-800 mb-4 text-xl px-2">Dự án của bạn ({projects.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(p => (
                <div key={p.id} className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 truncate">
                    {p.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">
                    {p.description || "Không có mô tả cho dự án này."}
                  </p>
                  <a
                    href={p.link}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Xem chi tiết <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// Component con cho thanh tiến độ kỹ năng
function SkillBar({ label, value, color, icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-bold text-slate-600 uppercase tracking-tight">
        <span className="flex items-center gap-2">{icon} {label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`${color} h-full transition-all duration-1000 ease-out`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  )
}