import { isSafeUrl, splitGithub } from "@/lib/project"

/**
 * Thông tin dự án theo kiểu "kể chuyện khi phỏng vấn" (STAR):
 *  - Bối cảnh / bài toán (Situation + Task)
 *  - Mình đã làm gì (Action)
 *  - Khó khăn & cách giải quyết
 *  - Kết quả (Result)
 * Lưu trong cột jsonb `details` của bảng portfolio_projects.
 */
export type Challenge = { problem: string; solution: string }
export type InterviewQA = { q: string; a: string }

export type InterviewDetails = {
  pitch: string        // Giới thiệu 30 giây
  role: string         // Vai trò trong dự án
  period: string       // Thời gian làm (tùy chọn)
  stack: string[]      // Công nghệ
  context: string      // Bối cảnh / bài toán
  actions: string[]    // Mình đã làm
  challenges: Challenge[]
  results: string[]    // Kết quả
  questions: InterviewQA[] // Câu hỏi phỏng vấn hay gặp + gợi ý trả lời (chỉ hiện ở trang riêng)
}

export type Tag = "fe" | "be" | "ai" | "fs"

export const TAG_LABEL: Record<Tag, string> = {
  fe: "Frontend",
  be: "Backend",
  ai: "AI / Data",
  fs: "Fullstack",
}

export type PortfolioProject = {
  id: string
  title: string
  description: string | null
  link: string | null
  tag?: string | null
  details?: unknown
}

// ─── Đọc dữ liệu jsonb an toàn ────────────────────────────────────────────────

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "")
const strList = (v: unknown) =>
  Array.isArray(v) ? v.map(str).filter(Boolean) : []

/** Chuẩn hóa giá trị jsonb (có thể null / sai kiểu) thành InterviewDetails, hoặc null nếu trống. */
export function parseDetails(raw: unknown): InterviewDetails | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>

  const challenges = Array.isArray(r.challenges)
    ? r.challenges
        .map((c) => {
          const o = (c ?? {}) as Record<string, unknown>
          return { problem: str(o.problem), solution: str(o.solution) }
        })
        .filter((c) => c.problem || c.solution)
    : []

  const questions = Array.isArray(r.questions)
    ? r.questions
        .map((x) => {
          const o = (x ?? {}) as Record<string, unknown>
          return { q: str(o.q), a: str(o.a) }
        })
        .filter((x) => x.q)
    : []

  const d: InterviewDetails = {
    pitch: str(r.pitch),
    role: str(r.role),
    period: str(r.period),
    stack: strList(r.stack),
    context: str(r.context),
    actions: strList(r.actions),
    challenges,
    results: strList(r.results),
    questions,
  }

  const empty =
    !d.pitch && !d.role && !d.period && !d.context &&
    d.stack.length + d.actions.length + d.challenges.length + d.results.length + d.questions.length === 0
  return empty ? null : d
}

// ─── Chuyển đổi qua lại với form (mỗi dòng = 1 ý) ─────────────────────────────

export const PAIR_SEP = "=>"

export type DetailsForm = {
  pitch: string
  role: string
  period: string
  stack: string      // phân cách bằng dấu phẩy
  context: string
  actions: string    // mỗi dòng 1 ý
  challenges: string // mỗi dòng: Vấn đề => Cách giải quyết
  results: string    // mỗi dòng 1 ý
  questions: string  // mỗi dòng: Câu hỏi => Gợi ý trả lời
}

export const EMPTY_DETAILS_FORM: DetailsForm = {
  pitch: "", role: "", period: "", stack: "", context: "",
  actions: "", challenges: "", results: "", questions: "",
}

const lines = (s: string) =>
  s.split("\n").map((l) => l.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean)

function splitPair(line: string) {
  const i = line.indexOf(PAIR_SEP)
  if (i === -1) return [line.trim(), ""] as const
  return [line.slice(0, i).trim(), line.slice(i + PAIR_SEP.length).trim()] as const
}

export function detailsToForm(d: InterviewDetails | null): DetailsForm {
  if (!d) return EMPTY_DETAILS_FORM
  return {
    pitch: d.pitch,
    role: d.role,
    period: d.period,
    stack: d.stack.join(", "),
    context: d.context,
    actions: d.actions.join("\n"),
    challenges: d.challenges
      .map((c) => (c.solution ? `${c.problem} ${PAIR_SEP} ${c.solution}` : c.problem))
      .join("\n"),
    results: d.results.join("\n"),
    questions: d.questions
      .map((x) => (x.a ? `${x.q} ${PAIR_SEP} ${x.a}` : x.q))
      .join("\n"),
  }
}

export function formToDetails(f: DetailsForm): InterviewDetails | null {
  return parseDetails({
    pitch: f.pitch,
    role: f.role,
    period: f.period,
    stack: f.stack.split(",").map((s) => s.trim()).filter(Boolean),
    context: f.context,
    actions: lines(f.actions),
    challenges: lines(f.challenges).map((l) => {
      const [problem, solution] = splitPair(l)
      return { problem, solution }
    }),
    results: lines(f.results),
    questions: lines(f.questions).map((l) => {
      const [q, a] = splitPair(l)
      return { q, a }
    }),
  })
}

// ─── Gom dữ liệu để hiển thị ─────────────────────────────────────────────────

export type ProjectView = {
  id: string
  title: string
  tag: Tag | null
  demo: string | null
  github: string | null
  summary: string          // pitch, hoặc mô tả cũ nếu chưa có details
  details: InterviewDetails | null
}

export function toView(p: PortfolioProject): ProjectView {
  const { text, github } = splitGithub(p.description)
  const details = parseDetails(p.details)
  const tag = p.tag && p.tag in TAG_LABEL ? (p.tag as Tag) : null
  return {
    id: p.id,
    title: p.title,
    tag,
    demo: isSafeUrl(p.link) ? p.link : null,
    github,
    summary: details?.pitch || text,
    details,
  }
}

export type PortfolioStats = {
  total: number
  deployed: number
  withGithub: number
  byTag: { tag: Tag; label: string; count: number }[]
  topStack: { name: string; count: number }[]
  stackCount: number
}

export function computeStats(list: ProjectView[]): PortfolioStats {
  const tagCount = new Map<Tag, number>()
  const stack = new Map<string, { name: string; count: number }>()

  for (const p of list) {
    if (p.tag) tagCount.set(p.tag, (tagCount.get(p.tag) ?? 0) + 1)
    const seen = new Set<string>()
    for (const s of p.details?.stack ?? []) {
      const key = s.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      const cur = stack.get(key)
      if (cur) cur.count++
      else stack.set(key, { name: s, count: 1 })
    }
  }

  return {
    total: list.length,
    deployed: list.filter((p) => p.demo).length,
    withGithub: list.filter((p) => p.github).length,
    byTag: (Object.keys(TAG_LABEL) as Tag[])
      .map((tag) => ({ tag, label: TAG_LABEL[tag], count: tagCount.get(tag) ?? 0 }))
      .filter((t) => t.count > 0),
    topStack: [...stack.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    stackCount: stack.size,
  }
}
