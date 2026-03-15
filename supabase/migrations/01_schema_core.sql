create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  role_title text not null,
  job_link text,
  job_description text,
  notes text,
  archived boolean not null default false,
  is_fake boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  current_status text not null default 'Applied' check (
    current_status in (
      'Wishlist',
      'Applied',
      'Interview',
      'Offer',
      'Rejected',
      'Ghosted'
    )
  )
);

create index if not exists job_applications_user_id_idx on public.job_applications (user_id);
create index if not exists job_applications_user_status_idx on public.job_applications (user_id, current_status) where not archived;

create trigger job_applications_updated_at
  before update on public.job_applications
  for each row execute function public.set_updated_at();

alter table public.job_applications enable row level security;

create policy "Users can view own applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on public.job_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);
