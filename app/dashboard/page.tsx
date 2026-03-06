"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Project = {
  id: string
  title: string
  description: string
  link: string
}

type Quiz = {
  frontend: number
  backend: number
  ai: number
}

export default function Dashboard() {

  const [projects,setProjects] = useState<Project[]>([])
  const [quiz,setQuiz] = useState<Quiz | null>(null)
  const [loading,setLoading] = useState(true)

  const [title,setTitle] = useState("")
  const [description,setDescription] = useState("")
  const [link,setLink] = useState("")

  async function loadData(){

    const { data:user } = await supabase.auth.getUser()

    if(!user?.user) return

    const uid = user.user.id

    const { data:projectData } = await supabase
      .from("portfolio_projects")
      .select("*")
      .eq("user_id",uid)

    const { data:quizData } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id",uid)
      .single()

    setProjects(projectData || [])
    setQuiz(quizData)
    setLoading(false)

  }

  useEffect(()=>{
    loadData()
  },[])

  async function addProject(){

    const { data:user } = await supabase.auth.getUser()

    if(!user?.user) return

    await supabase.from("portfolio_projects").insert({

      user_id:user.user.id,
      title,
      description,
      link

    })

    setTitle("")
    setDescription("")
    setLink("")

    loadData()

  }

  if(loading){
    return <div className="p-10">Loading...</div>
  }

  return(

    <div className="max-w-4xl mx-auto p-10 space-y-10">

      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      {/* QUIZ RESULT */}

      {quiz && (

        <div className="border p-4 rounded">

          <h2 className="font-bold mb-4">
            Skill Progress
          </h2>

          <div className="space-y-2">

            <p>Frontend: {quiz.frontend}</p>
            <p>Backend: {quiz.backend}</p>
            <p>AI: {quiz.ai}</p>

          </div>

        </div>

      )}

      {/* ADD PROJECT */}

      <div className="border p-4 rounded space-y-3">

        <h2 className="font-bold">
          Add Project
        </h2>

        <input
          className="border p-2 w-full"
          placeholder="Project title"
          value={title}
          onChange={e=>setTitle(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={e=>setDescription(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="Project link"
          value={link}
          onChange={e=>setLink(e.target.value)}
        />

        <button
          onClick={addProject}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Project
        </button>

      </div>

      {/* PROJECT LIST */}

      <div>

        <h2 className="font-bold mb-4">
          Your Projects
        </h2>

        <div className="space-y-4">

          {projects.map(p=>(

            <div
              key={p.id}
              className="border p-4 rounded"
            >

              <h3 className="font-bold">
                {p.title}
              </h3>

              <p className="text-gray-600">
                {p.description}
              </p>

              <a
                href={p.link}
                className="text-blue-500"
                target="_blank"
              >
                View project
              </a>

            </div>

          ))}

        </div>

      </div>

    </div>

  )
}