create table if not exists public.interview_question_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists interview_question_categories_user_sort_idx on public.interview_question_categories (user_id, sort_order);
create trigger interview_question_categories_updated_at before update on public.interview_question_categories for each row execute function public.set_updated_at();
alter table public.interview_question_categories enable row level security;
create policy "Users can view own interview question categories" on public.interview_question_categories for select using (auth.uid() = user_id);
create policy "Users can insert own interview question categories" on public.interview_question_categories for insert with check (auth.uid() = user_id);
create policy "Users can update own interview question categories" on public.interview_question_categories for update using (auth.uid() = user_id);
create policy "Users can delete own interview question categories" on public.interview_question_categories for delete using (auth.uid() = user_id);

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.interview_question_categories(id) on delete cascade,
  question text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists interview_questions_user_sort_idx on public.interview_questions (user_id, sort_order);
create index if not exists interview_questions_category_id_idx on public.interview_questions (category_id);
create trigger interview_questions_updated_at before update on public.interview_questions for each row execute function public.set_updated_at();
alter table public.interview_questions enable row level security;
create policy "Users can view own interview questions" on public.interview_questions for select using (auth.uid() = user_id);
create policy "Users can insert own interview questions" on public.interview_questions for insert with check (auth.uid() = user_id);
create policy "Users can update own interview questions" on public.interview_questions for update using (auth.uid() = user_id);
create policy "Users can delete own interview questions" on public.interview_questions for delete using (auth.uid() = user_id);

create table if not exists public.interview_question_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.interview_questions(id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);
create trigger interview_question_notes_updated_at before update on public.interview_question_notes for each row execute function public.set_updated_at();
alter table public.interview_question_notes enable row level security;
create policy "Users can view own interview question notes" on public.interview_question_notes for select using (auth.uid() = user_id);
create policy "Users can insert own interview question notes" on public.interview_question_notes for insert with check (auth.uid() = user_id);
create policy "Users can update own interview question notes" on public.interview_question_notes for update using (auth.uid() = user_id);
create policy "Users can delete own interview question notes" on public.interview_question_notes for delete using (auth.uid() = user_id);
