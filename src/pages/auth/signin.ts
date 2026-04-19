import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createSupabaseServerClient, ADMIN_EMAIL } from '../../lib/supabase';

// Lightweight in-process rate limiter: max 5 magic-link requests per IP per 15 min.
const RL_MAX = 5;
const RL_WINDOW_MS = 15 * 60 * 1000;
const rlMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rlMap.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    return false;
  }
  if (entry.count >= RL_MAX) return true;
  entry.count++;
  return false;
}

export const prerender = false;

const schema = z.object({
  email: z.string().email().max(255).transform((v) => v.trim().toLowerCase()),
});

export const POST: APIRoute = async (ctx) => {
  const ip = ctx.request.headers.get('x-real-ip')
    ?? ctx.request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? 'unknown';
  if (isRateLimited(ip)) {
    return new Response('Too many requests', { status: 429, headers: { 'Retry-After': '900' } });
  }

  const form = await ctx.request.formData();
  const parsed = schema.safeParse({ email: form.get('email') });

  if (!parsed.success) {
    return ctx.redirect('/admin/login?error=invalid_email');
  }

  // Early allowlist check — don't even send a magic link to non-admins.
  if (!ADMIN_EMAIL) {
    return new Response('ADMIN_EMAIL is not configured.', { status: 500 });
  }
  if (parsed.data.email !== ADMIN_EMAIL.toLowerCase()) {
    // Deliberately vague: don't leak whether the email is an admin or not.
    return ctx.redirect(`/admin/login?sent=${encodeURIComponent(parsed.data.email)}`);
  }

  const supabase = createSupabaseServerClient(ctx);
  const redirectTo = `${ctx.url.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    console.error('[auth/signin] signInWithOtp error:', error.message);
    return ctx.redirect('/admin/login?error=send_failed');
  }

  return ctx.redirect(`/admin/login?sent=${encodeURIComponent(parsed.data.email)}`);
};
