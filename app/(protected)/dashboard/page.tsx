"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard, Plus, ExternalLink, BrainCircuit,
  Code2, Server, Bot, Layers, Trash2, Pencil, Check,
  RefreshCw, Save, Calendar
} from "lucide-react"
import toast from "react-hot-toast"
import { getQuizResult, toPercent, type QuizScores } from "@/lib/quiz"

// ─── Types ───────────────────────────────────────────────────────────────────

type Tag = "fe" | "be" | "ai" | "fs"

type Project = {
  id: string
  title: string
  description: string
  link: string
  tag?: Tag
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_META: Record<Tag, { label: string; color: string }> = {
  fe: { label: "Frontend",  color: "bg-orange-100 text-orange-700" },
  be: { label: "Backend",   color: "bg-blue-100 text-blue-700" },
  ai: { label: "AI / Data", color: "bg-purple-100 text-purple-700" },
  fs: { label: "Fullstack", color: "bg-green-100 text-green-700" },
}

const TAG_ICON: Record<Tag, React.ReactNode> = {
  fe: <Code2  size={17} />,
  be: <Server size={17} />,
  ai: <Bot    size={17} />,
  fs: <Layers size={17} />,
}

/**
 * Nếu database chưa có cột `tag` (chưa chạy supabase/rls.sql),
 * thử lại không kèm `tag` để việc lưu dự án vẫn thành công.
 */
async function withoutTagFallback<T extends { tag?: Tag }>(
  fields: T,
  run: (f: Partial<T>) => PromiseLike<{ error: { code?: string; message: string } | null }>
) {
  const res = await run(fields)
  if (res.error && /'tag' column/.test(res.error.message)) {
    console.warn("Bảng portfolio_projects chưa có cột tag — hãy chạy supabase/rls.sql")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tag: _omit, ...rest } = fields
    return run(rest as Partial<T>)
  }
  return res
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-medium text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}

