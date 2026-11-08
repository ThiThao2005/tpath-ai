-- ============================================================
-- ITPath AI - Row Level Security (RLS)
-- Chạy file này trong Supabase Dashboard → SQL Editor.
-- Có thể chạy lại nhiều lần (các policy cũ cùng tên sẽ bị thay thế).
-- ============================================================

-- ---------- Cột còn thiếu ----------
-- Dashboard lưu loại dự án (fe / be / ai / fs) vào cột này
alter table public.portfolio_projects add column if not exists tag text;

-- ---------- Dọn quiz trùng & đảm bảo mỗi user chỉ có 1 kết quả ----------
-- Giữ lại 1 dòng bất kỳ cho mỗi user, xóa các dòng còn lại.
delete from public.quiz_results a
using public.quiz_results b
where a.user_id = b.user_id
  and a.ctid > b.ctid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'quiz_results_user_id_key'
  ) then
    alter table public.quiz_results
      add constraint quiz_results_user_id_key unique (user_id);
  end if;
end $$;

-- ---------- Username duy nhất ----------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_username_key'
  ) then
    alter table public.profiles
      add constraint profiles_username_key unique (username);
  end if;
end $$;

-- ---------- Bật RLS ----------
alter table public.profiles            enable row level security;
alter table public.quiz_results        enable row level security;
alter table public.roadmap_progress    enable row level security;
alter table public.portfolio_projects  enable row level security;

-- ---------- profiles ----------
-- Ai cũng xem được (để trang /u/[username] công khai hoạt động)
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public" on public.profiles
  for select using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- quiz_results (chỉ chủ sở hữu) ----------
drop policy if exists "quiz_all_own" on public.quiz_results;
create policy "quiz_all_own" on public.quiz_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- roadmap_progress (chỉ chủ sở hữu) ----------
drop policy if exists "roadmap_all_own" on public.roadmap_progress;
create policy "roadmap_all_own" on public.roadmap_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- portfolio_projects ----------
-- Ai cũng xem được (hiển thị trên profile công khai), chỉ chủ sở hữu được sửa/xóa
drop policy if exists "portfolio_select_public" on public.portfolio_projects;
create policy "portfolio_select_public" on public.portfolio_projects
  for select using (true);

drop policy if exists "portfolio_insert_own" on public.portfolio_projects;
create policy "portfolio_insert_own" on public.portfolio_projects
  for insert with check (auth.uid() = user_id);

drop policy if exists "portfolio_update_own" on public.portfolio_projects;
create policy "portfolio_update_own" on public.portfolio_projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "portfolio_delete_own" on public.portfolio_projects;
create policy "portfolio_delete_own" on public.portfolio_projects
  for delete using (auth.uid() = user_id);
