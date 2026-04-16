import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabaseAdmin } from '../../lib/supabase';
import { sanitizeBodyHtml } from '../../lib/sanitize';

export const prerender = false;

const categoryEnum = z.enum(['Essay', 'Awareness', 'Reflection']);
const statusEnum   = z.enum(['draft', 'published']);

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const baseSchema = z.object({
  title:           z.string().min(1).max(200).transform((s) => s.trim()),
  slug:            z.string().min(1).max(96).regex(slugRe, 'Slug must be lowercase, hyphen-separated'),
  excerpt:         z.string().max(500).nullable().optional(),
  category:        categoryEnum,
  body_json:       z.unknown(),
  body_html:       z.string().max(300_000),
  status:          statusEnum,
  pull_quote:      z.string().max(500).nullable().optional(),
  reading_time:    z.string().max(32).nullable().optional(),
  cover_image_url: z.string().url().max(500).nullable().optional(),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({
  id: z.string().uuid(),
  // Optimistic concurrency: client sends the updated_at it last saw.
  // If the row changed since, we reject with 409.
  expected_updated_at: z.string().optional(),
});
const deleteSchema = z.object({ id: z.string().uuid() });

function allowedImageOrigins() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
  return [
    `${url}/storage/v1/object/public/post-images/`,
    'https://amitabhparti.com/',
  ];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return json({ error: { code: 'auth', message: 'Unauthorized' } }, 401);

  let raw: unknown;
  try { raw = await ctx.request.json(); }
  catch { return json({ error: { code: 'bad_json', message: 'Invalid JSON' } }, 400); }

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return json({ error: { code: 'validation', message: parsed.error.message } }, 400);

  const data = parsed.data;
  const cleanHtml = sanitizeBodyHtml(data.body_html, allowedImageOrigins());

  const now = new Date().toISOString();
  const row = {
    title:           data.title,
    slug:            data.slug,
    excerpt:         data.excerpt ?? null,
    pull_quote:      data.pull_quote ?? null,
    reading_time:    data.reading_time ?? estimateReadingTime(cleanHtml),
    category:        data.category,
    body_json:       data.body_json,
    body_html:       cleanHtml,
    status:          data.status,
    cover_image_url: data.cover_image_url ?? null,
    published_at:    data.status === 'published' ? now : null,
  };

  const db = supabaseAdmin();
  const { data: inserted, error } = await db.from('posts')
    .insert(row)
    .select('id, slug, status, updated_at')
    .single();
  if (error) {
    if ((error as any).code === '23505') return json({ error: { code: 'duplicate_slug', message: 'Slug already exists' } }, 409);
    console.error('[api/posts] insert error:', error);
    return json({ error: { code: 'db', message: 'Could not save post' } }, 500);
  }

  return json({ ok: true, id: inserted.id, slug: inserted.slug, updated_at: inserted.updated_at });
};

export const PATCH: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return json({ error: { code: 'auth', message: 'Unauthorized' } }, 401);

  let raw: unknown;
  try { raw = await ctx.request.json(); }
  catch { return json({ error: { code: 'bad_json', message: 'Invalid JSON' } }, 400); }

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) return json({ error: { code: 'validation', message: parsed.error.message } }, 400);

  const data = parsed.data;
  const cleanHtml = sanitizeBodyHtml(data.body_html, allowedImageOrigins());

  const db = supabaseAdmin();
  const { data: existing } = await db.from('posts')
    .select('status, published_at, updated_at')
    .eq('id', data.id)
    .maybeSingle();

  if (!existing) return json({ error: { code: 'not_found', message: 'Post not found' } }, 404);

  // Optimistic concurrency — refuse save if the row was edited elsewhere since load.
  if (data.expected_updated_at && existing.updated_at && existing.updated_at !== data.expected_updated_at) {
    return json({
      error: { code: 'conflict', message: 'Post was edited in another tab. Reload to see latest, or overwrite.' },
      server_updated_at: existing.updated_at,
    }, 409);
  }

  const patch: Record<string, unknown> = {
    title:           data.title,
    slug:            data.slug,
    excerpt:         data.excerpt ?? null,
    pull_quote:      data.pull_quote ?? null,
    reading_time:    data.reading_time ?? estimateReadingTime(cleanHtml),
    category:        data.category,
    body_json:       data.body_json,
    body_html:       cleanHtml,
    status:          data.status,
    cover_image_url: data.cover_image_url ?? null,
  };
  if (data.status === 'published' && !existing.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await db.from('posts')
    .update(patch)
    .eq('id', data.id)
    .select('id, slug, status, updated_at')
    .single();
  if (error) {
    if ((error as any).code === '23505') return json({ error: { code: 'duplicate_slug', message: 'Slug already exists' } }, 409);
    console.error('[api/posts] update error:', error);
    return json({ error: { code: 'db', message: 'Could not update post' } }, 500);
  }

  return json({ ok: true, id: updated.id, slug: updated.slug, updated_at: updated.updated_at });
};

export const DELETE: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return json({ error: { code: 'auth', message: 'Unauthorized' } }, 401);

  let raw: unknown;
  try { raw = await ctx.request.json(); }
  catch { return json({ error: { code: 'bad_json', message: 'Invalid JSON' } }, 400); }

  const parsed = deleteSchema.safeParse(raw);
  if (!parsed.success) return json({ error: { code: 'validation', message: parsed.error.message } }, 400);

  const db = supabaseAdmin();
  const { error } = await db.from('posts').delete().eq('id', parsed.data.id);
  if (error) {
    console.error('[api/posts] delete error:', error);
    return json({ error: { code: 'db', message: 'Could not delete post' } }, 500);
  }

  return json({ ok: true });
};

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 230));
  return `${mins} min read`;
}
