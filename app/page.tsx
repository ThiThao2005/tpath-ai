"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import type { User as AuthUser } from "@supabase/supabase-js"
import {
  ArrowRight, Check, Lock, LogOut, Sparkles, User,
  Target, Map, Lightbulb, LayoutGrid, Briefcase,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ensureProfile } from "@/lib/profile"
import { getQuizResult, toPercent } from "@/lib/quiz"
import { NAV_STEPS } from "@/lib/nav"

const STEP_ICON: Record<string, React.ReactNode> = {
  "/quiz": <Target size={22} className="text-orange-400" />,
  "/roadmap": <Map size={22} className="text-cyan-400" />,
  "/projects": <Lightbulb size={22} className="text-yellow-400" />,
  "/dashboard": <LayoutGrid size={22} className="text-emerald-400" />,
  "/portfolio": <Briefcase size={22} className="text-violet-400" />,
}

/** Tiến độ của user ở từng bước, để biết đã làm tới đâu và bước tiếp theo là gì */
type Progress = {
  uid: string
  username: string | null
  topSkill: string | null       // vd "Frontend 80%"
  roadmapDone: number
  roadmapTotal: number
  projectCount: number
}

async function loadProgress(user: AuthUser): Promise<Progress> {
  const [username, quiz, roadmap, projects] = await Promise.all([
    ensureProfile(user).catch(() => null),
    getQuizResult(user.id).catch(() => null),
    supabase.from("roadmap_progress").select("completed").eq("user_id", user.id),
    supabase.from("portfolio_projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ])

  let topSkill: string | null = null
  if (quiz) {
    const p = toPercent(quiz)
    const [name, value] = Object.entries({ Frontend: p.frontend, Backend: p.backend, AI: p.ai })
      .sort((a, b) => b[1] - a[1])[0]
    topSkill = `${name} ${value}%`
  }

  const rows = (roadmap.data ?? []) as { completed: boolean }[]
  return {
    uid: user.id,
    username,
    topSkill,
    roadmapDone: rows.filter((r) => r.completed).length,
    roadmapTotal: rows.length,
    projectCount: projects.count ?? 0,
  }
}

/** Trạng thái hiển thị dưới mỗi bước + bước nào đã xong */
function stepStatus(href: string, p: Progress): { text: string; done: boolean } {
  switch (href) {
    case "/quiz":
      return p.topSkill ? { text: `Đã làm · mạnh nhất ${p.topSkill}`, done: true } : { text: "Chưa làm", done: false }
    case "/roadmap":
      return p.roadmapTotal
        ? { text: `Đã học ${p.roadmapDone}/${p.roadmapTotal} bước`, done: p.roadmapDone === p.roadmapTotal }
        : { text: "Chưa tạo lộ trình", done: false }
    case "/projects":
      return p.topSkill ? { text: "Sẵn sàng gợi ý", done: false } : { text: "Nên làm Quiz trước", done: false }
    case "/dashboard":
      return p.projectCount
        ? { text: `${p.projectCount} dự án`, done: true }
        : { text: "Chưa có dự án", done: false }
    case "/portfolio":
      return p.projectCount
        ? { text: "Sẵn sàng in / gửi", done: true }
        : { text: "Cần thêm dự án ở bước 4", done: false }
    default:
      return { text: "", done: false }
  }
}

/** Bước nên làm tiếp theo */
function nextStep(p: Progress) {
  if (!p.topSkill) return "/quiz"
  if (!p.roadmapTotal) return "/roadmap"
  if (!p.projectCount) return "/dashboard"
  return "/portfolio"
}

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    let active = true
    loadProgress(user).then((p) => { if (active) setProgress(p) })
    return () => { active = false }
  }, [user])

  // Chỉ dùng tiến độ của đúng user đang đăng nhập (tránh hiện số liệu của tài khoản trước)
  const prog = user && progress?.uid === user.id ? progress : null
  const next = prog ? nextStep(prog) : null
  const nextInfo = NAV_STEPS.find((s) => s.href === next)

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) toast.error("Lỗi khi đăng xuất: " + error.message)
    else {
      toast.success("Đã đăng xuất thành công!")
      setUser(null)
      setProgress(null)
    }
  }

  function openStep(e: React.MouseEvent, href: string) {
    if (user) return
    e.preventDefault()
    toast.error("Vui lòng đăng nhập để sử dụng tính năng này!", { id: "need-login" })
    router.push(`/login?next=${encodeURIComponent(href)}`)
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col font-sans">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">
            ITPath AI
          </Link>

          {authReady && (
            user ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:block text-xs text-slate-400">
                  Xin chào, <b className="text-slate-200">{prog?.username ?? user.email?.split("@")[0]}</b>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Đăng nhập</Link>
                <Link href="/register" className="text-sm font-bold bg-white text-slate-950 px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95">
                  Tham gia ngay
                </Link>
              </div>
            )
          )}
        </div>
      </nav>

      {/* HIỆU ỨNG NỀN */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center pt-32 pb-20 px-6">
        {/* --- 1. GIỚI THIỆU --- */}
        <section className="text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> AI-Powered Career Assistant
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
            Xác định vị trí <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              Vươn tầm quốc tế
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Làm quiz để biết mình hợp hướng nào, học theo lộ trình, làm dự án được AI gợi ý,
            rồi gom tất cả thành hồ sơ để đi phỏng vấn.
          </p>

          {/* Nút chính: chưa đăng nhập → đăng ký; đã đăng nhập → bước nên làm tiếp */}
          <div className="flex flex-wrap justify-center gap-3 pt-2 min-h-12">
            {authReady && !user && (
              <>
                <Link href="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full font-bold transition-colors">
                  Bắt đầu miễn phí <ArrowRight size={18} />
                </Link>
                <Link href="/login" className="inline-flex items-center gap-2 border border-white/15 hover:bg-white/5 px-6 py-3 rounded-full font-medium transition-colors">
                  Tôi đã có tài khoản
                </Link>
              </>
            )}
            {nextInfo && (
              <Link href={nextInfo.href} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full font-bold transition-colors">
                Tiếp tục: Bước {nextInfo.step} – {nextInfo.title} <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </section>

        {/* --- 2. HÀNH TRÌNH 5 BƯỚC --- */}
        <section className="w-full max-w-6xl mt-16">
          <h2 className="text-center text-sm uppercase tracking-widest text-slate-500 mb-6">
            Hành trình 5 bước
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {NAV_STEPS.map((s) => {
              const st = prog ? stepStatus(s.href, prog) : null
              const isNext = s.href === next
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={(e) => openStep(e, s.href)}
                  className={`group relative flex flex-col p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/70 ${
                    isNext
                      ? "bg-blue-950/40 border-blue-500/60 shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                      : "bg-slate-900/40 border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        st?.done ? "bg-emerald-500 text-white" : isNext ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {st?.done ? <Check size={16} /> : s.step}
                    </span>
                    {STEP_ICON[s.href]}
                  </div>

                  <h3 className="font-bold text-base mb-1 flex items-center gap-1.5">
                    {s.title}
                    <ArrowRight size={15} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed flex-1">{s.desc}</p>

                  <p className={`mt-4 text-xs font-medium flex items-center gap-1.5 ${
                    !user ? "text-slate-500" : st?.done ? "text-emerald-400" : isNext ? "text-blue-300" : "text-slate-500"
                  }`}>
                    {!user ? <><Lock size={12} /> Cần đăng nhập</> : isNext ? "👉 Nên làm tiếp" : st?.text ?? "…"}
                  </p>
                  {user && isNext && st?.text && <p className="text-xs text-slate-500 mt-0.5">{st.text}</p>}
                </Link>
              )
            })}
          </div>

          {/* Hồ sơ công khai: link để gửi nhà tuyển dụng */}
          {prog?.username && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 p-5 rounded-3xl bg-slate-900/40 border border-white/5">
              <div className="flex items-center gap-3 text-sm">
                <User size={20} className="text-blue-400 flex-shrink-0" />
                <span className="text-slate-300">
                  Hồ sơ công khai để gửi nhà tuyển dụng:{" "}
                  <span className="text-white font-medium">/u/{prog.username}</span>
                </span>
              </div>
              <Link
                href={`/u/${prog.username}`}
                className="text-sm font-medium px-4 py-2 rounded-full border border-white/15 hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                Xem hồ sơ công khai
              </Link>
            </div>
          )}
        </section>
      </main>

      <footer className="relative z-10 py-8 text-center text-slate-600 text-xs border-t border-white/5 mx-10">
        © {new Date().getFullYear()} ITPath AI - Trợ lý lộ trình IT thông minh
      </footer>
    </div>
  )
}
