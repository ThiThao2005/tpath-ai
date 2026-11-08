import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Luôn lấy dữ liệu mới nhất (không cache trang hồ sơ)
export const dynamic = "force-dynamic"

type PublicProject = {
  id: string
  title: string
  description: string | null
  link: string | null
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  // Đọc trực tiếp từ Supabase (RLS cho phép đọc công khai profiles & portfolio_projects)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", decodeURIComponent(username).toLowerCase())
    .maybeSingle()

  if (!profile) notFound()

  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("id, title, description, link")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  const list = (projects ?? []) as PublicProject[]

  return (
    <div className="max-w-3xl mx-auto p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold">@{profile.username}</h1>
          <p className="text-gray-500">{list.length} dự án trong portfolio</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Projects</h2>

      {list.length === 0 ? (
        <p className="text-gray-400 italic">Người dùng này chưa thêm dự án nào.</p>
      ) : (
        <div className="space-y-4">
          {list.map((p) => (
            <div key={p.id} className="border p-4 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg">{p.title}</h3>
              <p className="text-gray-600">{p.description || "Không có mô tả."}</p>
              {p.link && /^https?:\/\//i.test(p.link) && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline mt-1"
                >
                  View project <ExternalLink size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Link href="/" className="inline-block mt-10 text-sm text-gray-400 hover:text-gray-600">
        ← ITPath AI
      </Link>
    </div>
  )
}
