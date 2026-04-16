/**
 * Long-form editable page bodies. One row in `pages` per slug. Body rendered
 * via set:html on the public pages. Falls back to a safe default if missing.
 */

import { supabaseAnon } from './supabase';

export const PAGE_KEYS = ['about', 'credentials', 'privacy', 'disclaimer', 'not_found'] as const;
export type PageKey = typeof PAGE_KEYS[number];

export const PAGE_META: Record<PageKey, { title: string; livePath: string }> = {
  about:       { title: 'About',             livePath: '/about' },
  credentials: { title: 'Credentials',       livePath: '/credentials' },
  privacy:     { title: 'Privacy',           livePath: '/privacy' },
  disclaimer:  { title: 'Medical Disclaimer',livePath: '/disclaimer' },
  not_found:   { title: '404 — Not Found',   livePath: '/404' },
};

const DEFAULTS: Record<PageKey, string> = {
  about:       '<p>A biographical page — to be developed from an interview with Dr. Parti.</p>',
  credentials: '<p>A short preamble for the CV — to be developed.</p>',
  privacy:     '<p>Privacy policy — to be written.</p>',
  disclaimer:  '<p>Medical disclaimer — to be written.</p>',
  not_found:   '<p>The page you were looking for has moved, or never existed.</p>',
};

export function isPageKey(x: unknown): x is PageKey {
  return typeof x === 'string' && (PAGE_KEYS as readonly string[]).includes(x);
}

export async function getPageBody(key: PageKey): Promise<string> {
  try {
    const { data, error } = await supabaseAnon
      .from('pages')
      .select('body_html')
      .eq('key', key)
      .maybeSingle();

    if (error || !data?.body_html) return DEFAULTS[key];
    return data.body_html;
  } catch {
    return DEFAULTS[key];
  }
}
