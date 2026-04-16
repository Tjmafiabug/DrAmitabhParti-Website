import { useState } from 'react';
import type {
  SiteSettings,
  ClinicalInterest,
  NavLink,
} from '../../lib/settings';
import { HERO_PAGE_KEYS, SEO_PAGE_KEYS } from '../../lib/pageKeys';

interface Props { initial: SiteSettings; }

export default function SettingsForm({ initial }: Props) {
  const [s, setS] = useState<SiteSettings>(initial);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaveState('saving'); setErr(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(s),
      });
      if (res.status === 401) throw new Error('Your session expired. Please sign in again.');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'Save failed');
      setSaveState('saved');
      window.setTimeout(() => setSaveState('idle'), 1800);
    } catch (e) {
      setErr((e as Error).message); setSaveState('error');
    }
  };

  const patch = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  // --- Image upload helper (shared by portrait + default OG image) ----------
  const uploadImage = async (file: File): Promise<string | null> => {
    if (file.size > 10 * 1024 * 1024) { setErr('Image too large (max 10 MB).'); return null; }
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message ?? `Upload failed (${res.status})`);
      }
      const data = await res.json();
      return data.url as string;
    } catch (e) { setErr((e as Error).message); return null; }
  };

  return (
    <div>
      <StickyBar saveState={saveState} onSave={save} />

      {err && <div className="admin-flash admin-flash-error">{err}</div>}

      <div className="admin-flash admin-flash-info">
        Changes save immediately. The public site reads settings on every request — updates are live within seconds.
      </div>

      {/* ============ IDENTITY ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Identity</h2>
          <p>The doctor's name, role, and credentials — used across every page.</p>
        </div>

        <Grid2>
          <Field label="Full name">
            <input className="admin-input" value={s.identity.name}
              onChange={(e) => patch('identity', { ...s.identity, name: e.target.value })} />
          </Field>
          <Field label="Short name" help="Used where space is tight (footer brand, etc).">
            <input className="admin-input" value={s.identity.short_name}
              onChange={(e) => patch('identity', { ...s.identity, short_name: e.target.value })} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Title suffix" help="Appended to page titles: e.g. 'About — Dr. X'.">
            <input className="admin-input" value={s.identity.title_suffix}
              onChange={(e) => patch('identity', { ...s.identity, title_suffix: e.target.value })} />
          </Field>
          <Field label="Site URL (canonical)">
            <input type="url" className="admin-input" value={s.identity.site_url}
              onChange={(e) => patch('identity', { ...s.identity, site_url: e.target.value })} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Role (full)">
            <input className="admin-input" value={s.identity.role}
              onChange={(e) => patch('identity', { ...s.identity, role: e.target.value })} />
          </Field>
          <Field label="Role (short)">
            <input className="admin-input" value={s.identity.role_short}
              onChange={(e) => patch('identity', { ...s.identity, role_short: e.target.value })} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="Institution (full)">
            <input className="admin-input" value={s.identity.institution}
              onChange={(e) => patch('identity', { ...s.identity, institution: e.target.value })} />
          </Field>
          <Field label="Institution (short)">
            <input className="admin-input" value={s.identity.institution_short}
              onChange={(e) => patch('identity', { ...s.identity, institution_short: e.target.value })} />
          </Field>
        </Grid2>

        <Grid2>
          <Field label="City">
            <input className="admin-input" value={s.identity.city}
              onChange={(e) => patch('identity', { ...s.identity, city: e.target.value })} />
          </Field>
          <Field label="University">
            <input className="admin-input" value={s.identity.university}
              onChange={(e) => patch('identity', { ...s.identity, university: e.target.value })} />
          </Field>
        </Grid2>

        <Grid4>
          <Field label="Years of experience">
            <input type="number" min={0} max={100} className="admin-input" value={s.identity.experience_years}
              onChange={(e) => patch('identity', { ...s.identity, experience_years: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="Post-specialisation years">
            <input type="number" min={0} max={100} className="admin-input" value={s.identity.post_spec_years}
              onChange={(e) => patch('identity', { ...s.identity, post_spec_years: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="MBBS year">
            <input type="number" min={1900} max={2100} className="admin-input" value={s.identity.mbbs_year}
              onChange={(e) => patch('identity', { ...s.identity, mbbs_year: Number(e.target.value) || 1990 })} />
          </Field>
          <Field label="MD year">
            <input type="number" min={1900} max={2100} className="admin-input" value={s.identity.md_year}
              onChange={(e) => patch('identity', { ...s.identity, md_year: Number(e.target.value) || 1995 })} />
          </Field>
        </Grid4>

        <Field label="Tagline" help="One-line elevator pitch.">
          <input className="admin-input" value={s.identity.tagline}
            onChange={(e) => patch('identity', { ...s.identity, tagline: e.target.value })} />
        </Field>

        <Field label="Meta description" help="Shown in Google results and social shares when a page has no specific description.">
          <textarea className="admin-textarea" rows={3} value={s.identity.description}
            onChange={(e) => patch('identity', { ...s.identity, description: e.target.value })} />
        </Field>

        <ImageField
          label="Portrait image"
          help="Used on the home hero and the About page. PNG with a transparent background recommended."
          url={s.identity.portrait_url}
          onUpload={async (f) => { const url = await uploadImage(f); if (url) patch('identity', { ...s.identity, portrait_url: url }); }}
          onUrlChange={(url) => patch('identity', { ...s.identity, portrait_url: url })}
        />

        <Field label="Portrait alt text" help="Descriptive alt text for the portrait — shown to screen readers.">
          <input className="admin-input" value={s.identity.portrait_alt}
            onChange={(e) => patch('identity', { ...s.identity, portrait_alt: e.target.value })} />
        </Field>
      </section>

      {/* ============ HERO QUOTE ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Home hero quote</h2>
          <p>The italic quote at the top of the home page.</p>
        </div>
        <Field label="Quote">
          <textarea rows={3} value={s.hero.quote} className="admin-textarea"
            onChange={(e) => patch('hero', { ...s.hero, quote: e.target.value })} />
        </Field>
        <Field label="Highlighted phrase" help="Exact substring from the quote rendered in the gold accent. Leave blank to skip.">
          <input className="admin-input" value={s.hero.highlight}
            onChange={(e) => patch('hero', { ...s.hero, highlight: e.target.value })} />
        </Field>
        <Field label="Attribution line">
          <input className="admin-input" value={s.hero.attribution}
            onChange={(e) => patch('hero', { ...s.hero, attribution: e.target.value })} />
        </Field>
      </section>

      {/* ============ CONTACT + ADDRESS ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Contact</h2>
          <p>Used on the Contact page, footer, and article reply links.</p>
        </div>
        <Grid2>
          <Field label="Email">
            <input type="email" className="admin-input" value={s.contact.email}
              onChange={(e) => patch('contact', { ...s.contact, email: e.target.value })} />
          </Field>
          <Field label="Fortis profile URL">
            <input type="url" className="admin-input" value={s.contact.fortis_profile}
              onChange={(e) => patch('contact', { ...s.contact, fortis_profile: e.target.value })} />
          </Field>
        </Grid2>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Clinic address</h2>
        </div>
        <Field label="Hospital / clinic">
          <input className="admin-input" value={s.address.hospital}
            onChange={(e) => patch('address', { ...s.address, hospital: e.target.value })} />
        </Field>
        <Field label="Address line 1">
          <input className="admin-input" value={s.address.line1}
            onChange={(e) => patch('address', { ...s.address, line1: e.target.value })} />
        </Field>
        <Field label="Address line 2">
          <input className="admin-input" value={s.address.line2}
            onChange={(e) => patch('address', { ...s.address, line2: e.target.value })} />
        </Field>
        <Field label="Country">
          <input className="admin-input" value={s.address.country}
            onChange={(e) => patch('address', { ...s.address, country: e.target.value })} />
        </Field>
      </section>

      {/* ============ CLINICAL INTERESTS ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Clinical interests <span className="admin-muted" style={{ fontWeight: 400 }}>· {s.clinical_interests.length} of 24</span></h2>
          <p>Listed on the home page and credentials page.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {s.clinical_interests.map((it, i) => (
            <div key={i} style={{ border: '1px solid var(--a-border)', borderRadius: 4, padding: '0.75rem 0.85rem', background: 'var(--a-surface-alt)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <input type="text" placeholder="Title" value={it.title} onChange={(e) => {
                  const a = [...s.clinical_interests]; a[i] = { ...it, title: e.target.value }; patch('clinical_interests', a);
                }} className="admin-input" style={{ height: 34 }} />
                <input type="text" placeholder="Short note (one line)" value={it.note} onChange={(e) => {
                  const a = [...s.clinical_interests]; a[i] = { ...it, note: e.target.value }; patch('clinical_interests', a);
                }} className="admin-input" style={{ height: 34 }} />
              </div>
              <ListControls
                onUp={() => moveItem(s.clinical_interests, i, -1, (v) => patch('clinical_interests', v))}
                onDown={() => moveItem(s.clinical_interests, i,  1, (v) => patch('clinical_interests', v))}
                onDelete={() => patch('clinical_interests', s.clinical_interests.filter((_, idx) => idx !== i))}
                canUp={i > 0}
                canDown={i < s.clinical_interests.length - 1}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => patch('clinical_interests', [...s.clinical_interests, { title: '', note: '' } as ClinicalInterest])} disabled={s.clinical_interests.length >= 24} className="admin-btn admin-btn-secondary" style={{ marginTop: '0.75rem' }}>+ Add interest</button>
      </section>

      {/* ============ EMPANELMENTS ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Corporate empanelments <span className="admin-muted" style={{ fontWeight: 400 }}>· {s.empanelments.length} of 24</span></h2>
          <p>Listed on the home page and credentials page.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {s.empanelments.map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input type="text" placeholder="Company or institution name" value={e} onChange={(ev) => {
                const a = [...s.empanelments]; a[i] = ev.target.value; patch('empanelments', a);
              }} className="admin-input" />
              <ListControls
                onUp={() => moveItem(s.empanelments, i, -1, (v) => patch('empanelments', v))}
                onDown={() => moveItem(s.empanelments, i,  1, (v) => patch('empanelments', v))}
                onDelete={() => patch('empanelments', s.empanelments.filter((_, idx) => idx !== i))}
                canUp={i > 0}
                canDown={i < s.empanelments.length - 1}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => patch('empanelments', [...s.empanelments, ''])} disabled={s.empanelments.length >= 24} className="admin-btn admin-btn-secondary" style={{ marginTop: '0.75rem' }}>+ Add empanelment</button>
      </section>

      {/* ============ NAV ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Top navigation</h2>
          <p>Links in the main site navigation, left-to-right.</p>
        </div>
        <LinkListEditor
          links={s.nav}
          onChange={(v) => patch('nav', v)}
          addLabel="+ Add nav item"
          max={12}
        />
      </section>

      {/* ============ FOOTER ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Footer</h2>
        </div>

        <Grid2>
          <Field label="Brand line">
            <input className="admin-input" value={s.footer.brand_line}
              onChange={(e) => patch('footer', { ...s.footer, brand_line: e.target.value })} />
          </Field>
          <Field label="Standing disclaimer line">
            <input className="admin-input" value={s.footer.tagline}
              onChange={(e) => patch('footer', { ...s.footer, tagline: e.target.value })} />
          </Field>
        </Grid2>

        <h3 className="admin-label" style={{ marginTop: '1rem' }}>Read column</h3>
        <LinkListEditor
          links={s.footer.read}
          onChange={(v) => patch('footer', { ...s.footer, read: v })}
          addLabel="+ Add link"
          max={12}
        />

        <h3 className="admin-label" style={{ marginTop: '1.5rem' }}>Correspond column</h3>
        <LinkListEditor
          links={s.footer.correspond}
          onChange={(v) => patch('footer', { ...s.footer, correspond: v })}
          addLabel="+ Add link"
          max={12}
        />

        <h3 className="admin-label" style={{ marginTop: '1.5rem' }}>Fine print column</h3>
        <LinkListEditor
          links={s.footer.legal}
          onChange={(v) => patch('footer', { ...s.footer, legal: v })}
          addLabel="+ Add link"
          max={12}
        />
      </section>

      {/* ============ HEROES (per-page) ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Page heroes</h2>
          <p>The dark introduction band at the top of each subsidiary page.</p>
        </div>
        {HERO_PAGE_KEYS.map((pk) => {
          const h = s.heroes[pk];
          return (
            <div key={pk} style={{ border: '1px solid var(--a-border)', borderRadius: 4, padding: '1rem', marginBottom: '0.75rem', background: 'var(--a-surface-alt)' }}>
              <p className="admin-label" style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                {pk === 'not_found' ? '404 page' : pk}
              </p>
              <Grid2>
                <Field label="Eyebrow">
                  <input className="admin-input" value={h.eyebrow}
                    onChange={(e) => patch('heroes', { ...s.heroes, [pk]: { ...h, eyebrow: e.target.value } })} />
                </Field>
                <Field label="Title">
                  <input className="admin-input" value={h.title}
                    onChange={(e) => patch('heroes', { ...s.heroes, [pk]: { ...h, title: e.target.value } })} />
                </Field>
              </Grid2>
              <Field label="Italic continuation">
                <input className="admin-input" value={h.title_italic}
                  onChange={(e) => patch('heroes', { ...s.heroes, [pk]: { ...h, title_italic: e.target.value } })} />
              </Field>
              <Field label="Kicker paragraph (optional)">
                <textarea rows={2} className="admin-textarea" value={h.kicker}
                  onChange={(e) => patch('heroes', { ...s.heroes, [pk]: { ...h, kicker: e.target.value } })} />
              </Field>
            </div>
          );
        })}
      </section>

      {/* ============ SEO ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>SEO &amp; social</h2>
          <p>Page titles, meta descriptions, and the default share image.</p>
        </div>

        <Field label="Default description" help="Used on pages that have no specific description.">
          <textarea rows={2} className="admin-textarea" value={s.seo.default_description}
            onChange={(e) => patch('seo', { ...s.seo, default_description: e.target.value })} />
        </Field>

        <ImageField
          label="Default share image (OG image)"
          help="Shown when a link to this site is shared on social media. 1200×630px recommended."
          url={s.seo.og_image_url}
          onUpload={async (f) => { const url = await uploadImage(f); if (url) patch('seo', { ...s.seo, og_image_url: url }); }}
          onUrlChange={(url) => patch('seo', { ...s.seo, og_image_url: url })}
        />

        <div style={{ marginTop: '1rem' }}>
          {SEO_PAGE_KEYS.map((pk) => {
            const meta = s.seo.pages[pk] ?? { title: null, description: null };
            return (
              <div key={pk} style={{ border: '1px solid var(--a-border)', borderRadius: 4, padding: '0.85rem', marginBottom: '0.5rem', background: 'var(--a-surface-alt)' }}>
                <p className="admin-label" style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                  {pk === 'not_found' ? '404 page' : pk}
                </p>
                <Grid2>
                  <Field label="Page title">
                    <input className="admin-input" value={meta.title ?? ''}
                      onChange={(e) => {
                        const pages = { ...s.seo.pages, [pk]: { ...meta, title: e.target.value || null } };
                        patch('seo', { ...s.seo, pages });
                      }} />
                  </Field>
                  <Field label="Meta description">
                    <input className="admin-input" value={meta.description ?? ''}
                      onChange={(e) => {
                        const pages = { ...s.seo.pages, [pk]: { ...meta, description: e.target.value || null } };
                        patch('seo', { ...s.seo, pages });
                      }} />
                  </Field>
                </Grid2>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ HOME EXTRAS ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Home page extras</h2>
          <p>Other copy on the home page beyond the hero quote.</p>
        </div>
        <Field label="Intro paragraph (HTML allowed)" help="Shown under the hero quote. Simple HTML links are allowed.">
          <textarea rows={4} className="admin-textarea admin-mono" value={s.home.intro_paragraph_html}
            onChange={(e) => patch('home', { ...s.home, intro_paragraph_html: e.target.value })} />
        </Field>
        <Field label="Credibility strip — appointment label">
          <input className="admin-input" value={s.home.credibility_appointment_label}
            onChange={(e) => patch('home', { ...s.home, credibility_appointment_label: e.target.value })} />
        </Field>
        <Field label="Closing pull-quote (HTML allowed)">
          <textarea rows={3} className="admin-textarea admin-mono" value={s.home.closing_quote}
            onChange={(e) => patch('home', { ...s.home, closing_quote: e.target.value })} />
        </Field>
        <Field label="Closing pull-quote caption">
          <input className="admin-input" value={s.home.closing_quote_meta}
            onChange={(e) => patch('home', { ...s.home, closing_quote_meta: e.target.value })} />
        </Field>
      </section>

      {/* ============ ABOUT EXTRAS ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>About page extras</h2>
        </div>
        <Field label="Lede quote" help="Large pull-quote shown next to the portrait at the top of the About page.">
          <textarea rows={3} className="admin-textarea" value={s.about.lede_quote}
            onChange={(e) => patch('about', { ...s.about, lede_quote: e.target.value })} />
        </Field>
        <Grid2>
          <Field label="Lede source link (href)" help="Leave blank for no link.">
            <input className="admin-input" value={s.about.lede_source_href}
              onChange={(e) => patch('about', { ...s.about, lede_source_href: e.target.value })} />
          </Field>
          <Field label="Lede source label">
            <input className="admin-input" value={s.about.lede_source_label}
              onChange={(e) => patch('about', { ...s.about, lede_source_label: e.target.value })} />
          </Field>
        </Grid2>
        <Field label="Sign-off line">
          <input className="admin-input" value={s.about.sign_off}
            onChange={(e) => patch('about', { ...s.about, sign_off: e.target.value })} />
        </Field>
      </section>

      {/* ============ CONTACT PAGE ============ */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Contact page map</h2>
        </div>
        <Field label="Google Maps embed URL" help="Paste the 'Embed map' iframe src from Google Maps (share → embed).">
          <input type="url" className="admin-input" value={s.contact_page.map_embed_url}
            onChange={(e) => patch('contact_page', { ...s.contact_page, map_embed_url: e.target.value })} />
        </Field>
        <Field label="Map iframe title" help="Accessibility label for the map embed.">
          <input className="admin-input" value={s.contact_page.map_iframe_title}
            onChange={(e) => patch('contact_page', { ...s.contact_page, map_iframe_title: e.target.value })} />
        </Field>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="button" onClick={() => void save()} className="admin-btn admin-btn-primary">Save</button>
      </div>
    </div>
  );
}

