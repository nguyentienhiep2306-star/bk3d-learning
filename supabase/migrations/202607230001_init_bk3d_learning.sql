create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'student');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.enrollment_status as enum ('active', 'revoked', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role public.user_role not null default 'student',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  thumbnail_url text,
  status public.course_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, position)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.course_sections(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  youtube_video_id text,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  position integer not null check (position > 0),
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, position),
  constraint lessons_video_id_safe check (youtube_video_id is null or youtube_video_id ~ '^[A-Za-z0-9_-]{11}$')
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  title text not null,
  passing_score integer not null default 70 check (passing_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_text text not null,
  position integer not null check (position > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (quiz_id, position)
);

create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean not null default false,
  position integer not null check (position > 0),
  unique (question_id, position)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null default 0,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  passed boolean not null default false,
  started_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_answer_id uuid not null references public.quiz_answers(id) on delete restrict,
  is_correct boolean not null default false,
  unique (attempt_id, question_id)
);

create index courses_status_idx on public.courses(status);
create index sections_course_idx on public.course_sections(course_id, position);
create index lessons_course_idx on public.lessons(course_id, position);
create index enrollments_user_idx on public.enrollments(user_id, status);
create index progress_user_course_idx on public.lesson_progress(user_id, course_id);
create index quizzes_course_idx on public.quizzes(course_id);
create index attempts_user_quiz_idx on public.quiz_attempts(user_id, quiz_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger courses_touch before update on public.courses for each row execute function public.touch_updated_at();
create trigger sections_touch before update on public.course_sections for each row execute function public.touch_updated_at();
create trigger lessons_touch before update on public.lessons for each row execute function public.touch_updated_at();
create trigger quizzes_touch before update on public.quizzes for each row execute function public.touch_updated_at();
create trigger questions_touch before update on public.quiz_questions for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.has_active_enrollment(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments
    where user_id = auth.uid()
      and course_id = p_course_id
      and status = 'active'
      and (expires_at is null or expires_at > now())
  );
$$;

create or replace function public.can_read_course(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.courses c
    where c.id = p_course_id
      and c.status = 'published'
      and public.has_active_enrollment(c.id)
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_sections enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;

create policy "profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own limited" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

create policy "courses read enrolled published or admin" on public.courses for select using (public.is_admin() or (status = 'published' and public.has_active_enrollment(id)));
create policy "courses admin all" on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy "sections read by course access" on public.course_sections for select using (public.can_read_course(course_id));
create policy "sections admin all" on public.course_sections for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons read by course access or preview" on public.lessons for select using (is_preview or public.can_read_course(course_id));
create policy "lessons admin all" on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy "enrollments read own or admin" on public.enrollments for select using (user_id = auth.uid() or public.is_admin());
create policy "enrollments admin all" on public.enrollments for all using (public.is_admin()) with check (public.is_admin());

create policy "progress read own or admin" on public.lesson_progress for select using (user_id = auth.uid() or public.is_admin());
create policy "progress insert own enrolled" on public.lesson_progress for insert with check (user_id = auth.uid() and public.has_active_enrollment(course_id));
create policy "progress update own enrolled" on public.lesson_progress for update using (user_id = auth.uid() and public.has_active_enrollment(course_id)) with check (user_id = auth.uid());
create policy "progress admin all" on public.lesson_progress for all using (public.is_admin()) with check (public.is_admin());

create policy "quizzes read by course access" on public.quizzes for select using (public.can_read_course(course_id));
create policy "quizzes admin all" on public.quizzes for all using (public.is_admin()) with check (public.is_admin());

create policy "questions read by quiz course access" on public.quiz_questions for select using (exists (select 1 from public.quizzes q where q.id = quiz_id and public.can_read_course(q.course_id)));
create policy "questions admin all" on public.quiz_questions for all using (public.is_admin()) with check (public.is_admin());

create policy "answers read text by quiz course access" on public.quiz_answers for select using (exists (select 1 from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id where qq.id = question_id and public.can_read_course(q.course_id)));
create policy "answers admin all" on public.quiz_answers for all using (public.is_admin()) with check (public.is_admin());

revoke select on public.quiz_answers from anon, authenticated;
grant select (id, question_id, answer_text, position) on public.quiz_answers to authenticated;

create policy "attempts read own or admin" on public.quiz_attempts for select using (user_id = auth.uid() or public.is_admin());
create policy "attempts no direct student writes" on public.quiz_attempts for insert with check (false);
create policy "attempts admin all" on public.quiz_attempts for all using (public.is_admin()) with check (public.is_admin());

create policy "attempt answers read own or admin" on public.quiz_attempt_answers for select using (public.is_admin() or exists (select 1 from public.quiz_attempts qa where qa.id = attempt_id and qa.user_id = auth.uid()));
create policy "attempt answers no direct student writes" on public.quiz_attempt_answers for insert with check (false);
create policy "attempt answers admin all" on public.quiz_attempt_answers for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_course uuid;
  v_passing integer;
  v_total integer;
  v_correct integer;
  v_score integer;
  v_attempt uuid;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select course_id, passing_score into v_course, v_passing from public.quizzes where id = p_quiz_id;
  if v_course is null or not public.can_read_course(v_course) then
    raise exception 'not allowed';
  end if;

  select count(*) into v_total from public.quiz_questions where quiz_id = p_quiz_id;

  with submitted as (
    select (item->>'question_id')::uuid as question_id, (item->>'selected_answer_id')::uuid as selected_answer_id
    from jsonb_array_elements(p_answers) as item
  ),
  valid_answers as (
    select s.question_id, s.selected_answer_id, coalesce(a.is_correct, false) as is_correct
    from submitted s
    join public.quiz_questions q on q.id = s.question_id and q.quiz_id = p_quiz_id
    join public.quiz_answers a on a.id = s.selected_answer_id and a.question_id = s.question_id
  )
  select count(*) filter (where is_correct) into v_correct from valid_answers;

  v_score := case when v_total = 0 then 0 else round((v_correct::numeric / v_total::numeric) * 100)::integer end;

  insert into public.quiz_attempts (quiz_id, user_id, score, total_questions, correct_answers, passed, submitted_at)
  values (p_quiz_id, v_user, v_score, v_total, v_correct, v_score >= v_passing, now())
  returning id into v_attempt;

  insert into public.quiz_attempt_answers (attempt_id, question_id, selected_answer_id, is_correct)
  select v_attempt, s.question_id, s.selected_answer_id, a.is_correct
  from (
    select (item->>'question_id')::uuid as question_id, (item->>'selected_answer_id')::uuid as selected_answer_id
    from jsonb_array_elements(p_answers) as item
  ) s
  join public.quiz_questions q on q.id = s.question_id and q.quiz_id = p_quiz_id
  join public.quiz_answers a on a.id = s.selected_answer_id and a.question_id = s.question_id;

  return jsonb_build_object('attempt_id', v_attempt, 'score', v_score, 'total_questions', v_total, 'correct_answers', v_correct, 'passed', v_score >= v_passing);
end;
$$;

revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
