-- ============================================
-- Fix branding-assets bucket config and policies
-- Ensures bucket exists with correct settings even
-- if previous migration was not applied to production.
-- Idempotent: safe to re-run.
-- ============================================

-- 1. Create or update the bucket
--    ON CONFLICT DO UPDATE ensures settings are correct
--    even if the bucket already exists from a prior run.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'branding-assets',
  'branding-assets',
  true,
  5242880,                                                   -- 5 MB
  array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ]
)
on conflict (id) do update set
  public              = excluded.public,
  file_size_limit     = excluded.file_size_limit,
  allowed_mime_types  = excluded.allowed_mime_types;

-- 2. Drop existing policies so we can recreate them cleanly
--    (PostgreSQL does not support CREATE POLICY IF NOT EXISTS)
do $$ begin
  drop policy if exists "branding public read"  on storage.objects;
  drop policy if exists "branding admin insert" on storage.objects;
  drop policy if exists "branding admin update" on storage.objects;
  drop policy if exists "branding admin delete" on storage.objects;
end $$;

-- 3. Public read – anonymous and authenticated users can view assets
create policy "branding public read"
  on storage.objects for select
  using (bucket_id = 'branding-assets');

-- 4. Admin insert – only verified admins can upload
create policy "branding admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'branding-assets'
    and public.is_admin()
  );

-- 5. Admin update – only admins can overwrite (used if upsert is needed)
create policy "branding admin update"
  on storage.objects for update
  using (bucket_id = 'branding-assets' and public.is_admin())
  with check (bucket_id = 'branding-assets' and public.is_admin());

-- 6. Admin delete – only admins can remove old assets
create policy "branding admin delete"
  on storage.objects for delete
  using (bucket_id = 'branding-assets' and public.is_admin());
