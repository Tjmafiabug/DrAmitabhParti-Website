# Supabase migrations

Version-controlled SQL for the `amitabhparti` Supabase project.

## Run order

1. **`migrations/0001_init.sql`** — extensions, tables, RLS policies, storage bucket
2. **`migrations/0002_seed.sql`** — three founding articles + initial About / Credentials page bodies

## How to run

### First time — via Supabase dashboard

1. Open the project → **SQL Editor** → **New query**
2. Paste the contents of `0001_init.sql` → **Run**
3. Repeat for `0002_seed.sql`
4. Verify the last `select` returns 3 rows

### Later — via Supabase CLI (once we install it)

```bash
supabase db push
```

## Re-running the seed safely

`0002_seed.sql` uses `on conflict do nothing` on posts (won't duplicate if slugs already exist) and `on conflict do update` on pages (overwrites body_html). Safe to re-run.

## Resetting the database

Drop all rows without dropping the schema:

```sql
truncate public.posts, public.pages restart identity;
```

Then re-run `0002_seed.sql`.

## Schema notes

- `posts.status` — `'draft'` or `'published'`. Public can only read `published`. Admin reads everything.
- `pages.key` — constrained to `'about'` or `'credentials'`. Used by the long-form page editor in admin.
- `posts.body_json` and `pages.body_json` — Tiptap editor state. `body_html` is the rendered HTML the public pages display.
- Storage bucket `post-images` is public-read, authenticated-write. Used by the admin composer for inline image uploads.

## Security

- RLS is on for every table.
- Public reads are restricted to published posts and pages.
- Writes require an authenticated Supabase user (the doctor, via magic link).
- The `service_role` key bypasses RLS and must **never** be shipped to the browser — it's used only in Astro server endpoints.
