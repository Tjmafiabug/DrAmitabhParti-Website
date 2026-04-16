import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { sanitizeBodyHtml } from '../../lib/sanitize';
import {
  postCreateSchema as createSchema,
  postUpdateSchema as updateSchema,
  postDeleteSchema as deleteSchema,
} from '../../lib/postSchemas';

export const prerender = false;

function allowedImageOrigins() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
  return [
    `${url}/storage/v1/object/public/post-images/`,
    'https://amitabhparti.com/',
  ];
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/**
 * Turn a Supabase / Postgres error into a response-safe shape.
 * In development, `details` and `hint` are included so the dev can debug.
 * In production, only a generic message is returned — the full error is
 * still written to the server logs for operator visibility.
 */
function dbErrorResponse(scope: string, err: unknown, fallback: string): Response {
  console.error(`[api/posts] ${scope}:`, err);
  const e = err as { code?: string; message?: string; details?: string; hint?: string };
  if (import.meta.env.DEV) {
    return json({
      error: {
        code:    e?.code ?? 'db',
        message: e?.message ?? fallback,
        details: e?.details ?? null,
        hint:    e?.hint ?? null,
      },
    }, 500);
  }
  return json({ error: { code: 'db', message: fallback } }, 500);
}

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

  let db;
  try { db = supabaseAdmin(); }
  catch (e) {
    console.error('[api/posts] supabaseAdmin init failed:', e);
    return json({ error: { code: 'env', message: (e as Error).message } }, 500);
  }
  const { data: inserted, error } = await db.from('posts')
    .insert(row)
    .select('id, slug, status, updated_at')
    .single();
  if (error) {
    if ((error as { code?: string }).code === '23505') return json({ error: { code: 'duplicate_slug', message: 'Slug already exists' } }, 409);
    return dbErrorResponse('insert', error, 'Could not save post');
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

  let db;
  try { db = supabaseAdmin(); }
  catch (e) {
    console.error('[api/posts] supabaseAdmin init failed:', e);
    return json({ error: { code: 'env', message: (e as Error).message } }, 500);
  }
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
    if ((error as { code?: string }).code === '23505') return json({ error: { code: 'duplicate_slug', message: 'Slug already exists' } }, 409);
    return dbErrorResponse('update', error, 'Could not update post');
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

  let db;
  try { db = supabaseAdmin(); }
  catch (e) {
    console.error('[api/posts] supabaseAdmin init failed:', e);
    return json({ error: { code: 'env', message: (e as Error).message } }, 500);
  }
  const { error } = await db.from('posts').delete().eq('id', parsed.data.id);
  if (error) return dbErrorResponse('delete', error, 'Could not delete post');

  return json({ ok: true });
};

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 230));
  return `${mins} min read`;
}
