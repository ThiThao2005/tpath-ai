import {
  Code2, ExternalLink, Target, Wrench, Trophy, Lightbulb,
  MessagesSquare, Quote, Rocket, FolderGit2, Layers, Cpu,
} from "lucide-react"
import { TAG_LABEL, type PortfolioStats, type ProjectView, type Tag } from "@/lib/interview"

// Các component chỉ hiển thị (không dùng hook) → dùng được cả ở Server và Client Component.

const TAG_COLOR: Record<Tag, string> = {
  fe: "bg-orange-100 text-orange-700",
  be: "bg-blue-100 text-blue-700",
  ai: "bg-purple-100 text-purple-700",
  fs: "bg-emerald-100 text-emerald-700",
}

export function TagBadge({ tag }: { tag: Tag | null }) {
  if (!tag) return null
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${TAG_COLOR[tag]}`}>
      {TAG_LABEL[tag]}
    </span>
  )
}

function StackChips({ stack, max }: { stack: string[]; max?: number }) {
  const shown = max ? stack.slice(0, max) : stack
  const rest = stack.length - shown.length
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((s) => (
        <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          {s}
        </span>
      ))}
      {rest > 0 && <span className="text-xs px-1 py-0.5 text-slate-400">+{rest}</span>}
    </div>
  )
}

// ─── Thống kê tổng quan ──────────────────────────────────────────────────────

function Tile({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: number; sub: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider">
        {icon} {label}
      </div>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}

export function StatsOverview({ stats }: { stats: PortfolioStats }) {
  return (
    <section className="space-y-4 break-inside-avoid">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Tile icon={<FolderGit2 size={14} />} label="Dự án" value={stats.total} sub="trong hồ sơ" />
        <Tile icon={<Rocket size={14} />} label="Đã deploy" value={stats.deployed} sub="có link chạy thật" />
        <Tile icon={<Code2 size={14} />} label="Có mã nguồn" value={stats.withGithub} sub="public trên GitHub" />
        <Tile icon={<Cpu size={14} />} label="Công nghệ" value={stats.stackCount} sub="đã dùng trong dự án" />
      </div>

      {(stats.byTag.length > 0 || stats.topStack.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          {stats.byTag.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Layers size={14} /> Mảng đã làm
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.byTag.map((t) => (
                  <span key={t.tag} className={`text-sm px-3 py-1 rounded-full font-medium ${TAG_COLOR[t.tag]}`}>
                    {t.label} · {t.count}
                  </span>
                ))}
              </div>
            </div>
          )}
          {stats.topStack.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Cpu size={14} /> Công nghệ dùng nhiều nhất (số dự án)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stats.topStack.map((s) => (
                  <span
                    key={s.name}
                    className="text-xs pl-2 pr-1 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 inline-flex items-center gap-1.5"
                  >
                    {s.name}
                    <span className="bg-slate-900 text-white rounded px-1.5 text-[10px] leading-4">{s.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ─── Bảng tóm tắt (giống phần "Dự án" trong CV) ──────────────────────────────

export function SummaryTable({ projects }: { projects: ProjectView[] }) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden break-inside-avoid">
      <h2 className="px-5 pt-4 pb-2 text-sm font-semibold text-slate-800">Tóm tắt nhanh</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left font-medium px-5 py-2 w-8">#</th>
              <th className="text-left font-medium px-3 py-2">Dự án</th>
              <th className="text-left font-medium px-3 py-2">Vai trò</th>
              <th className="text-left font-medium px-3 py-2">Công nghệ chính</th>
              <th className="text-left font-medium px-3 py-2 print:hidden">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((p, i) => (
              <tr key={p.id} className="align-top">
                <td className="px-5 py-3 text-slate-400">{i + 1}</td>
                <td className="px-3 py-3 min-w-48">
                  <a href={`#p-${p.id}`} className="font-medium text-slate-800 hover:text-blue-600">
                    {p.title}
                  </a>
                  <div className="mt-1"><TagBadge tag={p.tag} /></div>
                </td>
                <td className="px-3 py-3 text-slate-600 min-w-40">{p.details?.role || "—"}</td>
                <td className="px-3 py-3 min-w-48">
                  {p.details?.stack.length ? <StackChips stack={p.details.stack} max={4} /> : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-3 py-3 whitespace-nowrap print:hidden">
                  <div className="flex gap-3">
                    {p.demo && (
                      <a href={p.demo} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                        Demo <ExternalLink size={12} />
                      </a>
                    )}
                    {p.github && (
                      <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:underline inline-flex items-center gap-1">
                        <Code2 size={12} /> Code
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Thẻ dự án theo khung STAR ───────────────────────────────────────────────

function Section({
  icon, title, hint, children,
}: { icon: React.ReactNode; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
        {icon} {title}
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{hint}</span>
      </h4>
      {children}
    </div>
  )
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-slate-600 leading-relaxed">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function InterviewCard({
  project: p, index, showPrep = false, actions,
}: {
  project: ProjectView
  index: number
  /** Hiện phần "câu hỏi phỏng vấn" (chỉ ở trang riêng, không hiện ở hồ sơ công khai) */
  showPrep?: boolean
  /** Nút thêm (vd: Xóa) ở góc thẻ */
  actions?: React.ReactNode
}) {
  const d = p.details

  return (
    <article
      id={`p-${p.id}`}
      className="scroll-mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden break-inside-avoid"
    >
      {/* Header */}
      <header className="p-5 md:p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg md:text-xl font-bold text-slate-900 break-words">{p.title}</h3>
              <TagBadge tag={p.tag} />
            </div>
            {(d?.role || d?.period) && (
              <p className="text-sm text-slate-500 mt-0.5">
                {[d?.role, d?.period].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-3 print:hidden">
              {p.demo && (
                <a
                  href={p.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={13} /> Xem demo
                </a>
              )}
              {p.github && (
                <a
                  href={p.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:opacity-90 transition-opacity"
                >
                  <Code2 size={13} /> GitHub
                </a>
              )}
              {actions}
            </div>
            {/* Khi in: hiện link dạng chữ */}
            <p className="hidden print:block text-xs text-slate-500 mt-2 break-all">
              {[p.demo && `Demo: ${p.demo}`, p.github && `GitHub: ${p.github}`].filter(Boolean).join("  ·  ")}
            </p>
          </div>
        </div>
      </header>

      <div className="p-5 md:p-6 space-y-6">
        {/* Giới thiệu 30 giây */}
        {p.summary && (
          <div className="relative bg-blue-50/60 border border-blue-100 rounded-xl p-4 pl-11">
            <Quote size={18} className="absolute left-4 top-4 text-blue-400" />
            {d?.pitch && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mb-1">Giới thiệu trong 30 giây</p>
            )}
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{p.summary}</p>
          </div>
        )}

        {d?.stack.length ? <StackChips stack={d.stack} /> : null}

        {d ? (
          <>
            {d.context && (
              <Section icon={<Target size={16} className="text-rose-500" />} title="Bối cảnh & mục tiêu" hint="Situation · Task">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{d.context}</p>
              </Section>
            )}

            {d.actions.length > 0 && (
              <Section icon={<Wrench size={16} className="text-amber-500" />} title="Mình đã làm gì" hint="Action">
                <Bullets items={d.actions} />
              </Section>
            )}

            {d.challenges.length > 0 && (
              <Section icon={<Lightbulb size={16} className="text-violet-500" />} title="Khó khăn & cách giải quyết" hint="Điểm nhấn kỹ thuật">
                <div className="space-y-2">
                  {d.challenges.map((c, i) => (
                    <div key={i} className="grid md:grid-cols-2 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200 text-sm">
                      <div className="bg-rose-50/70 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 mb-0.5">Vấn đề</p>
                        <p className="text-slate-700 leading-relaxed">{c.problem}</p>
                      </div>
                      <div className="bg-emerald-50/70 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 mb-0.5">Cách giải quyết</p>
                        <p className="text-slate-700 leading-relaxed">{c.solution || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {d.results.length > 0 && (
              <Section icon={<Trophy size={16} className="text-emerald-500" />} title="Kết quả" hint="Result">
                <Bullets items={d.results} />
              </Section>
            )}

            {showPrep && d.questions.length > 0 && (
              <details className="group bg-slate-50 border border-slate-200 rounded-xl print:hidden">
                <summary className="cursor-pointer select-none list-none flex items-center gap-2 p-4 text-sm font-semibold text-slate-800">
                  <MessagesSquare size={16} className="text-blue-500" />
                  Câu hỏi nhà tuyển dụng có thể hỏi ({d.questions.length})
                  <span className="ml-auto text-xs font-normal text-slate-400 group-open:hidden">Bấm để mở</span>
                </summary>
                <div className="px-4 pb-4 space-y-3">
                  {d.questions.map((x, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-slate-800">❓ {x.q}</p>
                      {x.a && <p className="text-sm text-slate-600 leading-relaxed mt-1.5">💬 {x.a}</p>}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        ) : (
          showPrep && (
            <p className="text-xs text-slate-400 italic print:hidden">
              Dự án này chưa có thông tin phỏng vấn. Vào Dashboard → Sửa → “Thông tin phỏng vấn” để bổ sung.
            </p>
          )
        )}
      </div>
    </article>
  )
}
