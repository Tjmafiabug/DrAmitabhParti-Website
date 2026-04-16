import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient, ADMIN_EMAIL } from './lib/supabase';

/**
 * Gate /admin/* and admin write API routes behind Supabase auth, and stamp
 * every response with the site's security headers.
 *
 * Auth has three layers of defense:
 *   1. A valid Supabase session cookie must be present.
 *   2. The session email must match ADMIN_EMAIL (single-user allowlist).
 *   3. Postgres RLS is the last line — even if both of the above are
 *      bypassed, the DB rejects writes from non-authenticated roles.
 */

const PROTECTED_PAGE_PREFIX = '/admin';
const PROTECTED_API_PREFIX  = '/api';
const PUBLIC_API_PATHS      = new Set(['/api/healthz']);
const LOGIN_PATH            = '/admin/login';
const AUTH_CALLBACK_PATH    = '/auth/callback';

// Supabase host is derived at build time from the env so connect-src can allow
// the project API + storage domains without being a blanket https: wildcard.
const supabaseHost = (() => {
  try { return new URL(import.meta.env.PUBLIC_SUPABASE_URL as string).host; }
  catch { return ''; }
})();

/**
 * Content Security Policy.
 *
 * - 'unsafe-inline' on styles and scripts is accepted because Astro inlines
 *   both heavily (is:inline scripts, inline style attributes). A nonce-based
 *   CSP would be stricter but adds material complexity; the tradeoff is
 *   explicit. Everything else is locked down.
 * - img-src allows https: + data: because post bodies and settings can
 *   reference any image the admin uploaded or pasted.
 * - frame-src allows Google Maps for the /contact page embed. If the map is
 *   removed, this directive can be dropped.
 */
function buildCSP() {
  const connect = ["'self'"];
  if (supabaseHost) connect.push(`https://${supabaseHost}`, `wss://${supabaseHost}`);
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "script-src 'self' 'unsafe-inline'",
    `connect-src ${connect.join(' ')}`,
    "frame-src https://www.google.com",
  ].join('; ');
}

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy':   buildCSP(),
  'X-Content-Type-Options':    'nosniff',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Frame-Options':           'DENY',
};

function applySecurityHeaders(res: Response): Response {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    if (!res.headers.has(k)) res.headers.set(k, v);
  }
  if (import.meta.env.PROD && !res.headers.has('Strict-Transport-Security')) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return res;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const { request, url, redirect } = ctx;
  const path = url.pathname;

  // Auth callback is always allowed — it completes the magic-link flow.
  if (path === AUTH_CALLBACK_PATH) {
    const res = await next();
    return applySecurityHeaders(res);
  }

  // Login page is always allowed (but if already signed in, bounce to /admin).
  if (path === LOGIN_PATH) {
    const supabase = createSupabaseServerClient(ctx);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email?.toLowerCase() === ADMIN_EMAIL?.toLowerCase()) {
      return applySecurityHeaders(redirect('/admin'));
    }
    return applySecurityHeaders(await next());
  }

  const isProtectedPage = path.startsWith(PROTECTED_PAGE_PREFIX);
  const isProtectedApi  = path.startsWith(PROTECTED_API_PREFIX) && !PUBLIC_API_PATHS.has(path);

  if (!isProtectedPage && !isProtectedApi) {
    const res = await next();
    return applySecurityHeaders(res);
  }

  // Fetch the session
  const supabase = createSupabaseServerClient(ctx);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedApi) {
      return applySecurityHeaders(new Response(JSON.stringify({ error: { code: 'auth', message: 'Unauthorized' } }), {
        status: 401, headers: { 'content-type': 'application/json' },
      }));
    }
    return applySecurityHeaders(redirect(`${LOGIN_PATH}?next=${encodeURIComponent(path)}`));
  }

  // Allowlist check
  if (!ADMIN_EMAIL) {
    return applySecurityHeaders(new Response('ADMIN_EMAIL is not configured.', { status: 500 }));
  }
  if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await supabase.auth.signOut();
    if (isProtectedApi) {
      return applySecurityHeaders(new Response(JSON.stringify({ error: { code: 'forbidden', message: 'Forbidden' } }), {
        status: 403, headers: { 'content-type': 'application/json' },
      }));
    }
    return applySecurityHeaders(redirect(`${LOGIN_PATH}?error=not_admin`));
  }

  // CSRF defense on API writes: require at least one of Origin/Referer, and
  // require it to match the request host. A missing Origin *and* missing
  // Referer now fails closed (previously it passed — an edge-case that some
  // proxies can produce).
  if (isProtectedApi && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
    const origin  = request.headers.get('origin')  ?? '';
    const referer = request.headers.get('referer') ?? '';
    const host    = url.host;
    const originMatches  = origin  !== '' && origin.endsWith(host);
    const refererMatches = referer !== '' && referer.startsWith(`${url.protocol}//${host}`);
    if (!originMatches && !refererMatches) {
      return applySecurityHeaders(new Response(JSON.stringify({ error: { code: 'forbidden', message: 'Cross-origin write blocked' } }), {
        status: 403, headers: { 'content-type': 'application/json' },
      }));
    }
  }

  ctx.locals.user = { id: user.id, email: user.email ?? '' };
  const res = await next();
  return applySecurityHeaders(res);
});
