/**
 * Static keys for per-page SEO + heroes. Kept in a standalone leaf file so
 * the admin React forms can import them without dragging zod + supabase +
 * settings defaults into the client bundle.
 *
 * If you add a new page here, also:
 *   1. Add matching defaults in lib/settings.ts (defaultSettings.seo.pages
 *      and defaultSettings.heroes).
 *   2. Add the seed in supabase/migrations/0005_expand_cms.sql.
 */

export const SEO_PAGE_KEYS = [
  'home', 'about', 'credentials', 'contact', 'writing',
  'privacy', 'disclaimer', 'not_found',
] as const;
export type SeoPageKey = typeof SEO_PAGE_KEYS[number];

export const HERO_PAGE_KEYS = [
  'about', 'credentials', 'contact', 'writing',
  'privacy', 'disclaimer', 'not_found',
] as const;
export type HeroPageKey = typeof HERO_PAGE_KEYS[number];
