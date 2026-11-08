"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Home, LogOut, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { ensureProfile } from "@/lib/profile"
import { NAV_STEPS } from "@/lib/nav"

/** Thanh menu cố định ở đầu các trang cần đăng nhập: về trang chủ + chuyển nhanh giữa các bước. */
export default function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user
      if (!user) return
      ensureProfile(user).then((name) => { if (active) setUsername(name) }).catch(() => {})
    })
    return () => { active = false }
  }, [])

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) toast.error("Lỗi khi đăng xuất: " + error.message)
    else {
      toast.success("Đã đăng xuất!")
      router.push("/")
    }
  }

  const linkClass = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
      active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
    }`

  return (
    <nav className="sticky top-0 z-40 bg-slate-950 border-b border-white/10 print:hidden">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter flex-shrink-0"
          title="Về trang chủ"
        >
          <Home size={18} className="text-cyan-400" />
          <span className="hidden sm:inline">ITPath AI</span>
        </Link>

        {/* Các bước — cuộn ngang trên điện thoại */}
        <div className="flex-1 min-w-0 overflow-x-auto [scrollbar-width:none]">
          <div className="flex items-center gap-1 w-max">
            {NAV_STEPS.map((s) => {
              const active = pathname === s.href
              return (
                <Link key={s.href} href={s.href} className={linkClass(active)} aria-current={active ? "page" : undefined}>
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      active ? "bg-blue-500 text-white" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {s.step}
                  </span>
                  {s.label}
                </Link>
              )
            })}
            {username && (
              <Link href={`/u/${username}`} className={linkClass(false)} title="Trang hồ sơ công khai (gửi nhà tuyển dụng)">
                <User size={15} /> Hồ sơ công khai
              </Link>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="flex-shrink-0 flex items-center gap-1.5 text-sm text-red-400 hover:text-white hover:bg-red-500 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
          title="Đăng xuất"
        >
          <LogOut size={15} />
          <span className="hidden md:inline">Đăng xuất</span>
        </button>
      </div>
    </nav>
  )
}
