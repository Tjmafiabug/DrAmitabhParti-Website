import type { APIRoute } from 'astro';
import { supabaseAnon } from '../../lib/supabase';

export const prerender = false;

/**
 * Liveness + DB reachability probe. Never requires auth.
 * Returns 200 if the process is up and the DB answers a simple query.
 */
export const GET: APIRoute = async () => {
  try {
    const { error } = await supabaseAnon
      .from('posts')
      .select('slug', { count: 'exact', head: true });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, service: 'amitabhparti', db: 'ok' }), {
      status: 200, headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, db: 'fail', error: (e as Error).message }), {
      status: 503, headers: { 'content-type': 'application/json' },
    });
  }
};