// --- Sub-components ---------------------------------------------------------

function StickyBar({ saveState, onSave }: { saveState: 'idle' | 'saving' | 'saved' | 'error'; onSave: () => void }) {
  return (
    <div className="admin-actionbar">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Site settings</h1>
        <p className="admin-page-sub" style={{ marginTop: 2 }}>Everything editable that appears across the public site.</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="admin-meta">
          {saveState === 'saving' && 'Saving…'}
          {saveState === 'saved' && '✓ Saved'}
          {saveState === 'error' && <span style={{ color: 'var(--a-danger)' }}>Error</span>}
        </span>
        <button type="button" onClick={onSave} className="admin-btn admin-btn-primary">Save</button>
      </div>
    </div>
  );
}

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {children}
      {help && <p className="admin-help">{help}</p>}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>{children}</div>;
}
function Grid4({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>{children}</div>;
}

function ImageField({ label, help, url, onUpload, onUrlChange }: { label: string; help?: string; url: string; onUpload: (f: File) => Promise<void>; onUrlChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const handle = async (f: File) => { setUploading(true); try { await onUpload(f); } finally { setUploading(false); } };
  return (
    <Field label={label} help={help}>
      {url && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.6rem' }}>
          <img src={url} alt="" style={{ width: 96, height: 96, objectFit: 'cover', background: 'var(--a-surface-alt)', border: '1px solid var(--a-border)', borderRadius: 4 }} />
          <input type="text" value={url} onChange={(e) => onUrlChange(e.target.value)} className="admin-input admin-mono" style={{ fontSize: '0.8rem' }} />
        </div>
      )}
      <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: 'pointer', display: 'inline-block' }}>
        {uploading ? 'Uploading…' : (url ? 'Replace image' : 'Upload image')}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handle(f); e.target.value = ''; }} />
      </label>
      {url && (
        <button type="button" onClick={() => onUrlChange('')} className="admin-btn admin-btn-ghost admin-btn-sm" style={{ marginLeft: '0.5rem' }}>Clear</button>
      )}
    </Field>
  );
}

