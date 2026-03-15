create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  expected_salary text,
  salary_offer text,
  benefits text,
  start_date date,
  work_days text,
  work_time_start text,
  work_time_end text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(application_id)
);
create index if not exists job_offers_application_id_idx on public.job_offers (application_id);
create trigger job_offers_updated_at before update on public.job_offers for each row execute function public.set_updated_at();
alter table public.job_offers enable row level security;
create policy "Users can manage job_offers via own applications"
  on public.job_offers for all
  using (exists (select 1 from public.job_applications j where j.id = job_offers.application_id and j.user_id = auth.uid()))
  with check (exists (select 1 from public.job_applications j where j.id = job_offers.application_id and j.user_id = auth.uid()));

create table if not exists public.interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  round_number integer not null default 1,
  round_label text,
  date date,
  time time,
  interview_type text check (interview_type in ('Phone', 'Video', 'Onsite')),
  meeting_link text,
  status text check (status in ('Scheduled', 'Completed', 'Missed', 'Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists interviews_application_id_idx on public.interviews (application_id);
create index if not exists interviews_user_id_idx on public.interviews (user_id);
create trigger interviews_updated_at before update on public.interviews for each row execute function public.set_updated_at();
alter table public.interviews enable row level security;
create policy "Users can view own interviews" on public.interviews for select using (auth.uid() = user_id);
create policy "Users can insert own interviews" on public.interviews for insert with check (auth.uid() = user_id);
create policy "Users can update own interviews" on public.interviews for update using (auth.uid() = user_id);
create policy "Users can delete own interviews" on public.interviews for delete using (auth.uid() = user_id);

create table if not exists public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.job_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_at timestamptz not null default now()
);
create index if not exists application_status_history_application_id_idx on public.application_status_history (application_id);
create index if not exists application_status_history_user_id_idx on public.application_status_history (user_id);
alter table public.application_status_history enable row level security;
create policy "Users can view own application_status_history" on public.application_status_history for select using (auth.uid() = user_id);
create policy "Users can insert own application_status_history" on public.application_status_history for insert with check (auth.uid() = user_id);

create table if not exists public.job_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists job_links_user_id_idx on public.job_links (user_id);
create trigger job_links_updated_at before update on public.job_links for each row execute function public.set_updated_at();
alter table public.job_links enable row level security;
create policy "Users can view own job_links" on public.job_links for select using (auth.uid() = user_id);
create policy "Users can insert own job_links" on public.job_links for insert with check (auth.uid() = user_id);
create policy "Users can update own job_links" on public.job_links for update using (auth.uid() = user_id);
create policy "Users can delete own job_links" on public.job_links for delete using (auth.uid() = user_id);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in (
    'job_application', 'resume_file', 'cover_letter_file', 'checklist_item', 'interview', 'job_link'
  )),
  entity_id uuid not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_user_id_idx on public.activity_log (user_id);
create index if not exists activity_log_entity_idx on public.activity_log (entity_type, entity_id);
alter table public.activity_log enable row level security;
create policy "Users can view own activity_log" on public.activity_log for select using (auth.uid() = user_id);
create policy "Users can insert own activity_log" on public.activity_log for insert with check (auth.uid() = user_id);

alter table public.job_applications
  add column if not exists resume_file_id uuid references public.resume_files(id) on delete set null,
  add column if not exists cover_letter_file_id uuid references public.cover_letter_files(id) on delete set null;
create index if not exists job_applications_resume_file_id_idx on public.job_applications (resume_file_id);
create index if not exists job_applications_cover_letter_file_id_idx on public.job_applications (cover_letter_file_id);
