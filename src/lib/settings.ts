/**
 * Editable site settings — the single source of truth for every piece of
 * non-body content on the site.
 *
 * Shape is stored as a single JSONB value in `settings` where key = 'site'.
 * Read at request time by every page, editable from /admin/settings.
 *
 * If the DB row is missing or the shape drifts, we fall back to `defaultSettings`
 * so the public site never breaks.
 */

import { supabaseAnon } from './supabase';
import { z } from 'zod';
import {
  SEO_PAGE_KEYS, type SeoPageKey,
  HERO_PAGE_KEYS, type HeroPageKey,
} from './pageKeys';

// Re-export so existing callers (admin + pages + API) keep working without
// caring that the constants live in a separate leaf file.
export { SEO_PAGE_KEYS, HERO_PAGE_KEYS };
export type { SeoPageKey, HeroPageKey };

// --- Primitive shapes -------------------------------------------------------

const navLinkSchema = z.object({
  href:  z.string().min(1).max(500),
  label: z.string().min(1).max(80),
});
export type NavLink = z.infer<typeof navLinkSchema>;

const heroSchema = z.object({
  eyebrow:       z.string().max(80).default(''),
  title:         z.string().max(200).default(''),
  title_italic:  z.string().max(200).default(''),
  kicker:        z.string().max(500).default(''),
});
export type PageHeroConfig = z.infer<typeof heroSchema>;

const seoMetaSchema = z.object({
  title:       z.string().max(120).nullable().default(null),
  description: z.string().max(320).nullable().default(null),
});
export type SeoMeta = z.infer<typeof seoMetaSchema>;

export const clinicalInterestSchema = z.object({
  title: z.string().min(1).max(80),
  note:  z.string().min(1).max(200),
});
export type ClinicalInterest = z.infer<typeof clinicalInterestSchema>;

// --- Identity / globals -----------------------------------------------------

const identitySchema = z.object({
  name:              z.string().min(1).max(120),
  short_name:        z.string().max(80).default(''),
  title_suffix:      z.string().max(120).default(''),
  role:              z.string().max(200).default(''),
  role_short:        z.string().max(120).default(''),
  institution:       z.string().max(200).default(''),
  institution_short: z.string().max(120).default(''),
  city:              z.string().max(80).default(''),
  experience_years:  z.number().int().min(0).max(100).default(0),
  post_spec_years:   z.number().int().min(0).max(100).default(0),
  mbbs_year:         z.number().int().min(1900).max(2100).default(1990),
  md_year:           z.number().int().min(1900).max(2100).default(1995),
  university:        z.string().max(200).default(''),
  tagline:           z.string().max(300).default(''),
  description:       z.string().max(500).default(''),
  portrait_url:      z.string().max(800).default(''),
  portrait_alt:      z.string().max(300).default(''),
  site_url:          z.string().url().max(200).default('https://amitabhparti.com'),
});
export type Identity = z.infer<typeof identitySchema>;

// --- SEO --------------------------------------------------------------------

const seoSchema = z.object({
  default_description: z.string().max(320).default(''),
  og_image_url:        z.string().max(800).default('/og-default.png'),
  pages: z.record(z.enum(SEO_PAGE_KEYS), seoMetaSchema),
});
export type SeoSettings = z.infer<typeof seoSchema>;

// --- Heroes (one per page) --------------------------------------------------

const heroesSchema = z.record(z.enum(HERO_PAGE_KEYS), heroSchema);

// --- Footer -----------------------------------------------------------------

const footerSchema = z.object({
  read:       z.array(navLinkSchema).max(12),
  correspond: z.array(navLinkSchema).max(12),
  legal:      z.array(navLinkSchema).max(12),
  tagline:    z.string().max(300).default(''),
  brand_line: z.string().max(120).default(''),
});

// --- Home page --------------------------------------------------------------

const homeSchema = z.object({
  intro_paragraph_html:          z.string().max(4000).default(''),
  credibility_appointment_label: z.string().max(200).default(''),
  closing_quote:                 z.string().max(800).default(''),
  closing_quote_meta:            z.string().max(120).default(''),
});

// --- About / Contact extras -------------------------------------------------

const aboutSchema = z.object({
  lede_quote:        z.string().max(800).default(''),
  lede_source_href:  z.string().max(500).default(''),
  lede_source_label: z.string().max(200).default(''),
  sign_off:          z.string().max(120).default(''),
});

const contactPageSchema = z.object({
  map_embed_url:    z.string().url().max(800).default(''),
  map_iframe_title: z.string().max(200).default(''),
});

