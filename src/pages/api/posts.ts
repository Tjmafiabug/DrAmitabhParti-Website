import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabaseAdmin } from '../../lib/supabase';
import { sanitizeBodyHtml } from '../../lib/sanitize';

export const prerender = false;

const categoryEnum = z.enum(['Essay', 'Awareness', 'Reflection']);
const statusEnum   = z.enum(['draft', 'published']);

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const baseSchema = z.object({
  title:      z.string().min(1).max(200).transform((s) => s.trim()),
  slug:       z.string().min(1).max(96).regex(slugRe, 'Slug must be lowercase, hyphen-separated'),
  excerpt:    z.string().max(500).nullable().optional(),
  category:   categoryEnum,
  body_json:  z.unknown(),
  body_html:  z.string().max(300_000),
  status:     statusEnum,
  pull_quote: z.string().max(500).nullable().optional(),
  reading_time: z.string().max(32).nullable().optional(),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({ id: z.string().uuid() });

function allowedImageOrigins() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
  return [
    `${url}/storage/v1/object/public/post-images/`,
    'https://amitabhparti.com/',
    'https://images1-fabric.practo.com/', // existing placeholder, drop later
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
    title:        data.title,
    slug:         data.slug,
    excerpt:      data.excerpt ?? null,
    pull_quote:   data.pull_quote ?? null,
    reading_time: data.reading_time ?? estimateReadingTime(cleanHtml),
    category:     data.category,
    body_json:    data.body_json,
    body_html:    cleanHtml,
    status:       data.status,
    published_at: data.status === 'published' ? now : null,
  };

  const db = supabaseAdmin();
  const { data: inserted, error } = await db.from('posts').insert(row).select('id, slug, status').single();
  if (error) {
    if ((error as any).code === '23505') return json({ error: { code: 'duplicate_slug', message: 'Slug already exists' } }, 409);
    console.error('[api/posts] insert error:', error);
    return json({ error: { code: 'db', message: 'Could not save post' } }, 500);
  }

  if (inserted.status === 'published') {
    void revalidatePaths(['/', '/writing', `/writing/${inserted.slug}`]);
  }

  return json({ ok: true, id: inserted.id, slug: inserted.slug });
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
  const { data: existing } = await db.from('posts').select('status, published_at').eq('id', data.id).maybeSingle();

  const patch: Record<string, unknown> = {
    title:        data.title,
    slug:         data.slug,
    excerpt:      data.excerpt ?? null,
    pull_quote:   data.pull_quote ?? null,
    reading_time: data.reading_time ?? estimateReadingTime(cleanHtml),
    category:     data.category,
    body_json:    data.body_json,
    body_html:    cleanHtml,
    status:       data.status,
  };
  // First-publish — stamp published_at. Subsequent publishes keep the original date.
  if (data.status === 'published' && !existing?.published_at) {
    patch.published_at = new Date().toISOString();
  }

  const { data: updated, error } = await db.from('posts').update(patch).eq('id', data.id).select('id, slug, status').single();
  if (error) {
    if ((error as any).code === '23505') return json({ error: { code: 'duplicate_slug', message: 'Slug already exists' } }, 409);
    console.error('[api/posts] update error:', error);
    return json({ error: { code: 'db', message: 'Could not update post' } }, 500);
  }

  if (updated.status === 'published') {
    void revalidatePaths(['/', '/writing', `/writing/${updated.slug}`]);
  }

  return json({ ok: true, id: updated.id, slug: updated.slug });
};

function estimateReadingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 230));
  return `${mins} min read`;
}

async function revalidatePaths(paths: string[]) {
  // Placeholder. Vercel doesn't need manual revalidation for SSR routes, and
  // our public pages are SSG — to update them in production we rely on
  // redeploys triggered by a Supabase webhook (documented in HANDBOOK).
  // In dev, new content appears on next build.
  return;
}
