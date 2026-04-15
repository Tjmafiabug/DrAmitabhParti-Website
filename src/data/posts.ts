/**
 * Post data layer.
 *
 * Reads from Supabase at build time using the anon client (RLS-restricted to
 * status = 'published'). Same shape as before, just async now.
 */

import { supabaseAnon } from '../lib/supabase';

export type PostCategory = 'Essay' | 'Awareness' | 'Reflection';

export type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: PostCategory | null;
  publishedAt: string;
  readingTime: string | null;
  pullQuote: string | null;
  body: string;
};

type Row = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: PostCategory | null;
  published_at: string | null;
  reading_time: string | null;
  pull_quote: string | null;
  body_html: string | null;
};

const toPost = (r: Row): Post => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  category: r.category,
  publishedAt: r.published_at ?? '',
  readingTime: r.reading_time,
  pullQuote: r.pull_quote,
  body: r.body_html ?? '',
});

export async function getAllPosts(): Promise<Post[]> {
  const { data, error } = await supabaseAnon
    .from('posts')
    .select('slug, title, excerpt, category, published_at, reading_time, pull_quote, body_html')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw new Error(`Supabase getAllPosts: ${error.message}`);
  return (data ?? []).map(toPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabaseAnon
    .from('posts')
    .select('slug, title, excerpt, category, published_at, reading_time, pull_quote, body_html')
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Supabase getPost(${slug}): ${error.message}`);
  return data ? toPost(data) : null;
}

export async function getRecentPosts(n = 3): Promise<Post[]> {
  const { data, error } = await supabaseAnon
    .from('posts')
    .select('slug, title, excerpt, category, published_at, reading_time, pull_quote, body_html')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(n);

  if (error) throw new Error(`Supabase getRecentPosts: ${error.message}`);
  return (data ?? []).map(toPost);
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
