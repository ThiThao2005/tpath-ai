const GITHUB_RE = /\s*GitHub:\s*(https:\/\/github\.com\/[^\s]+)\s*$/i

/**
 * Tách link GitHub (dạng "... GitHub: https://github.com/...") ra khỏi mô tả,
 * để hiển thị thành nút riêng.
 */
export function splitGithub(description: string | null | undefined) {
  const text = description ?? ""
  const m = text.match(GITHUB_RE)
  if (!m) return { text: text.trim(), github: null as string | null }
  return { text: text.replace(GITHUB_RE, "").trim(), github: m[1] }
}

/** Chỉ cho phép link http(s) để tránh link độc (javascript:...) */
export function isSafeUrl(url: string | null | undefined): url is string {
  return !!url && /^https?:\/\//i.test(url)
}
