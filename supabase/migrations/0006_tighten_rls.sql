-- =========================================================================
-- Tighten RLS write policies to admin email only.
--
-- Previously policies used `TO authenticated` with `USING (true)`, meaning
-- any Supabase user (not just the site admin) could write directly to posts,
-- pages, and storage by using the public anon key. This migration locks all
-- write policies to the single configured admin email.
-- =========================================================================

-- Set the admin email as a database-level setting.
-- Run: ALTER DATABASE postgres SET app.admin_email = 'your@email.com';
-- in your Supabase SQL editor (or set via supabase secrets if using CLI).
-- This migration references it so the email is never hardcoded in SQL.

-- Posts: replace open write policy with email-scoped one
drop policy if exists "posts_auth_write" on public.posts;
create policy "posts_auth_write" on public.posts
  for all to authenticated
  using     (auth.email() = current_setting('app.admin_email', true))
  with check (auth.email() = current_setting('app.admin_email', true));

drop policy if exists "posts_auth_read_all" on public.posts;
create policy "posts_auth_read_all" on public.posts
  for select to authenticated
  using (auth.email() = current_setting('app.admin_email', true));

-- Pages: same
drop policy if exists "pages_auth_write" on public.pages;
create policy "pages_auth_write" on public.pages
  for all to authenticated
  using     (auth.email() = current_setting('app.admin_email', true))
  with check (auth.email() = current_setting('app.admin_email', true));

-- Storage: same
drop policy if exists "post_images_auth_write" on storage.objects;
create policy "post_images_auth_write" on storage.objects
  for all to authenticated
  using     (bucket_id = 'post-images' AND auth.email() = current_setting('app.admin_email', true))
  with check (bucket_id = 'post-images' AND auth.email() = current_setting('app.admin_email', true));
