"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { normalizeUsername, USERNAME_PATTERN } from "@/lib/profile"

export default function Register() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!USERNAME_PATTERN.test(username)) {
      alert("Username cần 3–30 ký tự: chữ thường, số, dấu _ hoặc -")
      return
    }

    setLoading(true)
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()
    if (taken) {
      alert("Username đã có người dùng, hãy chọn tên khác.")
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Profile sẽ được tạo từ username này ở lần đăng nhập đầu tiên
        data: { username },
        // Tùy chọn: Chuyển hướng sau khi xác nhận email (nếu bật Auth confirm)
        emailRedirectTo: `${window.location.origin}/dashboard`,
      }
    })

    if (error) {
      alert(error.message)
    } else {
      alert("Đăng ký thành công! Kiểm tra email của bạn để xác nhận (nếu có).")
      router.push("/dashboard")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <Link href="/" className="absolute top-5 left-5 z-20 text-sm text-slate-400 hover:text-white">
        ← Về trang chủ
      </Link>

      {/* Hiệu ứng ánh sáng nền giống trang chủ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            Tạo tài khoản
          </h1>
          <p className="text-slate-400">Bắt đầu hành trình sự nghiệp IT của bạn</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Username</label>
            <input
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
              placeholder="vd: thao_dev"
              value={username}
              onChange={(e) => setUsername(normalizeUsername(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-1 ml-1">Dùng cho link hồ sơ công khai: /u/{username || "username"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Email</label>
            <input
              type="email"
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-blue-900/20 mt-4 
              ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]'}`}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}