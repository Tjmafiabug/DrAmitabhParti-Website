import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { siteSettingsSchema } from '../../lib/settings';
import { sanitizeBodyHtml } from '../../lib/sanitize';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/**
 * The two HTML-accepting fields in settings — they're rendered with set:html
 * on the home page, so every write goes through the same sanitizer the post
 * editor uses.
 */
function sanitizeSettings(data: ReturnType<typeof siteSettingsSchema.parse>) {
  const allowedImageOrigins = [
    `${import.meta.env.PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/`,
    'https://amitabhparti.com/',
  ];
  return {
    ...data,
    home: {
      ...data.home,
      intro_paragraph_html: sanitizeBodyHtml(data.home.intro_paragraph_html, allowedImageOrigins),
      closing_quote:        sanitizeBodyHtml(data.home.closing_quote,        allowedImageOrigins),
    },
  };
}

export const PATCH: APIRoute = async (ctx) => {
  const user = ctx.locals.user;
  if (!user) return json({ error: { code: 'auth', message: 'Unauthorized' } }, 401);

  let raw: unknown;
  try { raw = await ctx.request.json(); }
  catch { return json({ error: { code: 'bad_json', message: 'Invalid JSON' } }, 400); }

  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return json({ error: { code: 'validation', message: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') } }, 400);
  }

  const clean = sanitizeSettings(parsed.data);

  const db = supabaseAdmin();
  const { error } = await db.from('settings').upsert({
    key: 'site',
    value: clean,
  }, { onConflict: 'key' });

  if (error) {
    console.error('[api/settings] upsert error:', error);
    const details = import.meta.env.DEV
      ? { details: (error as { details?: string }).details ?? null, hint: (error as { hint?: string }).hint ?? null }
      : {};
    return json({ error: { code: 'db', message: 'Could not save settings', ...details } }, 500);
  }

  return json({ ok: true });
};
