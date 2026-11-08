"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { supabase } from "@/lib/supabase"
import { questions, saveQuizResult, type QuizScores, type SkillType } from "@/lib/quiz"

export default function Quiz() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState<QuizScores>({ frontend: 0, backend: 0, ai: 0 })

  const handleAnswer = async (type: SkillType) => {
    const newScore = { ...scores }
    if (type !== "none") newScore[type] += 1
    setScores(newScore)

    if (index < questions.length - 1) {
      setIndex(index + 1)
      return
    }

    setLoading(true)
    try {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      if (!user) {
        toast.error("Vui lòng đăng nhập!")
        router.push("/login")
        return
      }

      const error = await saveQuizResult(user.id, newScore)
      if (error) {
        toast.error("Không lưu được kết quả: " + error.message)
        return
      }

      toast.success("Hoàn thành Quiz!")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const q = questions[index]
  const progress = Math.round((index / questions.length) * 100)

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-2xl font-bold">Skill Assessment Quiz</h1>

      <p className="text-gray-500 mt-2">
        Question {index + 1} / {questions.length}
      </p>

      <div className="w-full bg-gray-200 h-3 rounded mt-4">
        <div className="bg-black h-3 rounded" style={{ width: `${progress}%` }} />
      </div>

      <h2 className="mt-8 text-lg">{q.question}</h2>

      <div className="mt-4 space-y-3">
        {q.options.map((o, i) => (
          <button
            key={i}
            className="block border p-3 w-full text-left hover:bg-gray-100 disabled:opacity-50"
            onClick={() => handleAnswer(o.type)}
            disabled={loading}
          >
            {o.text}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-gray-500">Saving result...</p>}
    </div>
  )
}
