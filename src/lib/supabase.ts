/**
 * Supabase clients.
 *
 * - `supabaseAnon` — build-time public reads (RLS-restricted to published rows).
 *   Used from .astro pages that prerender.
 * - `supabaseAdmin()` — server-only. Bypasses RLS via service_role key.
 *   Used only from API endpoints for privileged writes. Never imported in
 *   anything that ships to the browser.
 * - `createSupabaseServerClient(Astro)` — cookie-based SSR client for admin
 *   routes. Reads and writes auth cookies via Astro's request/response.
 *   Used in middleware and in /admin/* pages for session-aware rendering.
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { APIContext, AstroGlobal } from 'astro';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

/** Stateless anon client — used for build-time public reads only. */
export const supabaseAnon = createClient(url, anonKey, {
  auth: { persistSession: false },
});

/** Server-only admin client. Bypasses RLS. Never import in browser code. */
export function supabaseAdmin() {
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Required for admin writes.'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Cookie-aware SSR client. Reads the user's Supabase session from
 * HTTP-only cookies on the incoming request. Respects RLS — so this
 * client cannot bypass it even when the user is authenticated.
 */
export function createSupabaseServerClient(ctx: APIContext | AstroGlobal) {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const all = ctx.cookies.headers().getSetCookie?.() ?? [];
        // Astro's cookies API gives us a different shape; fall back to parsing request headers:
        const header = ctx.request.headers.get('cookie') ?? '';
        return header
          .split(';')
          .map((c) => c.trim())
          .filter(Boolean)
          .map((c) => {
            const idx = c.indexOf('=');
            return {
              name: c.slice(0, idx),
              value: decodeURIComponent(c.slice(idx + 1)),
            };
          });
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }: { name: string; value: string; options?: CookieOptions }) => {
          ctx.cookies.set(name, value, {
            ...options,
            // Force secure cookie behavior regardless of adapter defaults
            httpOnly: true,
            sameSite: 'lax',
            secure: import.meta.env.PROD,
            path: options?.path ?? '/',
          });
        });
      },
    },
  });
}

/** Admin email allowlist — the single address permitted to sign in to /admin. */
export const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL as string | undefined;
