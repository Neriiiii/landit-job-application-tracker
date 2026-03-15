insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes',
  'resumes',
  true,
  5242880,
  array['application/pdf']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cover-letters',
  'cover-letters',
  true,
  5242880,
  array['application/pdf']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

create policy "Users can upload own resumes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can read own resumes"
  on storage.objects for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own resumes"
  on storage.objects for update to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own resumes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload own cover letters"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'cover-letters' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can read own cover letters"
  on storage.objects for select to authenticated
  using (bucket_id = 'cover-letters' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own cover letters"
  on storage.objects for update to authenticated
  using (bucket_id = 'cover-letters' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own cover letters"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cover-letters' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can upload own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can read own avatar"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can update own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users can delete own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Public read avatars"
  on storage.objects for select to public using (bucket_id = 'avatars');

create table if not exists public.resume_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  file_path text not null,
  file_size bigint,
  role text,
  uploaded_at timestamptz not null default now(),
  is_fake boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists resume_files_user_id_idx on public.resume_files (user_id);
alter table public.resume_files enable row level security;
create policy "Users can view own resume files" on public.resume_files for select using (auth.uid() = user_id);
create policy "Users can insert own resume files" on public.resume_files for insert with check (auth.uid() = user_id);
create policy "Users can update own resume files" on public.resume_files for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own resume files" on public.resume_files for delete using (auth.uid() = user_id);

create table if not exists public.cover_letter_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  file_path text not null,
  file_size bigint,
  is_fake boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists cover_letter_files_user_id_idx on public.cover_letter_files (user_id);
alter table public.cover_letter_files enable row level security;
create policy "Users can view own cover letter files" on public.cover_letter_files for select using (auth.uid() = user_id);
create policy "Users can insert own cover letter files" on public.cover_letter_files for insert with check (auth.uid() = user_id);
create policy "Users can delete own cover letter files" on public.cover_letter_files for delete using (auth.uid() = user_id);

create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weekly_application_goal integer not null default 10 check (weekly_application_goal >= 1 and weekly_application_goal <= 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);
create index if not exists user_settings_user_id_idx on public.user_settings (user_id);
create trigger user_settings_updated_at before update on public.user_settings for each row execute function public.set_updated_at();
alter table public.user_settings enable row level security;
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update using (auth.uid() = user_id);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  link text,
  status text not null default 'Not started' check (status in ('Not started', 'In progress', 'Done')),
  sort_order integer not null default 0,
  is_fake boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists checklist_items_user_sort_idx on public.checklist_items (user_id, sort_order);
create trigger checklist_items_updated_at before update on public.checklist_items for each row execute function public.set_updated_at();
alter table public.checklist_items enable row level security;
create policy "Users can view own checklist items" on public.checklist_items for select using (auth.uid() = user_id);
create policy "Users can insert own checklist items" on public.checklist_items for insert with check (auth.uid() = user_id);
create policy "Users can update own checklist items" on public.checklist_items for update using (auth.uid() = user_id);
create policy "Users can delete own checklist items" on public.checklist_items for delete using (auth.uid() = user_id);
