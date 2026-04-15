-- =========================================================================
-- amitabhparti.com · initial schema · 2026-04-15
-- =========================================================================

-- ---- Enable extensions ------------------------------------------------------
create extension if not exists pgcrypto;

-- ---- Tables -----------------------------------------------------------------
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  excerpt          text,
  pull_quote       text,
  body_html        text,
  body_json        jsonb,
  cover_image_url  text,
  category         text check (category in ('Essay', 'Awareness', 'Reflection')),
  reading_time     text,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);

create table if not exists public.pages (
  key         text primary key check (key in ('about', 'credentials')),
  body_html   text,
  body_json   jsonb,
  updated_at  timestamptz not null default now()
);

-- ---- updated_at trigger -----------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.tg_set_updated_at();

drop trigger if exists pages_set_updated_at on public.pages;
create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.tg_set_updated_at();

-- ---- Row Level Security -----------------------------------------------------
alter table public.posts enable row level security;
alter table public.pages enable row level security;

drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
  for select
  using (status = 'published');

drop policy if exists "posts_auth_read_all" on public.posts;
create policy "posts_auth_read_all" on public.posts
  for select to authenticated
  using (true);

drop policy if exists "posts_auth_write" on public.posts;
create policy "posts_auth_write" on public.posts
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "pages_public_read" on public.pages;
create policy "pages_public_read" on public.pages
  for select
  using (true);

drop policy if exists "pages_auth_write" on public.pages;
create policy "pages_auth_write" on public.pages
  for all to authenticated
  using (true)
  with check (true);

-- ---- Storage bucket for post images ----------------------------------------
insert into storage.buckets (id, name, public)
  values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post_images_public_read" on storage.objects;
create policy "post_images_public_read" on storage.objects
  for select
  using (bucket_id = 'post-images');

drop policy if exists "post_images_auth_write" on storage.objects;
create policy "post_images_auth_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'post-images')
  with check (bucket_id = 'post-images');
