/**
 * Editable site settings. Single-row table in Supabase (`settings` where key='site')
 * containing a structured JSONB value. Read at build time for public pages and
 * on request for admin pages.
 */

import { supabaseAnon } from './supabase';
import { z } from 'zod';

export const clinicalInterestSchema = z.object({
  title: z.string().min(1).max(80),
  note:  z.string().min(1).max(200),
});
export type ClinicalInterest = z.infer<typeof clinicalInterestSchema>;

export const siteSettingsSchema = z.object({
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
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const defaultSettings: SiteSettings = {
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
};

/**
 * Fetch the current site settings. Falls back to defaults if the row is missing
 * or the shape is invalid. Never throws — public pages must still render.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabaseAnon
      .from('settings')
      .select('value')
      .eq('key', 'site')
      .maybeSingle();

    if (error || !data) return defaultSettings;

    const parsed = siteSettingsSchema.safeParse(data.value);
    if (!parsed.success) {
      console.warn('[settings] invalid shape in DB, falling back to defaults:', parsed.error.message);
      return defaultSettings;
    }
    return parsed.data;
  } catch (e) {
    console.warn('[settings] fetch failed, falling back to defaults:', (e as Error).message);
    return defaultSettings;
  }
}
