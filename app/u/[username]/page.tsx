import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { computeStats, toView, type PortfolioProject } from "@/lib/interview"
import { InterviewCard, StatsOverview, SummaryTable } from "@/components/InterviewProject"

// Luôn lấy dữ liệu mới nhất (không cache trang hồ sơ)
export const dynamic = "force-dynamic"

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

  // select("*") để vẫn chạy được khi database chưa có cột `details`
  const { data: projects } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  const views = ((projects ?? []) as PortfolioProject[]).map(toView)
  const stats = computeStats(views)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 pt-5">
          <Link href="/" className="text-sm text-slate-400 hover:text-white">← ITPath AI</Link>
        </div>
        <div className="max-w-5xl mx-auto px-6 pt-6 pb-10 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">@{profile.username}</h1>
            <p className="text-slate-400">
              {views.length} dự án
              {stats.deployed > 0 && ` · ${stats.deployed} đã deploy`}
              {stats.stackCount > 0 && ` · ${stats.stackCount} công nghệ`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8 space-y-6">
        {views.length === 0 ? (
          <p className="text-slate-400 italic">Người dùng này chưa thêm dự án nào.</p>
        ) : (
          <>
            <StatsOverview stats={stats} />
            <SummaryTable projects={views} />
            <h2 className="text-sm font-semibold text-slate-800 pt-2">Chi tiết dự án</h2>
            <div className="space-y-6">
              {views.map((p, i) => (
                <InterviewCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
