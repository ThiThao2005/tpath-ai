import { supabase } from "@/lib/supabase"

export type SkillType = "frontend" | "backend" | "ai" | "none"
export type SkillKey = Exclude<SkillType, "none">

export type QuizScores = Record<SkillKey, number>

export type QuizQuestion = {
  question: string
  options: { text: string; type: SkillType }[]
}

export const questions: QuizQuestion[] = [

  {
    question:"Bạn quen công nghệ frontend nào?",
    options:[
      {text:"React",type:"frontend"},
      {text:"Vue",type:"frontend"},
      {text:"Angular",type:"frontend"},
      {text:"Chưa học",type:"none"}
    ]
  },

  {
    question:"Bạn đã từng làm backend chưa?",
    options:[
      {text:"NodeJS",type:"backend"},
      {text:"Java Spring",type:"backend"},
      {text:"PHP",type:"backend"},
      {text:"Chưa",type:"none"}
    ]
  },

  {
    question:"Bạn có quan tâm AI / Machine Learning không?",
    options:[
      {text:"Rất thích",type:"ai"},
      {text:"Có tìm hiểu",type:"ai"},
      {text:"Không nhiều",type:"none"},
      {text:"Chưa biết",type:"none"}
    ]
  },

  {
    question:"Bạn đã từng build website chưa?",
    options:[
      {text:"Nhiều lần",type:"frontend"},
      {text:"1-2 lần",type:"frontend"},
      {text:"Chưa",type:"none"},
      {text:"Không nhớ",type:"none"}
    ]
  },

  {
    question:"Bạn thích làm việc với database?",
    options:[
      {text:"Rất thích",type:"backend"},
      {text:"Ổn",type:"backend"},
      {text:"Không thích",type:"none"},
      {text:"Chưa biết",type:"none"}
    ]
  },

  {
    question:"Bạn từng dùng Python?",
    options:[
      {text:"Có nhiều",type:"ai"},
      {text:"Có chút",type:"ai"},
      {text:"Chưa",type:"none"},
      {text:"Không thích",type:"none"}
    ]
  },

  {
    question:"Bạn thích UI design?",
    options:[
      {text:"Rất thích",type:"frontend"},
      {text:"Ổn",type:"frontend"},
      {text:"Không thích",type:"none"},
      {text:"Chưa thử",type:"none"}
    ]
  },

  {
    question:"Bạn từng làm API?",
    options:[
      {text:"Có",type:"backend"},
      {text:"Ít",type:"backend"},
      {text:"Chưa",type:"none"},
      {text:"Không biết",type:"none"}
    ]
  },

  {
    question:"Bạn quan tâm Machine Learning?",
    options:[
      {text:"Rất thích",type:"ai"},
      {text:"Tò mò",type:"ai"},
      {text:"Không",type:"none"},
      {text:"Không biết",type:"none"}
    ]
  },

  {
    question:"Bạn từng dùng Git?",
    options:[
      {text:"Thường xuyên",type:"backend"},
      {text:"Có dùng",type:"backend"},
      {text:"Chưa",type:"none"},
      {text:"Không biết",type:"none"}
    ]
  },

  {
    question:"Bạn thích làm giao diện?",
    options:[
      {text:"Rất thích",type:"frontend"},
      {text:"Ổn",type:"frontend"},
      {text:"Không",type:"none"},
      {text:"Chưa biết",type:"none"}
    ]
  },

  {
    question:"Bạn từng deploy website?",
    options:[
      {text:"Có",type:"backend"},
      {text:"Có nhưng ít",type:"backend"},
      {text:"Chưa",type:"none"},
      {text:"Không biết",type:"none"}
    ]
  },

  {
    question:"Bạn thích Data Science?",
    options:[
      {text:"Rất thích",type:"ai"},
      {text:"Tò mò",type:"ai"},
      {text:"Không",type:"none"},
      {text:"Chưa biết",type:"none"}
    ]
  },

  {
    question:"Bạn thích coding logic?",
    options:[
      {text:"Rất thích",type:"backend"},
      {text:"Ổn",type:"backend"},
      {text:"Không",type:"none"},
      {text:"Chưa biết",type:"none"}
    ]
  },

  {
    question:"Bạn muốn làm AI engineer?",
    options:[
      {text:"Rất muốn",type:"ai"},
      {text:"Có thể",type:"ai"},
      {text:"Không",type:"none"},
      {text:"Chưa biết",type:"none"}
    ]
  }

]

/** Điểm tối đa mỗi nhóm = số câu hỏi thuộc nhóm đó */
export const QUIZ_MAX: QuizScores = questions.reduce<QuizScores>(
  (acc, q) => {
    const types = new Set(q.options.map((o) => o.type))
    for (const t of types) if (t !== "none") acc[t] += 1
    return acc
  },
  { frontend: 0, backend: 0, ai: 0 }
)

/** Đổi điểm thô (0..max) sang phần trăm (0..100) */
export function toPercent(scores: QuizScores): QuizScores {
  const pct = (k: SkillKey) =>
    QUIZ_MAX[k] > 0 ? Math.min(100, Math.round((scores[k] / QUIZ_MAX[k]) * 100)) : 0
  return { frontend: pct("frontend"), backend: pct("backend"), ai: pct("ai") }
}

/** Lấy kết quả quiz của user (không lỗi nếu chưa có hoặc có nhiều dòng) */
export async function getQuizResult(userId: string): Promise<QuizScores | null> {
  const { data, error } = await supabase
    .from("quiz_results")
    .select("frontend, backend, ai")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn("Lỗi truy vấn quiz:", error.message)
    return null
  }
  return data
}

/** Lưu kết quả quiz: xóa kết quả cũ rồi ghi kết quả mới (mỗi user 1 dòng) */
export async function saveQuizResult(userId: string, scores: QuizScores) {
  const { error: deleteError } = await supabase
    .from("quiz_results")
    .delete()
    .eq("user_id", userId)
  if (deleteError) return deleteError

  const { error } = await supabase
    .from("quiz_results")
    .insert({ user_id: userId, ...scores })
  return error
}
