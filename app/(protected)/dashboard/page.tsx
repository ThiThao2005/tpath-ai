"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard, Plus, ExternalLink, BrainCircuit,
  Code2, Server, Bot, Layers, Trash2, Pencil, Check,
  RefreshCw, Save, Calendar, ChevronDown, Briefcase
} from "lucide-react"
import toast from "react-hot-toast"
import { getQuizResult, toPercent, type QuizScores } from "@/lib/quiz"
import { splitGithub, isSafeUrl } from "@/lib/project"
import {
  EMPTY_DETAILS_FORM, PAIR_SEP, detailsToForm, formToDetails, parseDetails,
  type DetailsForm, type InterviewDetails,
} from "@/lib/interview"

// ─── Types ───────────────────────────────────────────────────────────────────

type Tag = "fe" | "be" | "ai" | "fs"

type Project = {
  id: string
  title: string
  description: string
  link: string
  tag?: Tag
  details?: unknown
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

type SaveFields = {
  title: string
  description: string
  link: string
  tag?: Tag
  details?: InterviewDetails | null
}

/**
 * Nếu database chưa có cột `tag` / `details` (chưa chạy supabase/rls.sql hoặc
 * supabase/interview_projects.sql), bỏ cột đó rồi thử lại để việc lưu dự án vẫn thành công.
 */
async function withMissingColumnFallback(
  fields: SaveFields,
  run: (f: Partial<SaveFields>) => PromiseLike<{ error: { code?: string; message: string } | null }>
) {
  let current: Partial<SaveFields> = fields
  let res = await run(current)
  for (const col of ["tag", "details"] as const) {
    if (res.error && new RegExp(`'${col}' column`).test(res.error.message)) {
      console.warn(`Bảng portfolio_projects chưa có cột ${col} — hãy chạy file SQL trong thư mục supabase/`)
      if (col === "details" && fields.details) toast("Chưa lưu được thông tin phỏng vấn: database thiếu cột details.", { icon: "⚠️" })
      const rest = { ...current }
      delete rest[col]
      current = rest
      res = await run(current)
    }
  }
  return res
}

const DETAIL_FIELDS: {
  key: keyof DetailsForm; label: string; placeholder: string; rows?: number; full?: boolean
}[] = [
  { key: "pitch", label: "Giới thiệu trong 30 giây", rows: 2, full: true,
    placeholder: "Dự án giải quyết vấn đề gì, cho ai, điểm nổi bật nhất là gì?" },
  { key: "role", label: "Vai trò", placeholder: "VD: Làm cá nhân – Fullstack" },
  { key: "period", label: "Thời gian", placeholder: "VD: 09/2026 – 11/2026" },
  { key: "stack", label: "Công nghệ (phân cách bằng dấu phẩy)", full: true,
    placeholder: "Next.js, TypeScript, Supabase, Tailwind CSS" },
  { key: "context", label: "Bối cảnh & mục tiêu", rows: 2, full: true,
    placeholder: "Trước khi có dự án, người dùng gặp khó khăn gì? Mục tiêu đặt ra là gì?" },
  { key: "actions", label: "Mình đã làm gì (mỗi dòng 1 ý)", rows: 4, full: true,
    placeholder: "Thiết kế database 5 bảng\nViết API đặt hàng\nLàm trang admin" },
  { key: "challenges", label: `Khó khăn & cách giải quyết (mỗi dòng: Vấn đề ${PAIR_SEP} Cách giải quyết)`, rows: 3, full: true,
    placeholder: `Khách sửa được giá trong request ${PAIR_SEP} Tính lại giá từ database ở phía server` },
  { key: "results", label: "Kết quả (mỗi dòng 1 ý)", rows: 3, full: true,
    placeholder: "Deploy trên Vercel\nCó 20 trang, 30 API" },
  { key: "questions", label: `Câu hỏi phỏng vấn có thể gặp (mỗi dòng: Câu hỏi ${PAIR_SEP} Gợi ý trả lời) – chỉ mình bạn thấy`, rows: 3, full: true,
    placeholder: `Vì sao chọn Supabase? ${PAIR_SEP} Có sẵn Auth và PostgreSQL, phân quyền bằng RLS` },
]

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
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Form state
  const [title,    setTitle]        = useState("")
  const [desc,     setDesc]         = useState("")
  const [link,     setLink]         = useState("")
  const [tag,      setTag]          = useState<Tag>("fe")
  const [editId,   setEditId]       = useState<string | null>(null)
  const [saving,   setSaving]       = useState(false)
  const [dForm,    setDForm]        = useState<DetailsForm>(EMPTY_DETAILS_FORM)
  const [showDetails, setShowDetails] = useState(false)

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

    const fields: SaveFields = {
      title: title.trim(), description: desc.trim(), link: link.trim(), tag,
      details: formToDetails(dForm),
    }

    if (editId) {
      // Update
      const { error } = await withMissingColumnFallback(fields, (f) =>
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
      const { error } = await withMissingColumnFallback(fields, (f) =>
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
    const d = parseDetails(p.details)
    setDForm(detailsToForm(d))
    setShowDetails(!!d)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function clearForm() {
    setEditId(null)
    setTitle("")
    setDesc("")
    setLink("")
    setTag("fe")
    setDForm(EMPTY_DETAILS_FORM)
    setShowDetails(false)
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
                <textarea
                  rows={3}
                  className="md:row-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                  placeholder="Mô tả: tính năng, công nghệ, link GitHub..."
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

                {/* Thông tin phỏng vấn (STAR) */}
                <div className="md:col-span-2 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setShowDetails(v => !v)}
                    aria-expanded={showDetails}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left text-slate-700 dark:text-slate-200"
                  >
                    <Briefcase size={15} className="text-blue-500 flex-shrink-0" />
                    <span>
                      Thông tin phỏng vấn (STAR)
                      <span className="text-xs text-slate-400"> – hiển thị ở Portfolio & hồ sơ công khai</span>
                    </span>
                    <ChevronDown size={15} className={`ml-auto flex-shrink-0 text-slate-400 transition-transform ${showDetails ? "rotate-180" : ""}`} />
                  </button>
                  {showDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-3 pb-3">
                      {DETAIL_FIELDS.map(f => (
                        <label key={f.key} className={`block space-y-1 ${f.full ? "md:col-span-2" : ""}`}>
                          <span className="text-xs text-slate-500">{f.label}</span>
                          {f.rows ? (
                            <textarea
                              rows={f.rows}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                              placeholder={f.placeholder}
                              value={dForm[f.key]}
                              onChange={e => setDForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            />
                          ) : (
                            <input
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder={f.placeholder}
                              value={dForm[f.key]}
                              onChange={e => setDForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

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
                    const open = expandedId === p.id
                    const { text, github } = splitGithub(p.description)
                    return (
                      <div
                        key={p.id}
                        className={`border rounded-xl transition-colors ${
                          open
                            ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20"
                            : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                        }`}
                      >
                        {/* Hàng tóm tắt: bấm để mở / đóng chi tiết */}
                        <button
                          type="button"
                          onClick={() => setExpandedId(open ? null : p.id)}
                          aria-expanded={open}
                          className="w-full flex items-center gap-3 p-3 text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                            {TAG_ICON[t]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium text-slate-800 dark:text-slate-100 ${open ? "" : "truncate"}`}>{p.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TAG_META[t].color}`}>
                                {TAG_META[t].label}
                              </span>
                            </div>
                            {!open && (
                              <p className="text-xs text-slate-400 truncate">{text || "Không có mô tả."}</p>
                            )}
                          </div>
                          <ChevronDown
                            size={16}
                            className={`flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Phần chi tiết */}
                        {open && (
                          <div className="px-3 pb-3 pl-[3.75rem] space-y-3">
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line break-words">
                              {text || "Không có mô tả."}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {isSafeUrl(p.link) && (
                                <a
                                  href={p.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                  <ExternalLink size={13} /> Xem demo
                                </a>
                              )}
                              {github && (
                                <a
                                  href={github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
                                >
                                  <Code2 size={13} /> GitHub
                                </a>
                              )}
                              <button
                                onClick={() => startEdit(p)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:border-amber-300 transition-colors"
                              >
                                <Pencil size={13} /> Sửa
                              </button>
                              <button
                                onClick={() => deleteProject(p.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:border-red-300 transition-colors"
                              >
                                <Trash2 size={13} /> Xóa
                              </button>
                            </div>
                          </div>
                        )}
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