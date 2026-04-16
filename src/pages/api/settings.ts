import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { siteSettingsSchema } from '../../lib/settings';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

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

  const db = supabaseAdmin();
  const { error } = await db.from('settings').upsert({
    key: 'site',
    value: parsed.data,
  }, { onConflict: 'key' });

  if (error) {
    console.error('[api/settings] upsert error:', error);
    return json({ error: { code: 'db', message: 'Could not save settings' } }, 500);
  }

  return json({ ok: true });
};