function LinkListEditor({ links, onChange, addLabel, max = 12 }: { links: NavLink[]; onChange: (v: NavLink[]) => void; addLabel: string; max?: number }) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((l, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr auto', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" placeholder="Label" value={l.label}
              onChange={(e) => { const a = [...links]; a[i] = { ...l, label: e.target.value }; onChange(a); }}
              className="admin-input" style={{ height: 34 }} />
            <input type="text" placeholder="/path or https://…" value={l.href}
              onChange={(e) => { const a = [...links]; a[i] = { ...l, href: e.target.value }; onChange(a); }}
              className="admin-input admin-mono" style={{ height: 34, fontSize: '0.85rem' }} />
            <ListControls
              onUp={() => { const a = [...links]; if (i === 0) return; [a[i-1], a[i]] = [a[i], a[i-1]]; onChange(a); }}
              onDown={() => { const a = [...links]; if (i === a.length - 1) return; [a[i+1], a[i]] = [a[i], a[i+1]]; onChange(a); }}
              onDelete={() => onChange(links.filter((_, idx) => idx !== i))}
              canUp={i > 0}
              canDown={i < links.length - 1}
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...links, { href: '', label: '' }])} disabled={links.length >= max} className="admin-btn admin-btn-secondary" style={{ marginTop: '0.6rem' }}>{addLabel}</button>
    </>
  );
}

function ListControls({ onUp, onDown, onDelete, canUp, canDown }: { onUp: () => void; onDown: () => void; onDelete: () => void; canUp: boolean; canDown: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <button type="button" onClick={onUp}     disabled={!canUp}   className="admin-btn admin-btn-ghost admin-btn-sm" aria-label="Move up">↑</button>
      <button type="button" onClick={onDown}   disabled={!canDown} className="admin-btn admin-btn-ghost admin-btn-sm" aria-label="Move down">↓</button>
      <button type="button" onClick={onDelete} className="admin-btn admin-btn-ghost admin-btn-sm" aria-label="Delete" style={{ color: 'var(--a-danger)' }}>×</button>
    </div>
  );
}

function moveItem<T>(arr: T[], i: number, dir: -1 | 1, set: (v: T[]) => void) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  const a = [...arr]; [a[i], a[j]] = [a[j], a[i]]; set(a);
}
