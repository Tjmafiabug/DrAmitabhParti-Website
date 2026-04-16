import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts } from '../data/posts';
import { getSettings } from '../lib/settings';

export const prerender = false;

export async function GET(context: APIContext) {
  const [posts, settings] = await Promise.all([getAllPosts(), getSettings()]);

  return rss({
    title: `${settings.identity.name} — Writing`,
    description: settings.seo.pages.writing?.description ?? settings.seo.default_description,
    site: context.site ?? settings.identity.site_url,
    items: posts.map((p) => ({
      title: p.title,
      link: `/writing/${p.slug}`,
      description: p.excerpt ?? '',
      pubDate: new Date(p.publishedAt),
      categories: p.category ? [p.category] : undefined,
    })),
    customData: `<language>en-IN</language>`,
    stylesheet: false,
  });
}
