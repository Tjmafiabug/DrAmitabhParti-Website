import type { APIRoute } from 'astro';
import { getSettings } from '../lib/settings';

export const prerender = false;

export const GET: APIRoute = async () => {
  const settings = await getSettings();
  const base = settings.identity.site_url.replace(/\/$/, '');

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /auth/',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
