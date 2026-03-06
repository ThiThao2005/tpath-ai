"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

type SkillType = "frontend" | "backend" | "ai" | "none"

const questions = [

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

export default function Quiz(){

  const router = useRouter()

  const [index,setIndex] = useState(0)

  const [loading,setLoading] = useState(false)

  const [scores,setScores] = useState({
    frontend:0,
    backend:0,
    ai:0
  })

  const handleAnswer = async (type:SkillType)=>{

    const newScore = {...scores}

    if(type !== "none"){
      newScore[type] += 1
    }

    setScores(newScore)

    if(index < questions.length-1){
      setIndex(index+1)
    }else{

      setLoading(true)

      const { data } = await supabase.auth.getUser()

      const user = data.user

      if(!user){
        alert("User not logged in")
        return
      }

      await supabase.from("quiz_results").insert({

        user_id:user.id,
        frontend:newScore.frontend,
        backend:newScore.backend,
        ai:newScore.ai

      })

      alert("Quiz completed!")

      router.push("/dashboard")

    }

  }

  const q = questions[index]

  const progress = Math.round((index/questions.length)*100)

  return(

    <div className="max-w-xl mx-auto p-10">

      <h1 className="text-2xl font-bold">
        Skill Assessment Quiz
      </h1>

      <p className="text-gray-500 mt-2">
        Question {index+1} / {questions.length}
      </p>

      {/* progress bar */}

      <div className="w-full bg-gray-200 h-3 rounded mt-4">

        <div
          className="bg-black h-3 rounded"
          style={{width:`${progress}%`}}
        />

      </div>

      <h2 className="mt-8 text-lg">
        {q.question}
      </h2>

      <div className="mt-4 space-y-3">

        {q.options.map((o,i)=>(

          <button
            key={i}
            className="block border p-3 w-full text-left hover:bg-gray-100"
            onClick={()=>handleAnswer(o.type as SkillType)}
            disabled={loading}
          >
            {o.text}
          </button>

        ))}

      </div>

      {loading && (
        <p className="mt-6 text-gray-500">
          Saving result...
        </p>
      )}

    </div>

  )
}