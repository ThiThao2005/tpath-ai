"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { FolderOpen, Trash2, Briefcase, Printer, Share2 } from "lucide-react"
import toast from "react-hot-toast"
import { computeStats, toView, type PortfolioProject } from "@/lib/interview"
import { ensureProfile } from "@/lib/profile"
import { InterviewCard, StatsOverview, SummaryTable } from "@/components/InterviewProject"

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProjects() {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) {
      setLoading(false)
      return
    }

    const [{ data }, name] = await Promise.all([
      supabase
        .from("portfolio_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      ensureProfile(user),
    ])

    setProjects((data as PortfolioProject[]) || [])
    setUsername(name)
    setLoading(false)
  }

  async function deleteProject(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này không?")) return

    const { error } = await supabase.from("portfolio_projects").delete().eq("id", id)
    if (error) toast.error("Lỗi khi xóa: " + error.message)
    else {
      toast.success("Đã xóa dự án.")
      setProjects((prev) => prev.filter((p) => p.id !== id))
    }
  }

  async function copyPublicLink() {
    if (!username) return
    const url = `${window.location.origin}/u/${username}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Đã copy link hồ sơ công khai!")
    } catch {
      toast(url)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const views = useMemo(() => projects.map(toView), [projects])
  const stats = useMemo(() => computeStats(views), [views])

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-12 mb-8 shadow-lg print:bg-white print:text-slate-900 print:shadow-none print:py-4 print:mb-4">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Briefcase className="text-blue-400" size={30} />
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Hồ sơ dự án</h1>
            </div>
            <p className="text-slate-400 max-w-2xl print:text-slate-600">
              Mỗi dự án được trình bày theo khung <b className="text-slate-200 print:text-slate-800">STAR</b> —
              Bối cảnh → Việc mình làm → Khó khăn → Kết quả — để đọc nhanh khi ứng tuyển và kể lại khi phỏng vấn.
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            {username && (
              <button
                onClick={copyPublicLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
              >
                <Share2 size={16} /> Copy link hồ sơ
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
            >
              <Printer size={16} /> In / Lưu PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-6">
        {loading ? (
          <div className="text-center py-20 text-slate-500 italic">Đang tải hồ sơ năng lực...</div>
        ) : views.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <FolderOpen className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500">Bạn chưa có dự án nào trong Portfolio.</p>
            <p className="text-sm text-slate-400">
              Hãy thêm dự án mới từ <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>!
            </p>
          </div>
        ) : (
          <>
            <StatsOverview stats={stats} />
            <SummaryTable projects={views} />

            <h2 className="text-sm font-semibold text-slate-800 pt-2">Chi tiết từng dự án</h2>
            <div className="space-y-6">
              {views.map((p, i) => (
                <InterviewCard
                  key={p.id}
                  project={p}
                  index={i}
                  showPrep
                  actions={
                    <>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300 transition-colors"
                      >
                        Sửa ở Dashboard
                      </Link>
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors"
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
