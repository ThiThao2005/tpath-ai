import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

/** Chuẩn hóa username: chữ thường, chỉ a-z 0-9 _ -, tối đa 30 ký tự */
export function normalizeUsername(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 30)
}

export const USERNAME_PATTERN = /^[a-z0-9_-]{3,30}$/

/**
 * Lấy username của user; nếu chưa có dòng trong bảng profiles thì tạo mới
 * (lấy từ metadata lúc đăng ký, hoặc phần trước @ của email).
 */
export async function ensureProfile(user: User): Promise<string | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  if (existing?.username) return existing.username

  const base =
    normalizeUsername(String(user.user_metadata?.username ?? "")) ||
    normalizeUsername(user.email?.split("@")[0] ?? "") ||
    "user"

  // Thử base, nếu trùng thì thêm hậu tố ngẫu nhiên
  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate =
      attempt === 0 && base.length >= 3
        ? base
        : `${base.slice(0, 24)}-${Math.random().toString(36).slice(2, 6)}`

    const { error } = await supabase
      .from("profiles")
      .insert({ id: user.id, username: candidate })

    if (!error) return candidate
    // 23505 = unique_violation (trùng username hoặc profile vừa được tạo ở tab khác)
    if (error.code !== "23505") {
      console.warn("Không tạo được profile:", error.message)
      return null
    }

    const { data: again } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()
    if (again?.username) return again.username
  }

  return null
}
