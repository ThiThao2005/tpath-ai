"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Trang đích sau khi đăng nhập (?next=/quiz), chỉ chấp nhận đường dẫn nội bộ
  const getNext = () => {
    const next = new URLSearchParams(window.location.search).get("next")
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
  }

  // --- HÀM ĐĂNG NHẬP GOOGLE ---
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${getNext()}`
      }
    })
  }

  // --- HÀM ĐĂNG NHẬP EMAIL/PASSWORD ---
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
    } else {
      router.push(getNext())
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="p-10 bg-white shadow-xl rounded-lg border">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập ITPath AI</h1>

        {/* Đăng nhập bằng Google (Cái thứ nhất của bạn) */}
        <button
          onClick={loginWithGoogle}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded mb-6 transition-all"
        >
          Login with Google
        </button>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400">hoặc</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Form Email/Password (Cái thứ hai của bạn) */}
        <input
          className="border p-2 block w-full mt-4 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 block w-full mt-4 rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-green-500 hover:bg-green-600 text-white p-2 mt-6 rounded transition-all"
          onClick={handleLogin}
        >
          Đăng nhập bằng Email
        </button>
      </div>
    </div>
  )
}