import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabaseAdmin } from '../../../lib/supabase';
import { sanitizeBodyHtml } from '../../../lib/sanitize';

export const prerender = false;

const keyEnum = z.enum(['about', 'credentials']);

const schema = z.object({
  body_json: z.unknown(),
  body_html: z.string().max(300_000),
});

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

export const PATCH: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return json({ error: { code: 'auth', message: 'Unauthorized' } }, 401);

  const keyParse = keyEnum.safeParse(ctx.params.key);
  if (!keyParse.success) return json({ error: { code: 'bad_key', message: 'Unknown page key' } }, 400);

  let raw: unknown;
  try { raw = await ctx.request.json(); }
  catch { return json({ error: { code: 'bad_json', message: 'Invalid JSON' } }, 400); }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return json({ error: { code: 'validation', message: parsed.error.message } }, 400);

  const cleanHtml = sanitizeBodyHtml(parsed.data.body_html, [
    `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/`,
    'https://amitabhparti.com/',
  ]);

  const db = supabaseAdmin();
  const { error } = await db.from('pages').upsert({
    key: keyParse.data,
    body_json: parsed.data.body_json,
    body_html: cleanHtml,
  }, { onConflict: 'key' });

  if (error) {
    console.error('[api/pages] error:', error);
    return json({ error: { code: 'db', message: 'Could not save page' } }, 500);
  }

  return json({ ok: true });
};
