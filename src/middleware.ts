import { defineMiddleware, sequence } from 'astro:middleware';
import { createSupabaseServerClient, ADMIN_EMAIL } from './lib/supabase';

/**
 * Gate /admin/* and admin write API routes behind Supabase auth.
 *
 * Two layers of defense:
 *   1. A valid Supabase session cookie must be present.
 *   2. The session email must match ADMIN_EMAIL (single-user allowlist).
 *
 * Postgres RLS is the third layer — even if both of the above are bypassed,
 * the DB rejects writes from non-authenticated roles.
 */

const PROTECTED_PAGE_PREFIX = '/admin';
const PROTECTED_API_PREFIX  = '/api';
const PUBLIC_API_PATHS      = new Set(['/api/healthz']);
const LOGIN_PATH            = '/admin/login';
const AUTH_CALLBACK_PATH    = '/auth/callback';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { request, url, redirect } = ctx;
  const path = url.pathname;

  // Auth callback is always allowed — it completes the magic-link flow.
  if (path === AUTH_CALLBACK_PATH) return next();

  // Login page is always allowed (but if already signed in, bounce to /admin).
  if (path === LOGIN_PATH) {
    const supabase = createSupabaseServerClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase()) {
      return redirect('/admin');
    }
    return next();
  }

  const isProtectedPage = path.startsWith(PROTECTED_PAGE_PREFIX);
  const isProtectedApi  = path.startsWith(PROTECTED_API_PREFIX) && !PUBLIC_API_PATHS.has(path);

  if (!isProtectedPage && !isProtectedApi) return next();

  // Fetch the session
  const supabase = createSupabaseServerClient(ctx);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedApi) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'content-type': 'application/json' },
      });
    }
    return redirect(`${LOGIN_PATH}?next=${encodeURIComponent(path)}`);
  }

  // Allowlist check
  if (!ADMIN_EMAIL) {
    return new Response('ADMIN_EMAIL is not configured.', { status: 500 });
  }
  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    // Signed in but not the admin — sign out and refuse
    await supabase.auth.signOut();
    if (isProtectedApi) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { 'content-type': 'application/json' },
      });
    }
    return redirect(`${LOGIN_PATH}?error=not_admin`);
  }

  // CSRF defense for API writes: Origin / Referer must match host.
  if (isProtectedApi && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin') ?? '';
    const referer = request.headers.get('referer') ?? '';
    const host = url.host;
    const same = origin.endsWith(host) || referer.startsWith(`${url.protocol}//${host}`);
    if (!same) {
      return new Response(JSON.stringify({ error: 'Cross-origin write blocked' }), {
        status: 403, headers: { 'content-type': 'application/json' },
      });
    }
  }

  // Attach user to locals for downstream handlers
  ctx.locals.user = { id: user.id, email: user.email ?? '' };

  return next();
});
