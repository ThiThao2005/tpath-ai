"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Register() {

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  const handleRegister = async () => {

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if(error){
      alert(error.message)
    }else{
      alert("Register success")
      router.push("/dashboard")
    }

  }

  return(
    <div className="p-10">

      <h1 className="text-2xl font-bold">
        Register
      </h1>

      <input
        className="border p-2 block mt-4"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 block mt-4"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button
        className="bg-blue-500 text-white p-2 mt-4"
        onClick={handleRegister}
      >
        Register
      </button>

    </div>
  )
}