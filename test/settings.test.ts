import { describe, it, expect } from 'vitest';
import { deepMergeDefaults, defaultSettings, siteSettingsSchema } from '../src/lib/settings';

describe('deepMergeDefaults', () => {
  it('returns defaults unchanged when override is empty', () => {
    const out = deepMergeDefaults(defaultSettings, {});
    expect(out).toEqual(defaultSettings);
  });

  it('overrides leaf values', () => {
    const out = deepMergeDefaults(defaultSettings, { contact: { email: 'new@example.com' } });
    expect(out.contact.email).toBe('new@example.com');
    // Siblings preserved
    expect(out.contact.fortis_profile).toBe(defaultSettings.contact.fortis_profile);
  });

  it('deep-merges nested objects, preserving unspecified branches', () => {
    const out = deepMergeDefaults(defaultSettings, {
      identity: { name: 'Dr. X' },
      hero:     { quote: 'Q', attribution: 'A' },
    });
    expect(out.identity.name).toBe('Dr. X');
    expect(out.identity.role).toBe(defaultSettings.identity.role);
    expect(out.hero.quote).toBe('Q');
    // clinical_interests should not be touched
    expect(out.clinical_interests).toEqual(defaultSettings.clinical_interests);
  });

  it('replaces arrays wholesale (does not merge by index)', () => {
    const out = deepMergeDefaults(defaultSettings, { empanelments: ['Only One'] });
    expect(out.empanelments).toEqual(['Only One']);
  });

  it('returns defaults when override is not an object', () => {
    expect(deepMergeDefaults(defaultSettings, null)).toEqual(defaultSettings);
    expect(deepMergeDefaults(defaultSettings, 'garbage')).toEqual(defaultSettings);
  });
});

describe('siteSettingsSchema', () => {
  it('parses the defaults cleanly (sanity check on the defaults themselves)', () => {
    const parsed = siteSettingsSchema.safeParse(defaultSettings);
    expect(parsed.success).toBe(true);
  });

  it('rejects a bad email on contact.email', () => {
    const bad = { ...defaultSettings, contact: { ...defaultSettings.contact, email: 'not-an-email' } };
    const parsed = siteSettingsSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });

  it('rejects a non-URL site_url', () => {
    const bad = {
      ...defaultSettings,
      identity: { ...defaultSettings.identity, site_url: 'not-a-url' },
    };
    const parsed = siteSettingsSchema.safeParse(bad);
    expect(parsed.success).toBe(false);
  });
});
