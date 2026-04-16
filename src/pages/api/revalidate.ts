import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Receives Supabase database webhooks on posts/pages/settings writes.
 * Forwards to a Vercel Deploy Hook to trigger a fresh static rebuild so
 * public pages reflect new content within ~60 seconds.
 *
 * Security:
 *   - Caller must present the shared secret in `x-revalidate-secret` header,
 *     matching env var REVALIDATE_SECRET.
 *   - We verify the header before calling the deploy hook.
 *
 * Config (env vars set in Vercel project settings):
 *   - VERCEL_DEPLOY_HOOK_URL  — the hook URL Vercel gave you (keep secret)
 *   - REVALIDATE_SECRET       — any long random string; copy to Supabase webhook header
 */

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async (ctx) => {
  const secret = import.meta.env.REVALIDATE_SECRET;
  const hook = import.meta.env.VERCEL_DEPLOY_HOOK_URL;

  if (!secret || !hook) {
    console.error('[api/revalidate] missing REVALIDATE_SECRET or VERCEL_DEPLOY_HOOK_URL env');
    return json({ error: 'Not configured' }, 500);
  }

  const provided = ctx.request.headers.get('x-revalidate-secret');
  if (provided !== secret) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Supabase sends a JSON payload with {type, table, record, old_record} —
  // we don't need it; we just fire the deploy hook unconditionally.
  try { await ctx.request.json(); } catch { /* body may be empty — fine */ }

  try {
    const res = await fetch(hook, { method: 'POST' });
    if (!res.ok) {
      const text = await res.text();
      console.error('[api/revalidate] deploy hook failed:', res.status, text);
      return json({ error: 'Deploy hook failed', status: res.status }, 502);
    }
    return json({ ok: true, triggered: true });
  } catch (e) {
    console.error('[api/revalidate] deploy hook error:', e);
    return json({ error: (e as Error).message }, 502);
  }
};

// Allow GET for a simple healthcheck (no secret required, no action taken)
export const GET: APIRoute = () =>
  json({ ok: true, endpoint: 'revalidate', method: 'POST with x-revalidate-secret header' });
