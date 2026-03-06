"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Project = {
  id: number
  title: string
}

export default function PortfolioPage(){

  const [projects,setProjects] = useState<Project[]>([])

  useEffect(()=>{
    const deleteProject = async(id:number)=>{
  await supabase
    .from("portfolio_projects")
    .delete()
    .eq("id",id)

  setProjects(projects.filter(p=>p.id!==id))
}

    const loadProjects = async()=>{

      const { data:userData } = await supabase.auth.getUser()
      const user = userData.user

      if(!user) return

      const { data } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("user_id",user.id)

      setProjects(data || [])

    }

    loadProjects()

  },[])

  return(

    <div className="p-10 max-w-3xl">

      <h1 className="text-3xl font-bold">
        My Portfolio Projects
      </h1>

      <div className="mt-6 space-y-4">

        {projects.map((p)=>(
          <div
            key={p.id}
            className="border p-4 rounded shadow"
          >
            {p.title}
          </div>
        ))}

      </div>

    </div>

  )

}