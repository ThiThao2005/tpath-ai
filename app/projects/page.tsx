"use client"

import { useState } from "react"

export default function ProjectsPage(){

  const [projects,setProjects] = useState<string[]>([])

  const loadProjects = async()=>{

    const res = await fetch("/api/recommend-projects",{
      method:"POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ skills: "React, Node.js, TypeScript" })
    })

    const data = await res.json()

    setProjects([data.result])

  }

  return(

    <div className="p-10 max-w-2xl">

      <h1 className="text-3xl font-bold">
        Recommended Projects
      </h1>

      <button
        onClick={loadProjects}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Get Project Ideas
      </button>

      <div className="mt-8 space-y-3">

        {projects.map((p,i)=>(
          <div
            key={i}
            className="border p-3 rounded"
          >
            {p}
          </div>
        ))}

      </div>

    </div>

  )

}