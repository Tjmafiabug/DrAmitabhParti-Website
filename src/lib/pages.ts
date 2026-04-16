/**
 * Long-form editable page bodies (About, Credentials intro, etc).
 * Stored in the `pages` table keyed by slug. Rendered via set:html on the
 * public pages. Falls back to a default HTML string if the row is missing.
 */

import { supabaseAnon } from './supabase';

export type PageKey = 'about' | 'credentials';

const DEFAULTS: Record<PageKey, string> = {
  about: `<p>A biographical page — to be developed from an interview with Dr. Parti.</p>`,
  credentials: `<p>A short preamble for the CV — to be developed.</p>`,
};

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
