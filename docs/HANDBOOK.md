# The Doctor Website Handbook

> A living, opinionated manual for building premium personal websites for senior Indian doctors — ethical, editorial, owned by the doctor, handed over clean.
>
> **This is the source of truth.** Every decision we make, every piece of philosophy, every technical choice, every lesson from each client lives here. I (the assistant) am responsible for keeping it updated every time we make a new decision, change direction, or learn something worth remembering.
>
> **Current client featured throughout**: Dr. Amitabh Parti, Fortis Memorial Research Institute, Gurgaon.
> **Status**: v0.1 — during active build of the first client site (`amitabhparti.com`).

---

## Table of contents

1. [Why this agency exists](#1-why-this-agency-exists)
2. [The business model](#2-the-business-model)
3. [Regulatory & ethical posture (NMC)](#3-regulatory--ethical-posture-nmc)
4. [Design philosophy — The Digital Broadsheet](#4-design-philosophy--the-digital-broadsheet)
5. [The standard website anatomy](#5-the-standard-website-anatomy)
6. [Tech stack — decisions and rationale](#6-tech-stack--decisions-and-rationale)
7. [Architecture & data flow](#7-architecture--data-flow)
8. [Admin panel principles](#8-admin-panel-principles)
9. [Content voice & writing rules](#9-content-voice--writing-rules)
10. [The six-phase build process](#10-the-six-phase-build-process)
11. [Handover checklist](#11-handover-checklist)
12. [Ownership model](#12-ownership-model)
13. [Pricing & packaging](#13-pricing--packaging)
14. [Parked features & future menu](#14-parked-features--future-menu)
15. [Rejected ideas and why](#15-rejected-ideas-and-why)
16. [Per-client log](#16-per-client-log)
17. [Changelog](#17-changelog)

---

## 1. Why this agency exists

Most Indian doctor websites today are either:

- **Directory listings** (Practo, Lybrate, Justdial) — the doctor doesn't control the narrative.
- **Hospital doctor pages** — institutional, not personal.
- **Cheap SEO-agency WordPress builds** — loud, testimonial-stuffed, and quietly violating NMC regulations.

A senior doctor with thirty-plus years of practice deserves a **single authoritative digital home** that matches their professional stature — dignified, factual, educational, and ethically bulletproof.

The gap is real: clean, premium, NMC-compliant personal sites for India's top doctors effectively do not exist. This agency fills that gap, one bespoke site at a time.

---

## 2. The business model

- **Offering**: bespoke personal website + a simple admin panel, per doctor.
- **Pricing model**: one-time build fee. No SaaS. No recurring subscription trapping the doctor.
- **Ownership handover**: the doctor owns everything at launch — domain, Vercel, Supabase, GitHub, email. We walk away with a clean credentials document. No lock-in.
- **Optional**: a light annual "I'll handle any tech issues" retainer. Genuinely optional.
- **Target client**: senior, distinguished Indian doctors (20+ years of practice) who want a digital presence that reflects their stature, not a marketing funnel.
- **Not selling**: SaaS, website builder, advertising service, promotion service, patient-acquisition.

**Sales pitch in one sentence**:
> *"When a journalist, a fellowship committee, a young doctor, or a patient's family Googles your name, what shows up today? A Practo page. A hospital bio. An outdated stub. We fix that. We build the official Dr. X website — your credentials, your writing, your philosophy — in one place you own, ethically compliant, simple enough for you to update from your phone between patients."*

---

## 3. Regulatory & ethical posture (NMC)

### What applies today

The commonly cited **NMC Registered Medical Practitioner (Professional Conduct) Regulations, 2023** were kept in abeyance on 23 August 2023 and are not enforceable. What IS enforceable:

1. **Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, 2002** — still in force.
2. **NMC Social Media Guidelines for Doctors (2023, in effect)** — explicitly state *"RMP's webpages should also follow the same guidelines as social media."*

Note: enforcement has historically been inconsistent but is tightening. The right posture is to design as if the strictest reading applied.

**Disclaimer**: this handbook is a project working document, not legal advice. For every client, a medico-legal consultation is strongly recommended before launch.

### What is permitted

- Factual, verifiable professional information — name, qualifications, positions, experience.
- Formal announcements of practice (starting, change of address, resumption).
- Educational content for the public — essays, awareness articles, FAQs — written in general terms.
- Third-party factual coverage (press mentions, interviews) linked from the site.
- Organic SEO through genuine content and good technical hygiene.

### What is forbidden — NEVER include on any doctor's site we build

- Patient testimonials, reviews, ratings, star widgets.
- Embedded Google Reviews or any third-party review embed.
- Superlatives: "best", "leading", "renowned", "top-rated", "#1".
- "Book Appointment" / "Consult Now" / WhatsApp-to-doctor CTAs.
- Before/after photos, success-rate numbers, outcome statistics.
- Patient photographs, scans, investigation reports, operative images.
- Promotional award badges ("Top 10 Doctors of …") used as marketing.
- Contact forms with free-text message fields (solicitation risk + liability + data-protection trouble).
- Paid search rankings, purchased likes, purchased followers.
- Any illustration that makes the site feel like a clinic marketing page.

### The editorial copywriting discipline

- **Write like this**: *"Senior Director, Internal Medicine, Fortis Memorial Gurgaon." · "Clinical interests include diabetes, hypertension, thyroid disorders." · "For clinical consultation, see the hospital's official appointment page."*
- **Never write this**: *"Best physician in …" · "Renowned specialist" · "Trusted by thousands" · "Book an appointment now" · "Hear what patients say" · "Specialist in curing X".*

### The standing disclaimer (must appear on every article and in the footer)

> *"This is general educational content. It is not a substitute for individual medical advice. Please consult a qualified physician for guidance specific to your condition."*

### Additional safeguards we bake into every site

- Contact page routes all clinical traffic to the hospital's own appointment system. No on-site booking.
- Google Maps pin only — never embedded Google Reviews.
- Mailto link for correspondence, not a form. (Hard-learned: forms invite medical questions from patients, which creates liability.)
- Plausible analytics (cookie-less, no tracking, no ads).
- No paid acquisition anywhere — no Google Ads, no SEO backlink schemes.

---

## 4. Design philosophy — The Digital Broadsheet

### Creative north star

**"The Clinical Manuscript."** We reject the "app-like" fatigue of modern SaaS marketing pages. We borrow the intellectual authority of high-end medical journals and prestige newspaper broadsheets. The site curates a definitive record of a doctor's professional thought — not a dashboard, not a clinic brochure.

### Core rules — non-negotiable

1. **0 px border radius** on all structural elements. Only circular avatars may be fully rounded. **One documented exception**: pill-shaped CTAs are permitted **only inside a `.section-dark-hero` band** (see "Featured Introduction band" pattern below) — this is treated as a distinct visual idiom, not a breach of the rule.
2. **No 1 px decorative borders.** Section separation is achieved via tonal background shifts, not hairlines. Hairlines allowed only where a tonal shift is impossible.
3. **No drop-shadows** in the standard flow. Depth via tonal layering (`surface` → `surface-container-low` → `surface-container-high`). Ambient shadow only for truly floating elements.
4. **Whitespace is functional**, not decorative. Treat space as a luxury — a broadsheet earns trust by what it chooses not to shout.
5. **Asymmetric editorial grids** over symmetrical grids. Avoid the "Bootstrap three equal columns" feel.
6. **Typography-led, not illustration-led.** Photographs are restrained and editorially treated; no vector illustration, no cartoon icons.
7. **Animations are quiet.** `transition-colors 200ms ease` is the default. No bounce, no elastic, no elaborate scroll-jacked experiences. Respect `prefers-reduced-motion`.

### Colour palette — the standard Broadsheet tokens

Based on Material Design 3 tone theory. One warm anchor + one cool counterweight + one gold highlight + one brick accent. The tri-accent approach is the house standard — a single-accent Broadsheet reads too severe at page scale.

**Surfaces (tonal layering — no borders for structure)**

| Token | Hex | Role |
|---|---|---|
| `surface` | `#fbf9f4` | Primary background ("Soft Bone" / the paper) |
| `surface-container-lowest` | `#ffffff` | Maximum extrusion (rare) |
| `surface-container-low` | `#f5f3ee` | Section backgrounds, tonal shifts |
| `surface-container` | `#f0eee9` | |
| `surface-container-high` | `#eae8e3` | Recessed elements, portrait backdrops |
| `surface-container-highest` | `#e4e2dd` | |

**Ink**

| Token | Hex | Role |
|---|---|---|
| `on-surface` | `#1b1c19` | Primary ink |
| `on-surface-variant` | `#4e453f` | Secondary ink |
| `secondary` | `#5f5e5e` | Tertiary ink, metadata |

**Accents — the tri-palette**

| Token | Hex | Role |
|---|---|---|
| `primary` (warm clay) | `#6f5a4b` | Primary accent, CTAs, active states, "Essay" category |
| `primary-container` | `#b89f8d` | Hover / background tint of primary |
| `tertiary` (slate teal) | `#3d5f64` | **Cool counterweight** — "Awareness" category, cool section tints |
| `gold` (aged brass) | `#a87e3f` | **Warm highlight** — rule-accents, "Reflection" category, quote attribution |
| `gold-soft` | `#ddb880` | Gold on dark surfaces |
| `accent` (brick) | `#9a4a2e` | Drop-caps, rare emphasis spans — use sparingly |

**Tinted backgrounds (section-level variety)**

- `bg-paper-warm` — gradient `var(--color-surface) → #f5ede0` · used under warm sections (clinical interests)
- `bg-paper-cool` — gradient `var(--color-surface) → #edf1f0` · used under cool sections (pull-quotes)

**Outlines**

| Token | Hex | Role |
|---|---|---|
| `outline` | `#80756e` | Rarely used |
| `outline-variant` | `#d2c4bb` | Ghost borders at 15–25 % opacity when necessary |

**Category chip colour-coding (house standard)**

- Essay → `primary` (warm clay)
- Awareness → `tertiary` (slate teal)
- Reflection → `gold`

The palette above is **the house style** across every doctor site we build. Per-client tweaks — e.g., tuning the teal for a psychiatrist's softer register, or shifting the gold to rose for a paediatrician — require a deliberate reason noted in the client log. Default: no tweaks.

### The "Featured Introduction" dark band (optional pattern)

A deep-warm-dark band (`#22201c` base + subtle radial gold glow), inserted between the paper-light hero and the credibility strip. Inspired by oliversacks.com. Used for:

- A pulled quote in display italic — sourced from the **doctor's own writing**, never a fabricated critic endorsement (NMC compliance).
- A short bio paragraph with **inline links** to the doctor's essay slugs.
- A single gold pill CTA ("Read the essays →") — this is the one place rounded pill buttons are permitted.
- The portrait on the right with a photo credit (`meta` type, gold-soft colour).

Class hooks: `.section-dark-hero` for the band, `.btn-pill` for the gold CTA.

**When to use it**:
- Any doctor whose practice leans on writing / thought leadership (default for the current client profile).
- Skip it for doctors with a more strictly clinical-credentials positioning.

**Never use it for**:
- A third-party critic quote we can't verify (`"Best doctor in India" — Times of India`) — NMC + honesty violation.
- A patient-facing endorsement — violates NMC testimonial ban.

### Photography rule

**Colour, not grayscale.** The initial Digital Broadsheet draft used `filter: grayscale(1) mix-blend-multiply` on portraits. After first-look review on 2026-04-15 this read too severe — "just using one colour, looks boring or too serious." The house standard is now:

- Portrait: `.portrait-editorial` → `filter: saturate(0.92) contrast(1.05)` (warm but colour)
- Photographic covers: `.photo-editorial` → `filter: saturate(0.95) contrast(1.02)`
- Decorative frame: subtle gold corner ticks (top-left + bottom-right) on the hero portrait

Grayscale remains available for specific editorial choices (e.g., an essay cover image where colour distracts), but is not the default.

### Typography — the house pairing

- **Headline / Body — Newsreader** (variable serif, Google Fonts). Purpose-designed for on-screen long-form reading with optical-size axis. Warm, authoritative, modern-classical.
- **Label / Metadata — Space Grotesk** (variable mono-humanist, Google Fonts). Our "technical voice" — used UPPERCASE with `0.18em`–`0.25em` letter-spacing for eyebrows, section numbers, dates, reading times.

Type hierarchy:

```
h1  clamp(2.5rem, 5.5vw + 1rem, 5.5rem)   /* magazine display */
h2  clamp(1.75rem, 2vw + 1rem, 2.5rem)    /* section headings */
h3  1.5rem                                 /* article titles */
body 1rem (17px), line-height 1.6–1.75
label Space Grotesk 0.7rem, uppercase, tracked
```

**Decided in this project**: article body text is **justified** ("newspaper style") with `hyphens: auto`. Revisit if justified text looks poor on a specific client's long-form content.

### Editorial devices we use

- Volume numbers (`Vol. 01 · April 2026`), issue-style.
- Numeric markers (`№ 01`, Roman `I.` `II.` `III.`) for ordered content.
- Drop-caps on the first paragraph of long articles.
- Pull-quotes in display italic, centered, flanked by a muted quote-mark glyph.
- Small-caps mono metadata above every section.
- Occasional ornamental glyph (`❦`) to sign off a page.

### Things we don't do (visual)

- Rounded cards, rounded buttons, rounded images.
- Colourful illustrations, vector medical icons, 3D shapes.
- Gradient hero backgrounds as the primary visual.
- Stock "doctor in white coat holding stethoscope" photography.
- Testimonial carousels, avatar strips, badge rows.
- Lottie animations, scroll-jacked sections, parallax.

---

## 5. The standard website anatomy

Every doctor site has the same skeleton. Content and photography vary; structure does not.

### Public pages (v1 delivery)

| URL | Page | What it is |
|---|---|---|
| `/` | Home | Hero (portrait + name + role + intro) · credibility strip · featured + side-feed essays · clinical interests · empanelments · pull-quote · correspondence band |
| `/about` | About | Long biographical page — ghostwritten from a 2–3 hour interview |
| `/credentials` | CV | Structured factual record — education, appointment, experience, clinical interests, empanelments |
| `/writing` | Essays index | Editorial list of essays and educational articles |
| `/writing/[slug]` | Essay detail | Reading page — narrow measure, drop-cap, standing disclaimer |
| `/contact` | Contact | Hospital address, Google Maps pin, informational link to hospital booking page, mailto email. **No form.** |
| `/privacy` | Legal | Short, human-written privacy policy |
| `/disclaimer` | Legal | Medical disclaimer — "not medical advice", "not a channel for consultation", emergency routing |

### Admin pages (authenticated, private)

| URL | Page |
|---|---|
| `/admin/login` | Magic-link request |
| `/admin` | Post list + "New Post" |
| `/admin/posts/new` | Composer |
| `/admin/posts/[id]/edit` | Composer (pre-filled) |
| `/admin/pages/about` | Long-form page editor |
| `/admin/pages/credentials` | Structured CV editor |

### Parked for v2 (added post-launch based on doctor's feedback)

`/publications` · `/talks` · `/press` · `/gallery` · `/newsletter` · Hindi language toggle · SEO condition-awareness pages · Forward-to-publish email · PubMed auto-sync.

### Top nav (standard)

**About · Writing · Credentials · Contact** — four links, Space Grotesk uppercase tracked.

### Footer (standard)

Four columns: *Masthead · Read · Correspond · Fine Print*. Standing educational disclaimer at the bottom. `© {year}` and `{domain}` bar. No newsletter, no social links (doctor's social is on LinkedIn if anywhere, linked from correspondence section of home).

---

## 6. Tech stack — decisions and rationale

| Layer | Choice | Why |
|---|---|---|
| **Framework** | **Astro 5** | Static-by-default → zero JS on public pages → fast LCP on Indian mobile networks. Islands architecture → React only where needed (admin). |
| **Language** | **TypeScript** (strict) | Type-safe content models; catches mismatches before build. |
| **Styling** | **Tailwind CSS v4** via `@tailwindcss/vite` | CSS-first `@theme` config — no Tailwind CDN, no `tailwind.config.ts`. All tokens live in `src/styles/global.css`. |
| **UI primitives (admin only)** | **shadcn/ui** components, copy-pasted into `src/components/admin/` | Accessible, unstyled, themable. Not used on public pages. |
| **Rich text editor (admin)** | **Tiptap** | LinkedIn-post-simple composer feel; minimal toolbar; paste-to-upload images. |
| **Content (static pages)** | `src/data/site.ts` + MDX for legal pages | Type-safe content, committed to repo. |
| **Content (dynamic — blog, About, Credentials)** | **Supabase Postgres** | Decouples publishing from deployment. Doctor edits in admin → Supabase → on-demand revalidation. |
| **Auth** | **Supabase Auth** — magic link only | No passwords. Single admin user (the doctor or a trusted custodian). |
| **File storage** | **Supabase Storage** | Post images, cover images. Public-read bucket, auth-write. |
| **Hosting** | **Vercel** | First-class Astro adapter, on-demand revalidation, Indian edge. |
| **Analytics** | **Plausible** | Cookie-less, privacy-first, NMC-safe, no GDPR/DPDPA friction. |
| **Email (magic link delivery)** | Supabase built-in (Resend under the hood) | Zero-config. Can upgrade to Postmark/Resend separately if delivery needs tuning. |
| **Fonts** | **Newsreader + Space Grotesk** via Google Fonts, preloaded | Same pairing across all sites. |
| **Icons** | Inline SVG (Lucide for admin where needed) | No Material Symbols font dependency (~60 KB saved). |
| **Version control** | **GitHub** | Our account during build; transferred to doctor at handover. |
| **Package manager** | **pnpm** | Fast, disk-efficient. |
| **Node** | **22 LTS** | |

### Why NOT Next.js

Dr. Parti's site (and every future doctor site) is ~95 % static content with a small authenticated admin. Next.js would ship 70–150 KB of JS on every public page for effectively zero benefit. Astro ships ~0 KB. For content publishing, Astro is the correct trade-off — locked in as house stack.

We may reconsider **only if**: (a) a future client requires heavy interactivity (live streams, scheduling tools — likely NMC-non-compliant anyway), or (b) we hire a team that already standardises on Next.js.

### Why NOT WordPress / Squarespace / Wix

- WordPress — security debt, plugin hell, doctor ends up on a WordPress admin interface no matter how much we style it.
- Squarespace / Wix — can't ethically ship NMC-compliant copy reliably; their templates push testimonials.
- Neither delivers the handover-ownership story cleanly.

---

## 7. Architecture & data flow

### High-level architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Vercel                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Astro (static + SSR)                │    │
│  │                                                  │    │
│  │  PUBLIC (static, ISR-revalidated):               │    │
│  │    / · /about · /credentials · /writing          │    │
│  │    /writing/[slug] · /contact · /privacy         │    │
│  │    /disclaimer · /rss.xml · /sitemap.xml         │    │
│  │                                                  │    │
│  │  ADMIN (SSR, auth-gated):                        │    │
│  │    /admin · /admin/posts/new                     │    │
│  │    /admin/posts/[id]/edit                        │    │
│  │    /admin/pages/about · /admin/pages/credentials │    │
│  │                                                  │    │
│  │  API (server endpoints):                         │    │
│  │    /api/posts · /api/pages · /api/upload         │    │
│  └──────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                       Supabase                           │
│   Postgres (posts, pages, media)                         │
│   Auth (magic-link, single admin user)                   │
│   Storage (post-images bucket, public read, auth write)  │
│   RLS on everything                                      │
└──────────────────────────────────────────────────────────┘
```

### Data model (house standard)

```sql
-- Dynamic blog posts
posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_html text,          -- rendered from Tiptap
  body_json jsonb,          -- Tiptap state for editing
  cover_image_url text,
  category text,            -- 'Essay' | 'Awareness' | 'Reflection'
  status text default 'draft',  -- 'draft' | 'published'
  published_at timestamptz,
  pull_quote text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Long-form editable pages
pages (
  key text primary key,     -- 'about' | 'credentials'
  body_html text,
  body_json jsonb,
  updated_at timestamptz default now()
);

-- Media (optional v1)
media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  uploaded_at timestamptz default now()
);
```

**RLS**: public can `SELECT` rows where `status = 'published'` on `posts`, and unconditionally on `pages`. Only authenticated `service_role` can `INSERT / UPDATE / DELETE`.

### Rendering strategy

- **Public pages**: statically pre-rendered at build time, served from Vercel's edge.
- **On-demand revalidation**: when a post flips to `published`, a Supabase database webhook hits a Vercel endpoint that revalidates the affected paths. New post live in ~5 seconds, no rebuild.
- **Admin**: server-rendered with Supabase session cookies, gated by middleware.
- **API routes**: Astro server endpoints using the Supabase service-role key. Never shipped to the browser.

### Folder structure (house standard)

```
<project-root>/
├── src/
│   ├── components/         # .astro shared components
│   ├── components/admin/   # .tsx React islands (composer, list, etc.)
│   ├── data/
│   │   ├── site.ts         # doctor facts, nav, footer, palette
│   │   └── posts.ts        # v1 static posts (migrated to DB in Phase 3)
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── supabase.ts     # client + server factories
│   │   └── auth.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── credentials.astro
│   │   ├── contact.astro
│   │   ├── privacy.mdx
│   │   ├── disclaimer.mdx
│   │   ├── writing/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── admin/
│   │   │   ├── index.astro
│   │   │   ├── login.astro
│   │   │   └── posts/
│   │   └── api/
│   │       ├── posts.ts
│   │       ├── pages.ts
│   │       └── upload.ts
│   └── styles/
│       └── global.css
├── public/
│   └── images/
├── supabase/
│   └── migrations/
├── docs/
│   └── HANDBOOK.md         # this file
├── astro.config.mjs
├── tailwind.config.ts      # NOT USED — Tailwind v4 is CSS-first
├── tsconfig.json
└── package.json
```

---

## 8. Admin panel principles

The admin is what makes the business model work. The doctor must be able to publish in under 60 seconds without training. Design rules:

1. **Feels like LinkedIn, not WordPress.** One screen, three fields, two buttons.
2. **Hide every feature a WordPress admin has that a doctor doesn't need.** No plugins, themes, users, roles, SEO wizards, revisions, categories trees, taxonomies, settings dashboards.
3. **Magic-link auth only.** No passwords — ever. Single admin user.
4. **Mobile-first composer.** The doctor writes from his phone between patients. The floating toolbar is at the bottom of the mobile screen, always visible.
5. **Autosave every 5 seconds.** Never lose a draft.
6. **One-click publish.** Confirmation popover shows the live URL immediately.
7. **Editor stack**: Tiptap with a six-action floating toolbar (Bold · Italic · H2 · H3 · Link · Quote) and a slash menu with six insertion options (Heading · Subheading · Quote · Bulleted list · Numbered list · Image). Nothing else.
8. **Design system inherits from the public site** — same colours, same serifs, same spacing — so the admin feels like the doctor's own property, not a generic CMS.
9. **Consistent empty and error states**: italic serif line + quiet link. No illustrations.

### The 60-second flow we optimise for

> Doctor receives a magic-link email → clicks it → lands on `/admin` → clicks `+ New Post` → types a title and a paragraph → pastes an image → clicks `Publish` → sees "Live at amitabhparti.com/writing/…" → closes the tab.

If any step feels like work, the admin has failed.

---

## 9. Content voice & writing rules

- **Factual, unhurried, educational.** Closer to a senior academic's essay than a magazine column.
- **First person used sparingly.** The doctor is the subject, not the product.
- **No superlatives, no self-promotion, no patient references.** See § 3.
- **Sentences earn their length.** A two-clause sentence is allowed; a three-clause sentence needs a reason.
- **Plain language.** If a term needs defining, define it inline in a parenthetical. Do not assume a medical reader.
- **Honest about uncertainty.** "Most patients can…" is better than "All patients will…". "Usually" and "often" are honest; "always" is rarely true.
- **No direct CTAs** in article bodies. Articles end with the standing disclaimer and a navigation link, nothing more.

---

## 10. The six-phase build process

| Phase | Days | What ships |
|---|---|---|
| **1. Foundation** | 1–2 | Astro scaffold · Broadsheet design system · `BaseLayout` · `Nav` · `Footer` · one-pass Home |
| **2. Public pages (static)** | 3–5 | About · Credentials · Contact · Writing index · Writing detail · Privacy · Disclaimer — all hardcoded from `site.ts` / `posts.ts` |
| **3. Supabase** | 6–8 | Schema · RLS · migrate posts from static file to DB · reading pages from Supabase · on-demand revalidation webhook |
| **4. Admin** | 9–13 | Magic-link login · dashboard · composer (Tiptap) · image upload · page editors for About / Credentials |
| **5. Polish** | 14–17 | SEO metadata · JSON-LD Person schema · OG images · RSS · sitemap · 404 page · accessibility pass · performance pass · reduced-motion · print stylesheet for `/credentials` |
| **6. Content + handover** | 18–21 | Ghostwrite About + Credentials from interview · 2–3 seed posts · professional photo drop-in · handover of all accounts · training Loom |

**Total**: ~3 weeks for a clean v1.

---

## 11. Handover checklist

At launch, every one of these must be done before we walk away:

- [ ] Domain registered in doctor's name (or transferred to doctor's registrar account)
- [ ] Vercel project transferred to doctor's Vercel team (or owner account)
- [ ] Supabase organisation owned by doctor's email; our access removed after final test
- [ ] GitHub repo transferred to doctor's GitHub (or their designated technical custodian)
- [ ] All API keys rotated post-transfer, environment variables verified
- [ ] Admin login provisioned with doctor's email (magic-link-only, no passwords stored anywhere)
- [ ] 30-minute training call
- [ ] Loom walkthrough video (permanent reference for the doctor and assistants)
- [ ] 2-page PDF: "How to write a post" + "How to edit About" + "Who to call if it breaks"
- [ ] Credential document handed over (1Password export or secure PDF)
- [ ] Backup credential holder identified (doctor's assistant, spouse, or child)
- [ ] Plausible analytics access handed over
- [ ] Domain renewal reminder set in doctor's calendar

---

## 12. Ownership model

The doctor owns everything at launch. We walk away with zero ongoing lock-in. The doctor can fire us the next day and nothing breaks.

This is the philosophical centre of the business. **We are not a SaaS. We are a boutique agency selling a finished artefact and training.**

The price of this model: we rebuild the admin panel from scratch for each client. The payoff: we attract doctors who would never sign up for a subscription trap, and we sleep well.

---

## 13. Pricing & packaging

(These are reference numbers, to be validated per client. Update as we close deals.)

- **Build fee**: ₹1.5 L – ₹5 L (depending on scope — interviews, ghostwriting, photoshoot, custom sections).
- **Optional annual retainer**: ₹25 k – ₹75 k / year for tech support and small updates. Pure opt-in.
- **Ongoing platform costs the doctor pays**: domain ~₹1500/yr, Vercel + Supabase free-tier sufficient for ~all personal-site traffic, so ~₹0/month in practice.

**What's included in the build fee**: discovery interview(s) · content strategy · copywriting support (not full ghostwriting unless negotiated separately) · full site · admin panel · seed content · handover.

**Not included unless bought as add-ons**: professional photography · long-form interview-to-essay ghostwriting retainer · Wikipedia / Google Knowledge Panel work · ORCID / ResearchGate setup · multilingual version · video production.

---

## 14. Parked features & future menu

(Offered to clients post-launch as optional v2 modules, once the v1 site is live and the doctor has reviewed it.)

- `/publications` — pulled from PubMed via E-utilities API if the doctor has indexed papers.
- `/talks` — YouTube/conference lectures with thumbnail + venue + year.
- `/press` — third-party media mentions, factual, linked out.
- `/gallery` — professional events, teaching rounds, CMEs (no patients).
- `/newsletter` — Buttondown or ConvertKit signup for educational correspondence.
- **Hindi-language version** (for wider public-awareness reach in North India).
- **SEO condition-awareness pages** (diabetes awareness, hypertension guide, monsoon fever) — high organic-reach play, stays educational.
- **Forward-to-publish email** — doctor emails a draft to `post@theirsite.com`, it becomes a draft in admin. Zero-learning-curve mobile workflow.
- **PubMed auto-sync** — publications page updates itself when new papers are indexed.
- **Annual "Year in Review" digital report** — talks given, CMEs attended, articles published, aggregated anonymously.

---

## 15. Rejected ideas and why

Kept here so we don't reopen decisions we've already made.

| Idea | Rejected because |
|---|---|
| Contact form on the homepage | NMC solicitation risk + liability if patients submit symptoms + data-protection obligations. Mailto is cleaner. |
| Testimonials / reviews (even if "just Google Reviews embedded") | Explicit NMC ban. Always. |
| Paid Google Ads / paid SEO link-building | Explicit NMC ban on paid search ranking. |
| "Book Appointment" CTA | Solicitation. Direct patients to the hospital's own booking page only, framed as information. |
| WordPress / Squarespace / Wix as the platform | Ownership-model incompatibility, plugin security debt, can't deliver the admin UX we want. |
| Third-party CMS (Sanity / Contentful) | Another vendor login for the doctor, data-model lock-in, ongoing cost. Supabase gives us content + auth + storage in one. |
| Patient portal features (chat, messaging, records) | NMC unfriendly; wrong business. |
| AI-generated doctor portraits on launch | Dignity risk — "uncanny AI doctor" vibe undermines trust. Use the doctor's LinkedIn photo for v1, plan a real shoot post-launch. |
| Rounded cards / buttons / images | Violates the Broadsheet 0-radius rule. Non-negotiable. |
| **`backdrop-filter` on sticky nav / sticky headers** | **Banned.** Causes pointer-event hit-testing lag in Chromium/Brave — the GPU-composited layer goes stale for a frame when the cursor moves across it quickly, so links appear unclickable despite being visible. Use a solid background colour on sticky headers. Confirmed on Dr. Parti's build 2026-04-16. |
| Generic institutional photos as essay covers (e.g. hospital exterior on an essay about "listening") | No thematic connection to the writing. Distracting and confusing. If we don't have article-specific imagery, go typography-only — large serif title + excerpt + hairline rules read as editorial, not lazy. |
| **Public comment sections under articles** | Four reasons: (1) **NMC exposure** — patients will ask medical questions; ignoring looks unprofessional, answering is unauthorised public consultation; (2) **moderation burden** — spam, trolls, misinformation by other users on the doctor's own platform; (3) **third-party content liability** — reader claims under the doctor's byline create association risk; (4) **tone mismatch** — premium editorial sites (Sacks, Gawande, Attia's essays, Topol, NYT Op-Ed) don't do comments. Instead: (a) a quiet "Respond to this essay" mailto line under every article with the clinical-disclaimer re-stated; (b) optional future "Letters to the Editor" curated section for the best responses; (c) LinkedIn cross-posts as the public discussion layer. |
| Drop-shadow decorative cards | Violates the tonal-layering depth rule. |
| Colourful illustrations / 3D icons / Lottie animations | Wrong register for a senior physician. |
| Justified article text with *no* hyphens | Ugly spacing gaps on narrow columns. If we keep justified, we keep `hyphens: auto`. |

---

## 16. Per-client log

### Client 01 — Dr. Amitabh Parti (in build)

**Facts locked from public sources** (Fortis, Practo, Credihealth, Justdial):

- **Name**: Dr. Amitabh Parti. *"Parthi" spelling appears on Practo/Lybrate/LinkedIn — "Parti" is the official spelling on Fortis.* Domain registered as **amitabhparti.com**.
- **Role**: Senior Director & Unit Head — Internal Medicine, Fortis Memorial Research Institute, Gurgaon.
- **Qualifications**: MBBS (Gold Medallist), University of Punjab, 1986; MD Internal Medicine, University of Punjab, 1991.
- **Experience**: 38 years total; 32+ years post-specialisation.
- **Clinical interests**: Infectious disease · Hypertension · Diabetes management · Thyroid disorders · Tropical medicine · General internal medicine.
- **Empanelled Visiting Physician**: Engineers India Ltd · Ballarpur Industries Ltd · Indus Towers Ltd · Instyle Exports Ltd · University of Delhi.
- **Research footprint**: No PubMed-indexed publications as of April 2026. `/publications` page deferred to v2.

**Audience ranking** (from the doctor-facing discussion): general public awareness → medical peers → media → medical students. **Patients explicitly excluded** to stay ethics-safe.

**Design direction**: Digital Broadsheet standard (no deviation).

**Photo**: Currently using Practo-watermarked portrait as local-dev placeholder. Swap before launch to his LinkedIn portrait (preferred) or a fresh professional shoot.

**Known open items**:

- [ ] Confirm with Dr. Parti that his Fortis employment contract permits a personal website (the one genuine external risk identified in the compliance audit).
- [ ] Confirm spelling preference — "Parti" (Fortis-official) or "Parthi" (LinkedIn). Domain is already `amitabhparti.com`.
- [ ] Source a professional portrait.
- [ ] Schedule a 2–3 hour interview to ghostwrite the `/about` page and 2–3 seed essays.

**Build status as of this handbook version**: Phase 1 complete. Home page rendering with real facts, Broadsheet design system locked in, `BaseLayout` + `Nav` + `Footer` shared, seed posts file populated. Next: Phase 2 (About, Credentials, Contact, Writing, legal pages).

---

## 17. Changelog

| Version | Date | Changes |
|---|---|---|
| **v0.1** | 2026-04-15 | Initial handbook. Captures agency rationale · business model · NMC posture · Digital Broadsheet design system · standard site anatomy · locked tech stack · architecture · admin principles · content rules · six-phase build process · handover checklist · ownership model · pricing framework · parked features · rejected ideas · Dr. Amitabh Parti client log. |
| **v0.2** | 2026-04-15 | **Palette expanded from mono-accent to tri-accent.** Added slate-teal `tertiary #3d5f64` and gold `#a87e3f` alongside clay primary. Reason: first-look review showed the single-accent palette read too severe at page scale. **Photography rule changed**: portraits and covers are now colour (subtle warm film), not grayscale. Category chips now colour-coded (Essay clay · Awareness teal · Reflection gold). Clinical-interest tiles and empanelment cards rotate through the tri-palette for rhythm. Added `bg-paper-warm` and `bg-paper-cool` gradient utilities for section-level variety. |
| **v0.3** | 2026-04-15 | Added the **"Featured Introduction" dark band pattern** (oliversacks.com-inspired). Documented the **one exception to the 0-radius rule**: pill buttons permitted only inside `.section-dark-hero`. Compliance constraint noted: quote content must come from the doctor's own writing or be a factual descriptor — never a fabricated third-party endorsement. Added `.section-dark-hero` and `.btn-pill` component classes. |
| **v0.4** | 2026-04-15 | Dark theme extended to the **site footer** (matching `.section-dark-hero` warm-black + gold). Page now reads as a dark/light/dark sandwich — hero, body, footer — which resolves the "single-tone" criticism from the first-look review. Removed the paper-light hero entirely; the dark introduction band is the only hero. **Home "Featured Essay" section redesigned** from asymmetric-image layout to a clean editorial list (first post visually larger, hairline rules between rows). Removed the generic Fortis exterior photo that was being used as a placeholder essay cover — noted in rejected ideas as a general rule. |
| **v0.5** | 2026-04-15 | **Alternating tonal bands adopted as a house pattern for the Home page.** Instead of a dark hero + light body + dark footer, the home alternates every major section: Hero (dark) → Credibility (light) → Recent Writing (dark) → Clinical Expertise (light, warm-paper gradient) → Empanelments (dark) → Pull Quote (light, cool-paper gradient) → Correspondence (dark) → Footer (dark). This gives the page visual rhythm and keeps any single section from feeling interminable. Category chips, rule accents, and colour-coded tile accents all work against both tones unchanged. Dark-band cards use a subtle `rgba(255,255,255,0.04)` surface with a gold-soft hairline at 10 % opacity for tonal layering within the band. Empanelment card top-ticks are retuned to softer accent variants for readability on dark. |
| **v0.6** | 2026-04-15 | **Design philosophy locked for Home and extended to all public pages.** Home design decisions finalized: (1) paper tones lifted toward white with faint warmth (`--color-surface: #fdfcf8`) — no yellow cast; (2) hero is a single dark introduction band, portrait cutout bottom-aligned and bleeding into the section edge, no drop-shadow (clean D/L transition); (3) quote attribution line under the hero quote serves as identity signal — formatted as "— Dr. Amitabh Parti · Internal Medicine, Fortis Memorial, Gurgaon"; (4) credibility strip cards use `flex-col` + `mt-auto` + `min-h` so labels pin to top and values pin to bottom — consistent alignment regardless of value line-count; (5) no pill buttons anywhere on the home — both hero CTAs are identical editorial text links (tracked uppercase, gold-soft on dark, same size). The `.btn-pill` class remains defined in CSS as a documented exception pattern available for dark-hero bands on future clients where a filled CTA is explicitly called for, but **the house default is text-link CTAs, not pills**. The Home layout now becomes the **reference template** for every subsequent doctor site — per-client changes deviate from this only with a recorded reason. |
| **v0.7** | 2026-04-15 | **Phase 2 kickoff — building remaining pages on the locked template.** Every subsidiary page (About, Credentials, Writing index, Writing detail, Contact, Privacy, Disclaimer) opens with a dark hero band matching the home's visual weight (compressed height — pages don't need full editorial intros), alternates D/L as appropriate, ends with the same dark footer. Reading-column pages (About, articles, legal) use the `container-reading` width with drop-caps on long-form body. The shared `BaseLayout` already carries nav + footer, so each page only needs its own `<section>` stack. |
| **v0.8** | 2026-04-15 | **Alternating D/L rhythm scoped to Home only.** Subsidiary pages proved too short for the alternation to land — forced dark bands felt arbitrary. New house rule: **Home uses full D-L-D-L-D-L-D-D alternation; every other page uses Dark Hero → Light Body (with subtle tonal shifts between `surface` and `surface-container-low`, plus `bg-paper-warm` / `bg-paper-cool` gradients for section texture) → Dark Footer.** Within-light variation replaces full contrast-flips. Colour rhythm on subsidiary pages comes from category chips, primary-clay italic emphasis, rule accents, and empanelment top-ticks — not from background inversion. Reverted the dark `Continue Reading` and `Current Appointment + Experience` bands accordingly. |

---

## Maintenance commitment

I (the assistant) will update this handbook any time we:

- Make a new design or tech decision that deviates from the house standard (record it).
- Learn something from a client build worth teaching future clients (add to per-client log + relevant section).
- Reject an idea with a real reason (add to § 15).
- Discover a new NMC regulation or interpretation (update § 3).
- Ship a new feature worth templating across future builds (update § 14 if offered as v2, or § 5 if it becomes standard).

**Every new client build opens a new entry in § 16** and closes with a *"lessons learned"* paragraph that becomes part of the agency's compounding knowledge.
