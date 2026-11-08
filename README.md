# ITPath AI

Trợ lý lộ trình IT: làm **quiz đánh giá kỹ năng**, nhận **lộ trình học**, được **AI gợi ý dự án** và quản lý **portfolio** có trang hồ sơ công khai.

**Công nghệ:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Supabase (Auth + Postgres) · Google Gemini

## Tính năng

| Đường dẫn | Mô tả | Cần đăng nhập |
|---|---|---|
| `/` | Trang chủ, lối vào các tính năng | – |
| `/register`, `/login` | Đăng ký (email + username), đăng nhập email hoặc Google | – |
| `/quiz` | 15 câu hỏi, chấm điểm Frontend / Backend / AI | ✅ |
| `/dashboard` | Chỉ số kỹ năng (%), thêm/sửa/xóa/lọc dự án portfolio | ✅ |
| `/roadmap` | Tạo lộ trình học, đánh dấu hoàn thành, theo dõi tiến độ | ✅ |
| `/projects` | Gemini gợi ý 5 dự án theo kết quả quiz | ✅ |
| `/portfolio` | Xem / xóa dự án đã lưu | ✅ |
| `/u/[username]` | Hồ sơ công khai: username + danh sách dự án | – |

**Luồng sử dụng:** Đăng ký → Làm Quiz → Xem Dashboard → Tạo Roadmap → Nhận gợi ý dự án → Thêm dự án vào Portfolio → Chia sẻ link `/u/<username>`.

## Cài đặt

```bash
npm install
```

Tạo file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>   # hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY
GEMINI_API_KEY=<google ai studio key>
```

### Database (Supabase)

Cần các bảng:

- `profiles (id uuid = auth.users.id, username text unique)`
- `quiz_results (user_id uuid, frontend int, backend int, ai int)`
- `roadmap_progress (id, user_id uuid, skill text, step text, completed bool, created_at)`
- `portfolio_projects (id, user_id uuid, title text, description text, link text, tag text, created_at)`

Sau đó mở **SQL Editor** và chạy [`supabase/rls.sql`](supabase/rls.sql) để bật Row Level Security (mỗi người chỉ đọc/ghi được dữ liệu của mình; `profiles` và `portfolio_projects` thì ai cũng đọc được để trang hồ sơ công khai hoạt động).

Nếu dùng đăng nhập Google: thêm URL của site (ví dụ `http://localhost:3000/**` và domain khi deploy) vào **Authentication → URL Configuration → Redirect URLs**.

## Chạy

```bash
npm run dev
```

Mở http://localhost:3000.

## Cấu trúc

```
app/
  (auth)/login, register     # trang đăng nhập / đăng ký
  (protected)/...            # các trang yêu cầu đăng nhập (bọc bởi RequireAuth)
  api/generate-roadmap       # tạo roadmap (xác thực bằng access token)
  api/recommend-projects     # gọi Gemini gợi ý dự án
  u/[username]               # hồ sơ công khai (server component)
components/RequireAuth.tsx   # chặn truy cập khi chưa đăng nhập
lib/supabase.ts              # Supabase client
lib/quiz.ts                  # câu hỏi quiz, quy đổi %, đọc/ghi kết quả
lib/profile.ts               # tạo/lấy username
supabase/rls.sql             # chính sách bảo mật RLS
```
