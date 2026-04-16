import { useState } from 'react';
import type { SiteSettings, ClinicalInterest } from '../../lib/settings';

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

  const patch = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((prev) => ({ ...prev, [k]: v }));

  const updateInterest = (i: number, next: ClinicalInterest) => { const a = [...s.clinical_interests]; a[i] = next; patch('clinical_interests', a); };
  const addInterest   = () => patch('clinical_interests', [...s.clinical_interests, { title: '', note: '' }]);
  const removeInterest= (i: number) => patch('clinical_interests', s.clinical_interests.filter((_, idx) => idx !== i));
  const moveInterest  = (i: number, dir: -1 | 1) => {
    const a = [...s.clinical_interests]; const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; patch('clinical_interests', a);
  };

  const updateEmp = (i: number, v: string) => { const a = [...s.empanelments]; a[i] = v; patch('empanelments', a); };
  const addEmp    = () => patch('empanelments', [...s.empanelments, '']);
  const removeEmp = (i: number) => patch('empanelments', s.empanelments.filter((_, idx) => idx !== i));
  const moveEmp   = (i: number, dir: -1 | 1) => {
    const a = [...s.empanelments]; const j = i + dir;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; patch('empanelments', a);
  };

  return (
    <div>
      <div className="admin-actionbar">
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Site settings</h1>
          <p className="admin-page-sub" style={{ marginTop: 2 }}>Editable content that appears across the public site.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="admin-meta">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && '✓ Saved'}
            {saveState === 'error' && <span style={{ color: 'var(--a-danger)' }}>Error</span>}
          </span>
          <button type="button" onClick={() => void save()} className="admin-btn admin-btn-primary">Save</button>
        </div>
      </div>

      {err && <div className="admin-flash admin-flash-error">{err}</div>}

      <div className="admin-flash admin-flash-info">
        Changes save immediately. The public site is static, so updates appear after the next deploy or rebuild.
      </div>

      {/* Hero Quote */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Hero quote</h2>
          <p>The italic quote at the top of the home page.</p>
        </div>
        <div className="admin-field">
          <label className="admin-label">Quote</label>
          <textarea rows={3} value={s.hero.quote} onChange={(e) => patch('hero', { ...s.hero, quote: e.target.value })} className="admin-textarea" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Highlighted phrase</label>
          <input type="text" value={s.hero.highlight} onChange={(e) => patch('hero', { ...s.hero, highlight: e.target.value })} className="admin-input" />
          <p className="admin-help">Exact substring from the quote that's rendered in the gold accent colour. Leave blank to skip.</p>
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label className="admin-label">Attribution line</label>
          <input type="text" value={s.hero.attribution} onChange={(e) => patch('hero', { ...s.hero, attribution: e.target.value })} className="admin-input" />
        </div>
      </section>

      {/* Contact */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Contact</h2>
          <p>Used on the Contact page and in the footer.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Email</label>
            <input type="email" value={s.contact.email} onChange={(e) => patch('contact', { ...s.contact, email: e.target.value })} className="admin-input" />
          </div>
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label className="admin-label">Fortis profile URL</label>
            <input type="url" value={s.contact.fortis_profile} onChange={(e) => patch('contact', { ...s.contact, fortis_profile: e.target.value })} className="admin-input" />
          </div>
        </div>
      </section>

      {/* Address */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Clinic address</h2>
        </div>
        <div className="admin-field">
          <label className="admin-label">Hospital / clinic</label>
          <input type="text" value={s.address.hospital} onChange={(e) => patch('address', { ...s.address, hospital: e.target.value })} className="admin-input" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Address line 1</label>
          <input type="text" value={s.address.line1} onChange={(e) => patch('address', { ...s.address, line1: e.target.value })} className="admin-input" />
        </div>
        <div className="admin-field">
          <label className="admin-label">Address line 2</label>
          <input type="text" value={s.address.line2} onChange={(e) => patch('address', { ...s.address, line2: e.target.value })} className="admin-input" />
        </div>
        <div className="admin-field" style={{ marginBottom: 0 }}>
          <label className="admin-label">Country</label>
          <input type="text" value={s.address.country} onChange={(e) => patch('address', { ...s.address, country: e.target.value })} className="admin-input" />
        </div>
      </section>

      {/* Clinical interests */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Clinical interests <span className="admin-muted" style={{ fontWeight: 400 }}>· {s.clinical_interests.length} of 24</span></h2>
          <p>Listed on the home page and credentials page.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {s.clinical_interests.map((it, i) => (
            <div key={i} style={{ border: '1px solid var(--a-border)', borderRadius: 4, padding: '0.75rem 0.85rem', background: 'var(--a-surface-alt)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <input type="text" placeholder="Title" value={it.title} onChange={(e) => updateInterest(i, { ...it, title: e.target.value })} className="admin-input" style={{ height: 34 }} />
                <input type="text" placeholder="Short note (one line)" value={it.note} onChange={(e) => updateInterest(i, { ...it, note: e.target.value })} className="admin-input" style={{ height: 34 }} />
              </div>
              <ListControls
                onUp={() => moveInterest(i, -1)}
                onDown={() => moveInterest(i, 1)}
                onDelete={() => removeInterest(i)}
                canUp={i > 0}
                canDown={i < s.clinical_interests.length - 1}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addInterest} disabled={s.clinical_interests.length >= 24} className="admin-btn admin-btn-secondary" style={{ marginTop: '0.75rem' }}>+ Add interest</button>
      </section>

      {/* Empanelments */}
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Corporate empanelments <span className="admin-muted" style={{ fontWeight: 400 }}>· {s.empanelments.length} of 24</span></h2>
          <p>Listed on the home page and credentials page.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {s.empanelments.map((e, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input type="text" placeholder="Company or institution name" value={e} onChange={(ev) => updateEmp(i, ev.target.value)} className="admin-input" />
              <ListControls
                onUp={() => moveEmp(i, -1)}
                onDown={() => moveEmp(i, 1)}
                onDelete={() => removeEmp(i)}
                canUp={i > 0}
                canDown={i < s.empanelments.length - 1}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={addEmp} disabled={s.empanelments.length >= 24} className="admin-btn admin-btn-secondary" style={{ marginTop: '0.75rem' }}>+ Add empanelment</button>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <button type="button" onClick={() => void save()} className="admin-btn admin-btn-primary">Save</button>
      </div>
    </div>
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
