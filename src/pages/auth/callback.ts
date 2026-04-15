import type { APIRoute } from 'astro';
import { createSupabaseServerClient, ADMIN_EMAIL } from '../../lib/supabase';

export const prerender = false;

/**
 * Supabase magic-link callback. Supabase sends a ?code= param that we
 * exchange for a session cookie. If the resulting user's email does not
 * match ADMIN_EMAIL, we immediately sign them out and redirect.
 */
export const GET: APIRoute = async (ctx) => {
  const code = ctx.url.searchParams.get('code');
  const next = ctx.url.searchParams.get('next') || '/admin';

  if (!code) return ctx.redirect('/admin/login?error=missing_code');

  const supabase = createSupabaseServerClient(ctx);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message);
    return ctx.redirect('/admin/login?error=exchange_failed');
  }

  // Allowlist check
  if (!ADMIN_EMAIL || data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await supabase.auth.signOut();
    return ctx.redirect('/admin/login?error=not_admin');
  }

  // Session cookie is now set. Redirect to the intended destination.
  return ctx.redirect(next.startsWith('/') ? next : '/admin');
};