// --- Root schema ------------------------------------------------------------

export const siteSettingsSchema = z.object({
  identity:     identitySchema,
  hero: z.object({
    quote:       z.string().min(1).max(600),
    highlight:   z.string().max(120).default(''),
    attribution: z.string().min(1).max(200),
  }),
  contact: z.object({
    email:          z.string().email().max(255),
    fortis_profile: z.string().url().max(500).optional().default(''),
  }),
  address: z.object({
    hospital: z.string().min(1).max(120),
    line1:    z.string().max(200).default(''),
    line2:    z.string().max(200).default(''),
    country:  z.string().max(80).default('India'),
  }),
  clinical_interests: z.array(clinicalInterestSchema).max(24),
  empanelments:       z.array(z.string().min(1).max(120)).max(24),
  nav:      z.array(navLinkSchema).max(12),
  footer:   footerSchema,
  seo:      seoSchema,
  heroes:   heroesSchema,
  home:     homeSchema,
  about:    aboutSchema,
  contact_page: contactPageSchema,
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

// --- Defaults ---------------------------------------------------------------

export const defaultSettings: SiteSettings = {
  identity: {
    name: 'Dr. Amitabh Parti',
    short_name: 'Amitabh Parti',
    title_suffix: 'Dr. Amitabh Parti',
    role: 'Senior Director & Unit Head, Internal Medicine',
    role_short: 'Internal Medicine',
    institution: 'Fortis Memorial Research Institute, Gurgaon',
    institution_short: 'Fortis Memorial, Gurgaon',
    city: 'Gurgaon',
    experience_years: 38,
    post_spec_years: 32,
    mbbs_year: 1986,
    md_year: 1991,
    university: 'University of Punjab',
    tagline: 'Advancing medical thought through clinical rigour and public education.',
    description: 'The professional home of Dr. Amitabh Parti — internal medicine consultant at Fortis Memorial Research Institute, Gurgaon. Essays, notes, and educational writing on general medicine and public health.',
    portrait_url: '/images/parti-hero.jpeg',
    portrait_alt: 'Dr. Amitabh Parti, Senior Director of Internal Medicine at Fortis Memorial Research Institute, Gurgaon',
    site_url: 'https://amitabhparti.com',
  },
  hero: {
    quote: 'Medicine has built magnificent instruments. The single most consequential remains the willingness to listen.',
    highlight: 'willingness to listen',
    attribution: 'Dr. Amitabh Parti · Internal Medicine, Fortis Memorial, Gurgaon',
  },
  contact: {
    email: 'office@amitabhparti.com',
    fortis_profile: 'https://www.fortishealthcare.com/doctors/dr-amitabh-parti-1097',
  },
  address: {
    hospital: 'Fortis Memorial Research Institute',
    line1: 'Sector 44, Opposite HUDA City Centre Metro Station',
    line2: 'Gurugram, Haryana 122002',
    country: 'India',
  },
  clinical_interests: [
    { title: 'Infectious Disease',       note: 'Tropical, systemic, and everyday infections.' },
    { title: 'Hypertension',              note: 'Quiet, lifelong, and under-treated.' },
    { title: 'Diabetes Management',       note: 'A thirty-year conversation, held one visit at a time.' },
    { title: 'Thyroid Disorders',         note: 'Commoner than once thought; frequently missed.' },
    { title: 'Tropical Medicine',         note: 'The seasons and their diseases in North India.' },
    { title: 'General Internal Medicine', note: 'The specialist before specialists.' },
  ],
  empanelments: [
    'Engineers India Limited',
    'Ballarpur Industries Limited',
    'Indus Towers Limited',
    'Instyle Exports Limited',
    'University of Delhi',
  ],
  nav: [
    { href: '/about',       label: 'About' },
    { href: '/writing',     label: 'Writing' },
    { href: '/credentials', label: 'Credentials' },
    { href: '/media',       label: 'Media' },
    { href: '/contact',     label: 'Contact' },
  ],
  footer: {
    read: [
      { href: '/about',       label: 'About' },
      { href: '/credentials', label: 'Credentials' },
      { href: '/writing',     label: 'Writing' },
    ],
    correspond: [
      { href: '/contact', label: 'Contact' },
    ],
    legal: [
      { href: '/privacy',    label: 'Privacy' },
      { href: '/disclaimer', label: 'Disclaimer' },
    ],
    tagline:    'Educational content only. Not a substitute for individual medical advice.',
    brand_line: 'Dr. Amitabh Parti',
  },
  seo: {
    default_description: 'The professional home of Dr. Amitabh Parti — internal medicine consultant at Fortis Memorial Research Institute, Gurgaon. Essays, notes, and educational writing on general medicine and public health.',
    og_image_url: '/og-default.png',
    pages: {
      home:        { title: null,                 description: null },
      about:       { title: 'About',              description: 'A short biography of Dr. Amitabh Parti — internal medicine consultant at Fortis Memorial Research Institute, Gurgaon.' },
      credentials: { title: 'Credentials',        description: 'Education, qualifications, positions, and professional affiliations of Dr. Amitabh Parti.' },
      contact:     { title: 'Contact',            description: 'Practice address and professional correspondence for Dr. Amitabh Parti.' },
      writing:     { title: 'Writing',            description: 'Essays, notes, and educational articles on internal medicine and public health by Dr. Amitabh Parti.' },
      privacy:     { title: 'Privacy',            description: 'Privacy policy for amitabhparti.com.' },
      disclaimer:  { title: 'Medical Disclaimer', description: 'Medical disclaimer for amitabhparti.com.' },
      not_found:   { title: 'Not Found',          description: 'The page you were looking for has moved, or never existed.' },
    },
  },
  heroes: {
    about:       { eyebrow: 'About',              title: 'On a life',                     title_italic: 'in internal medicine.', kicker: '' },
    credentials: { eyebrow: 'Curriculum Vitae',   title: 'The record,',                   title_italic: 'in brief.',             kicker: '' },
    contact:     { eyebrow: 'Contact',            title: 'Where to find',                 title_italic: 'Dr. Parti.',            kicker: '' },
    writing:     { eyebrow: 'Writing',            title: 'Essays, notes,',                title_italic: 'and educational articles.', kicker: 'General writing on internal medicine, public health, and the quiet things that happen in consulting rooms. Educational only — please see the standing disclaimer at the foot of each article.' },
    privacy:     { eyebrow: 'Legal',              title: 'Privacy.',                      title_italic: '',                      kicker: '' },
    disclaimer:  { eyebrow: 'Legal',              title: 'Medical',                       title_italic: 'Disclaimer.',           kicker: '' },
    not_found:   { eyebrow: '404 — Not Found',   title: 'This page has wandered off',    title_italic: 'or never existed.',     kicker: '' },
  },
  home: {
    intro_paragraph_html: '<p>Dr. Parti writes on internal medicine, public health, and the discipline of clinical attention.</p>',
    credibility_appointment_label: 'Senior Director, Fortis Memorial',
    closing_quote: 'Medicine is not the application of science to biology. It is the <em>translation of evidence into empathy</em>, within the constraints of a human life.',
    closing_quote_meta: 'From the writing · 2026',
  },
  about: {
    lede_quote: 'The single most consequential diagnostic tool remains what it was in 1900 — the willingness to listen without hurry.',
    lede_source_href: '/writing/the-art-of-listening',
    lede_source_label: 'The Art of Listening',
    sign_off: '— Dr. Amitabh Parti',
  },
  contact_page: {
    map_embed_url: 'https://www.google.com/maps?q=Fortis+Memorial+Research+Institute+Gurgaon&output=embed',
    map_iframe_title: 'Fortis Memorial Research Institute, Gurgaon — map',
  },
};

/**
 * Fetch current site settings. Never throws — merges DB value over defaults
 * field-by-field so missing keys always resolve to a safe value.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabaseAnon
      .from('settings')
      .select('value')
      .eq('key', 'site')
      .maybeSingle();

    if (error || !data) return defaultSettings;

    // Merge DB value over defaults so a partially-filled row still validates.
    const merged = deepMergeDefaults(defaultSettings, data.value);
    const parsed = siteSettingsSchema.safeParse(merged);
    if (!parsed.success) {
      console.warn('[settings] invalid shape, falling back to defaults:', parsed.error.message);
      return defaultSettings;
    }
    return parsed.data;
  } catch (e) {
    console.warn('[settings] fetch failed, falling back to defaults:', (e as Error).message);
    return defaultSettings;
  }
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x);
}

/** @internal — exported for unit tests; prefer `getSettings()` in app code. */
export function deepMergeDefaults<T>(defaults: T, override: unknown): T {
  if (!isPlainObject(override)) return defaults;
  if (!isPlainObject(defaults)) return (override as T) ?? defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const k of Object.keys(override)) {
    const d = (defaults as Record<string, unknown>)[k];
    const o = (override as Record<string, unknown>)[k];
    out[k] = isPlainObject(d) && isPlainObject(o) ? deepMergeDefaults(d, o) : o;
  }
  return out as T;
}
