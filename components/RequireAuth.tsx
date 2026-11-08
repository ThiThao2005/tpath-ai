"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { ensureProfile } from "@/lib/profile"

/**
 * Bọc các trang cần đăng nhập. Phiên Supabase lưu ở trình duyệt,
 * nên việc kiểm tra được làm ở client. Dữ liệu vẫn được bảo vệ bằng RLS.
 */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<"checking" | "authed">("checking")
  const profileChecked = useRef(false)

  useEffect(() => {
    let active = true

    const redirectToLogin = () => {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này!", { id: "require-auth" })
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (data.session) {
        setStatus("authed")
        if (!profileChecked.current) {
          profileChecked.current = true
          ensureProfile(data.session.user).catch((e) => console.warn("ensureProfile:", e))
        }
      } else {
        redirectToLogin()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) redirectToLogin()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router, pathname])

  if (status !== "authed") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 italic text-sm">
        Đang kiểm tra đăng nhập...
      </div>
    )
  }

  return <>{children}</>
}
