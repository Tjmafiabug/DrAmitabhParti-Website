import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts } from '../data/posts';
import { site } from '../data/site';

export const prerender = true;

export async function GET(context: APIContext) {
  const posts = await getAllPosts();

  return rss({
    title: `${site.name} — Writing`,
    description: 'Essays, notes, and educational articles on internal medicine and public health by Dr. Amitabh Parti.',
    site: context.site ?? site.url,
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
