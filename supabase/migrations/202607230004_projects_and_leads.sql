 -- ============================================
 -- homepage_projects – admin-managed project showcase
 -- ============================================
 
 create table if not exists public.homepage_projects (
   id uuid primary key default gen_random_uuid(),
   title text not null,
   short_description text,
   image_url text not null,
   image_alt text,
   category text,
   project_url text,
   sort_order integer not null default 0,
   is_published boolean not null default true,
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now(),
   created_by uuid references auth.users(id),
   updated_by uuid references auth.users(id)
 );
 
 create index if not exists projects_published_idx on public.homepage_projects(is_published, sort_order);
 
 alter table public.homepage_projects enable row level security;
 
 create trigger projects_touch before update on public.homepage_projects
   for each row execute function public.touch_updated_at();
 
 -- RLS: public sees published
 create policy "homepage_projects public read"
   on public.homepage_projects for select
   using (is_published = true);
 
 -- RLS: admin sees all + full write
 create policy "homepage_projects admin all"
   on public.homepage_projects for all
   using (public.is_admin())
   with check (public.is_admin());
 
 -- ============================================
 -- registration_leads – consultation signups
 -- ============================================
 
 create table if not exists public.registration_leads (
   id uuid primary key default gen_random_uuid(),
   full_name text not null check (char_length(full_name) between 1 and 150),
   phone text not null check (char_length(phone) between 1 and 30),
   email text check (char_length(email) between 1 and 254),
   interest text check (char_length(interest) between 1 and 250),
   message text check (char_length(message) between 1 and 2000),
   source_page text,
   status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'closed')),
   admin_note text,
   assigned_to uuid references auth.users(id),
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now()
 );
 
 alter table public.registration_leads enable row level security;
 
 create trigger leads_touch before update on public.registration_leads
   for each row execute function public.touch_updated_at();
 
 -- RLS: admin sees all + can update
 create policy "registration_leads admin select"
   on public.registration_leads for select
   using (public.is_admin());
 
 create policy "registration_leads admin update"
   on public.registration_leads for update
   using (public.is_admin())
   with check (public.is_admin());
 
 create policy "registration_leads admin delete"
   on public.registration_leads for delete
   using (public.is_admin());
 
 -- ============================================
 -- RPC: submit_registration_lead
 -- Public-safe function for form submission
 -- ============================================
 
 create or replace function public.submit_registration_lead(
   p_full_name text,
   p_phone text,
   p_email text default null,
   p_interest text default null,
   p_message text default null,
   p_source_page text default null,
   p_honeypot text default null
 )
 returns uuid
 language plpgsql
 security definer
 set search_path = public
 as $$
 declare
   v_id uuid;
 begin
   -- Honeypot check
   if p_honeypot is not null and p_honeypot <> '' then
     return null;
   end if;
 
   -- Basic validation
   if trim(p_full_name) = '' then
     raise exception 'Họ tên không được để trống.';
   end if;
   if trim(p_phone) = '' then
     raise exception 'Số điện thoại không được để trống.';
   end if;
 
   insert into public.registration_leads (full_name, phone, email, interest, message, source_page)
   values (trim(p_full_name), trim(p_phone), nullif(trim(p_email), ''), nullif(trim(p_interest), ''), nullif(trim(p_message), ''), p_source_page)
   returning id into v_id;
 
   return v_id;
 end;
 $$;
 
 revoke all on function public.submit_registration_lead(text, text, text, text, text, text, text) from public;
 grant execute on function public.submit_registration_lead(text, text, text, text, text, text, text) to anon, authenticated;
