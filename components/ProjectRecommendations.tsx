"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Project {
  id: number
  title: string
  description: string
  difficulty: string
  stack: string[]
}
export default function ProjectRecommendations() {
  const [savingId, setSavingId] = useState<number | null>(null);
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const saveProject = async (project: Project) => {
  try {

    setSavingId(project.id)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user) {
      alert("Bạn cần đăng nhập trước")
      setSavingId(null)
      return
    }

    const { error } = await supabase
      .from("portfolio_projects")
      .insert({
        user_id: user.id,
        title: project.title,
        description: project.description,
        difficulty: project.difficulty,
        stack: project.stack
      })

    if (error) throw error

    alert("Saved to portfolio 🎉")

  } catch (err) {

    console.error(err)
    alert("Lưu thất bại")

  } finally {

    setSavingId(null)

  }
}

  const handleRecommend = async () => {
    setProjects([]);
    setError("");

    const trimmedSkills = skills.trim();

    if (!trimmedSkills) {
      setError("Vui lòng nhập ít nhất một kỹ năng (ví dụ: React)");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/recommend-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: trimmedSkills,
        }),
      });

      if (!res.ok) {
        throw new Error("AI không phản hồi");
      }

      const data = await res.json();

     // Lấy trực tiếp mảng projects từ JSON mà API trả về
const formatted: Project[] = data.projects.map(
  (p: any, index: number) => ({
    id: index + 1,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty, // Cột mới
    stack: p.stack // Cột mới (mảng các công nghệ)
  })
);

setProjects(formatted);

      if (formatted.length === 0) {
        setError("AI không thể tạo project phù hợp");
      } else {
        setProjects(formatted);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 w-full max-w-4xl mx-auto">

      {/* INPUT CARD */}
      <div className="p-8 bg-white border rounded-3xl shadow-lg mb-8">

        <h2 className="text-3xl font-bold mb-4">
          🚀 AI Project Ideas
        </h2>

        <p className="text-gray-500 mb-6">
          Nhập kỹ năng của bạn, AI sẽ gợi ý dự án portfolio
        </p>

        <input
          type="text"
          placeholder="React, NodeJS, Python..."
          className="border p-4 w-full rounded-xl mb-4"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />

        <button
          onClick={handleRecommend}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
        >
          {loading ? "AI đang suy nghĩ..." : "🤖 Gợi ý dự án"}
        </button>

      </div>

      {/* ERROR */}
      {error && (
        <div className="p-4 bg-red-100 text-red-600 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* PROJECT LIST */}
      {projects.length > 0 && (

        <div className="space-y-6">

          <h3 className="text-xl font-bold">
            5 ý tưởng dự án dành cho bạn
          </h3>

          {projects.map((project) => (

            <div
              key={project.id}
              className="p-6 bg-white border rounded-2xl shadow hover:shadow-lg transition"
            >

<div className="flex gap-2 flex-wrap mt-3">
  {project.stack.map((tech)=>(
    <span
      key={tech}
      className="px-3 py-1 bg-gray-100 text-sm rounded-full"
    >
      {tech}
    </span>
  ))}
</div>
             

             {/* CHÈN NÚT CỦA BẠN VÀO ĐÂY */}
          <button
  onClick={() => saveProject(project)}
  disabled={savingId === project.id} // Vô hiệu hóa khi đang lưu
  className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 ${
    savingId === project.id
      ? "bg-gray-400 cursor-not-allowed text-white"
      : "bg-green-500 hover:bg-green-600 text-white"
  }`}
>
  {savingId === project.id ? (
    <>
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Đang lưu...
    </>
  ) : (
    <>💾 Save Project</>
  )}
</button>

            </div>

          ))}

        </div>

      )}
    </div>
  );
}