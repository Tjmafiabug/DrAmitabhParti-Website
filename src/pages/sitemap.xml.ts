import type { APIRoute } from 'astro';
import { getAllPosts } from '../data/posts';
import { getSettings } from '../lib/settings';

export const prerender = false;

const STATIC_PATHS = ['/', '/about', '/writing', '/credentials', '/contact', '/privacy', '/disclaimer'];

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const [posts, settings] = await Promise.all([getAllPosts(), getSettings()]);
  const base = settings.identity.site_url.replace(/\/$/, '');

  const urls: string[] = [];
  for (const path of STATIC_PATHS) {
    urls.push(`<url><loc>${xmlEscape(base + path)}</loc></url>`);
  }
  for (const p of posts) {
    const lastmod = p.publishedAt ? new Date(p.publishedAt).toISOString() : undefined;
    urls.push(
      `<url><loc>${xmlEscape(`${base}/writing/${p.slug}`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`
    );
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=900',
    },
  });
};