function SkillBar({
  label, value, barColor, icon,
}: {
  label: string; value: number; barColor: string; icon: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">{icon} {label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [projects, setProjects]     = useState<Project[]>([])
  const [quiz,     setQuiz]         = useState<QuizScores | null>(null)
  const [loading,  setLoading]      = useState(true)
  const [filter,   setFilter]       = useState<Tag | "all">("all")

  // Form state
  const [title,    setTitle]        = useState("")
  const [desc,     setDesc]         = useState("")
  const [link,     setLink]         = useState("")
  const [tag,      setTag]          = useState<Tag>("fe")
  const [editId,   setEditId]       = useState<string | null>(null)
  const [saving,   setSaving]       = useState(false)

  // ── Load data ──────────────────────────────────────────────────────────────

  async function loadData() {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) { setLoading(false); return }
    const uid = user.id

    const [{ data: projectData }, quizData] = await Promise.all([
      supabase
        .from("portfolio_projects")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
      getQuizResult(uid),
    ])

    setProjects(projectData || [])
    setQuiz(quizData ? toPercent(quizData) : null)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  // ── Add / Edit project ────────────────────────────────────────────────────

  async function handleSave() {
    if (!title.trim() || !link.trim()) {
      toast.error("Vui lòng nhập tên và link dự án!")
      return
    }
    if (!/^https?:\/\//i.test(link.trim())) {
      toast.error("Link phải bắt đầu bằng http:// hoặc https://")
      return
    }

    setSaving(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const sessionUser = sessionData.session?.user
    if (!sessionUser) {
      toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!")
      setSaving(false)
      return
    }

    const fields = { title: title.trim(), description: desc.trim(), link: link.trim(), tag }

    if (editId) {
      // Update
      const { error } = await withoutTagFallback(fields, (f) =>
        supabase.from("portfolio_projects").update(f).eq("id", editId)
      )

      if (error) { toast.error("Lỗi cập nhật: " + error.message) }
      else {
        toast.success("Đã cập nhật dự án!")
        clearForm()
        await loadData()
      }
    } else {
      // Insert
      const uid = sessionUser.id
      const { error } = await withoutTagFallback(fields, (f) =>
        supabase.from("portfolio_projects").insert({ user_id: uid, ...f })
      )

      if (error) { toast.error("Không thể thêm dự án: " + error.message) }
      else {
        toast.success("Đã thêm dự án thành công!")
        clearForm()
        await loadData()
      }
    }

    setSaving(false)
  }

  function startEdit(p: Project) {
    setEditId(p.id)
    setTitle(p.title)
    setDesc(p.description || "")
    setLink(p.link)
    setTag((p.tag as Tag) || "fe")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function clearForm() {
    setEditId(null)
    setTitle("")
    setDesc("")
    setLink("")
    setTag("fe")
  }

  // ── Delete project ─────────────────────────────────────────────────────────

  async function deleteProject(id: string) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa dự án này không?")
    if (!confirmed) return

    const { error } = await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", id)

    if (error) { toast.error("Lỗi khi xóa: " + error.message) }
    else {
      toast.success("Đã xóa dự án.")
      setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredProjects = filter === "all"
    ? projects
    : projects.filter(p => p.tag === filter)

  const topSkill = quiz
    ? (Object.entries({ Frontend: quiz.frontend, Backend: quiz.backend, "AI / Data": quiz.ai })
        .sort((a, b) => b[1] - a[1])[0])
    : null

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", day: "numeric", month: "long",
  })

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400 italic text-sm">
      Đang tải dữ liệu...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">

      {/* ── Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-lg font-medium text-slate-800 dark:text-slate-100">Trung tâm Điều khiển</h1>
              <p className="text-xs text-slate-400">Xin chào, developer 👋</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={14} />
            {today}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 space-y-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Dự án"
            value={projects.length}
            sub="trong portfolio"
          />
          <StatCard
            label="Kỹ năng cao nhất"
            value={topSkill ? topSkill[0] : "—"}
            sub={topSkill ? `${topSkill[1]}% điểm số` : "chưa có quiz"}
          />
          <StatCard
            label="Trạng thái"
            value={<span className="text-emerald-500 text-base">✓ Hoạt động</span>}
            sub="tài khoản bình thường"
          />
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Cột trái: Kỹ năng */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-5">
                <BrainCircuit size={16} className="text-blue-500" /> Chỉ số kỹ năng
              </h2>
              <div className="space-y-5">
                <SkillBar label="Frontend" value={quiz?.frontend ?? 0} barColor="bg-orange-500" icon={<Code2 size={14}/>} />
                <SkillBar label="Backend"  value={quiz?.backend  ?? 0} barColor="bg-blue-500"   icon={<Server size={14}/>} />
                <SkillBar label="AI / Data" value={quiz?.ai      ?? 0} barColor="bg-purple-500" icon={<Bot size={14}/>} />
              </div>
              {!quiz && (
                <p className="text-xs text-slate-400 italic mt-4">Chưa có dữ liệu Quiz. Hãy làm Quiz ngay!</p>
              )}
            </div>
          </div>

          {/* Cột phải: Form + danh sách */}
          <div className="lg:col-span-2 space-y-5">

            {/* Form thêm / chỉnh sửa */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h2 className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-4">
                {editId ? <Pencil size={15} className="text-amber-500" /> : <Plus size={15} className="text-emerald-500" />}
                {editId ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  className="md:col-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Tên dự án (ví dụ: E-commerce Web)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <input
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Link Demo / GitHub"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                />
                <input
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mô tả ngắn gọn"
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                />
                <select
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={tag}
                  onChange={e => setTag(e.target.value as Tag)}
                >
                  <option value="fe">Frontend</option>
                  <option value="be">Backend</option>
                  <option value="ai">AI / Data</option>
                  <option value="fs">Fullstack</option>
                </select>

                <div className="md:col-span-2 flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium text-sm py-2.5 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : editId ? (
                      <><Check size={15} /> Lưu chỉnh sửa</>
                    ) : (
                      <><Save size={15} /> Lưu vào Portfolio</>
                    )}
                  </button>
                  {editId && (
                    <button
                      onClick={clearForm}
                      className="px-4 text-sm text-slate-500 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Danh sách dự án */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Dự án của bạn
                  <span className="ml-1.5 text-xs font-normal text-slate-400">({projects.length})</span>
                </h2>
                <div className="flex gap-1.5 flex-wrap">
                  {(["all", "fe", "be", "ai", "fs"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        filter === f
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {f === "all" ? "Tất cả" : TAG_META[f].label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  Chưa có dự án nào. Thêm dự án đầu tiên!
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProjects.map(p => {
                    const t = (p.tag as Tag) || "fe"
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                          {TAG_ICON[t]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{p.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TAG_META[t].color}`}>
                              {TAG_META[t].label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{p.description || "Không có mô tả."}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            onClick={() => startEdit(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-600 hover:border-amber-300 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deleteProject(p.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 hover:border-red-300 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}