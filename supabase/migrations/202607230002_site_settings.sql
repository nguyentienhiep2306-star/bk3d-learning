 create table public.site_settings (
   id text primary key default 'default',
   site_name text not null default 'BK3D Learning',
   page_title text not null default 'BK3D Learning - Nền tảng đào tạo kỹ thuật',
   logo_url text,
   favicon_url text,
   homepage_content jsonb not null default '{}'::jsonb,
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now(),
   updated_by uuid references auth.users(id) on delete set null
 );
 
 -- Only one record (singleton pattern) – enforce via unique index on a constant expression
 create unique index site_settings_singleton_idx on public.site_settings ((true));
 
 -- Row Level Security
 alter table public.site_settings enable row level security;
 
 -- Trigger for updated_at
 create trigger site_settings_touch before update on public.site_settings
   for each row execute function public.touch_updated_at();
 
 -- RLS: Anyone can read public settings (anon, authenticated, all)
 create policy "site_settings public read"
   on public.site_settings for select
   using (true);
 
 -- RLS: Only admin can insert/update
 create policy "site_settings admin insert"
   on public.site_settings for insert
   with check (public.is_admin());
 
 create policy "site_settings admin update"
   on public.site_settings for update
   using (public.is_admin())
   with check (public.is_admin());
 
 -- Insert default record (only if not exists – safe for re-runs)
 insert into public.site_settings (id, site_name, page_title, logo_url, favicon_url, homepage_content)
 values (
   'default',
   'BK3D Learning',
   'BK3D Learning - Nền tảng đào tạo kỹ thuật',
   null,
   null,
   '{
     "eyebrow": "Nền tảng đào tạo kỹ thuật",
     "title": "BK3D giúp học viên học đúng khóa, đúng tiến độ, đúng năng lực.",
     "subtitle": "Quản lý khóa học, bài giảng YouTube Unlisted, tiến độ học và bài kiểm tra trên một hệ thống React + Supabase sẵn sàng triển khai tại bk3d.io.vn."
   }'::jsonb
 )
 on conflict (id) do nothing;
 
 -- ============================================
 -- Storage bucket for branding assets (logo, favicon)
 -- ============================================
 
 insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 values (
   'branding-assets',
   'branding-assets',
   true,
   5242880,
   array['image/png', 'image/jpeg', 'image/webp', 'image/x-icon', 'image/svg+xml']
 )
 on conflict (id) do nothing;
 
 -- RLS: Anyone can read branding files
 create policy "branding public read"
   on storage.objects for select
   using (bucket_id = 'branding-assets');
 
 -- RLS: Only admin can insert/update/delete branding files
 create policy "branding admin insert"
   on storage.objects for insert
   with check (
     bucket_id = 'branding-assets'
     and public.is_admin()
   );
 
 create policy "branding admin update"
   on storage.objects for update
   using (bucket_id = 'branding-assets' and public.is_admin())
   with check (bucket_id = 'branding-assets' and public.is_admin());
 
 create policy "branding admin delete"
   on storage.objects for delete
   using (bucket_id = 'branding-assets' and public.is_admin());
