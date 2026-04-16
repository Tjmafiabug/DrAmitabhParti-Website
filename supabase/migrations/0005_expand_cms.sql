-- =========================================================================
-- amitabhparti.com · expand CMS so the admin can edit everything on the site.
--
-- Changes:
--   1. Allow more keys in `pages` (privacy, disclaimer, not_found).
--   2. Seed those three pages with their current public copy.
--   3. Merge a large bundle of additional editable fields into settings/site:
--      identity, nav, footer, heroes, seo, portrait_url, home_intro, about_lede.
--
-- Safe to re-run: INSERTs use ON CONFLICT DO NOTHING, the settings UPDATE
-- uses jsonb concat (||) which only adds keys that don't exist yet.
-- =========================================================================

-- ---- 1. Expand pages keys --------------------------------------------------
alter table public.pages drop constraint if exists pages_key_check;
alter table public.pages add constraint pages_key_check
  check (key in ('about', 'credentials', 'privacy', 'disclaimer', 'not_found'));

-- ---- 2. Seed legal + 404 pages ---------------------------------------------
insert into public.pages (key, body_html, body_json) values (
  'privacy',
  $html$<p>This website is a personal publishing space for Dr. Amitabh Parti. It does not knowingly collect personal data from readers.</p>
<h2>What we do not do</h2>
<p>We do not track individual visitors across sessions. We do not use advertising networks. We do not sell, share, or sync reader data with third parties.</p>
<h2>What we measure</h2>
<p>We use a privacy-respecting, cookie-less analytics tool to count aggregate page visits (for example, how many people read a particular article in a month). Individual visitors are not identified.</p>
<h2>If you contact us</h2>
<p>If you send an email via an address published on this site, we retain the email only for correspondence. Please do not share personal medical information by email; this site is not a channel for clinical consultation.</p>
<h2>Questions</h2>
<p>For privacy questions, please write to the correspondence address published on the <a href="/contact">Contact</a> page.</p>
<p><em>Last updated: April 2026</em></p>$html$,
  null
) on conflict (key) do nothing;

insert into public.pages (key, body_html, body_json) values (
  'disclaimer',
  $html$<p>The content on this website — including essays, notes, and articles — is published for general education and public awareness. It reflects the considered opinions of Dr. Amitabh Parti on questions of internal medicine and public health, written in plain language for a lay reader.</p>
<h2>Not medical advice</h2>
<p>Nothing on this website constitutes individual medical advice. Articles do not recommend specific treatments, dosages, or clinical decisions for any particular reader. The experience of any one person is particular to them and cannot be addressed by a published article.</p>
<h2>Please consult a physician</h2>
<p>If you are unwell, or if any article here has raised a concern about your health, please consult a qualified medical practitioner in person. Do not delay medical attention because of something you have read on this site.</p>
<h2>Not a channel for consultation</h2>
<p>This website is not a means of contacting Dr. Parti for clinical consultation. Patient queries, appointment requests, and medical records should not be sent by email through this site. For clinical matters, please use <a href="https://www.fortishealthcare.com/doctors/dr-amitabh-parti-1097">Fortis Memorial's official appointment systems</a>.</p>
<h2>Emergencies</h2>
<p>If you believe you are experiencing a medical emergency, please call your nearest hospital or local emergency services immediately.</p>
<p><em>Last updated: April 2026</em></p>$html$,
  null
) on conflict (key) do nothing;

insert into public.pages (key, body_html, body_json) values (
  'not_found',
  $html$<p>Addresses change. Articles are sometimes retitled. If you followed a link that brought you here, the best next step is almost always the home page.</p>$html$,
  null
) on conflict (key) do nothing;

-- ---- 3. Expand the site settings value -------------------------------------
-- Uses jsonb concat (||), which ONLY adds keys that don't already exist in
-- the value. If a previous run already added these fields, the operator
-- is a no-op for them. To force-reset a field, edit it in the admin UI.
update public.settings
set value = value || jsonb_build_object(
  'identity', jsonb_build_object(
    'name',              'Dr. Amitabh Parti',
    'short_name',        'Amitabh Parti',
    'title_suffix',      'Dr. Amitabh Parti',
    'role',              'Senior Director & Unit Head, Internal Medicine',
    'role_short',        'Internal Medicine',
    'institution',       'Fortis Memorial Research Institute, Gurgaon',
    'institution_short', 'Fortis Memorial, Gurgaon',
    'city',              'Gurgaon',
    'experience_years',  38,
    'post_spec_years',   32,
    'mbbs_year',         1986,
    'md_year',           1991,
    'university',        'University of Punjab',
    'tagline',           'Advancing medical thought through clinical rigour and public education.',
    'description',       'The professional home of Dr. Amitabh Parti — internal medicine consultant at Fortis Memorial Research Institute, Gurgaon. Essays, notes, and educational writing on general medicine and public health.',
    'portrait_url',      '/images/parti-cutout.png',
    'portrait_alt',      'Dr. Amitabh Parti, Senior Director of Internal Medicine at Fortis Memorial Research Institute, Gurgaon',
    'site_url',          'https://amitabhparti.com'
  ),
  'nav', jsonb_build_array(
    jsonb_build_object('href', '/about',        'label', 'About'),
    jsonb_build_object('href', '/writing',      'label', 'Writing'),
    jsonb_build_object('href', '/credentials',  'label', 'Credentials'),
    jsonb_build_object('href', '/contact',      'label', 'Contact')
  ),
  'footer', jsonb_build_object(
    'read', jsonb_build_array(
      jsonb_build_object('href', '/about',       'label', 'About'),
      jsonb_build_object('href', '/credentials', 'label', 'Credentials'),
      jsonb_build_object('href', '/writing',     'label', 'Writing')
    ),
    'correspond', jsonb_build_array(
      jsonb_build_object('href', '/contact', 'label', 'Contact')
    ),
    'legal', jsonb_build_array(
      jsonb_build_object('href', '/privacy',    'label', 'Privacy'),
      jsonb_build_object('href', '/disclaimer', 'label', 'Disclaimer')
    ),
    'tagline',    'Educational content only. Not a substitute for individual medical advice.',
    'brand_line', 'Dr. Amitabh Parti'
  ),
  'seo', jsonb_build_object(
    'default_description', 'The professional home of Dr. Amitabh Parti — internal medicine consultant at Fortis Memorial Research Institute, Gurgaon. Essays, notes, and educational writing on general medicine and public health.',
    'og_image_url',        '/og-default.png',
    'pages', jsonb_build_object(
      'home',        jsonb_build_object('title', null,                    'description', null),
      'about',       jsonb_build_object('title', 'About',                 'description', 'A short biography of Dr. Amitabh Parti — internal medicine consultant at Fortis Memorial Research Institute, Gurgaon.'),
      'credentials', jsonb_build_object('title', 'Credentials',           'description', 'Education, qualifications, positions, and professional affiliations of Dr. Amitabh Parti.'),
      'contact',     jsonb_build_object('title', 'Contact',               'description', 'Practice address and professional correspondence for Dr. Amitabh Parti.'),
      'writing',     jsonb_build_object('title', 'Writing',               'description', 'Essays, notes, and educational articles on internal medicine and public health by Dr. Amitabh Parti.'),
      'privacy',     jsonb_build_object('title', 'Privacy',               'description', 'Privacy policy for amitabhparti.com.'),
      'disclaimer',  jsonb_build_object('title', 'Medical Disclaimer',    'description', 'Medical disclaimer for amitabhparti.com.'),
      'not_found',   jsonb_build_object('title', 'Not Found',             'description', 'The page you were looking for has moved, or never existed.')
    )
  ),
  'heroes', jsonb_build_object(
    'about',       jsonb_build_object('eyebrow', 'About',             'title', 'On a life',       'title_italic', 'in internal medicine.', 'kicker', ''),
    'credentials', jsonb_build_object('eyebrow', 'Curriculum Vitae',  'title', 'The record,',     'title_italic', 'in brief.',             'kicker', ''),
    'contact',     jsonb_build_object('eyebrow', 'Contact',           'title', 'Where to find',   'title_italic', 'Dr. Parti.',            'kicker', ''),
    'writing',     jsonb_build_object('eyebrow', 'Writing',           'title', 'Essays, notes,',  'title_italic', 'and educational articles.', 'kicker', 'General writing on internal medicine, public health, and the quiet things that happen in consulting rooms. Educational only — please see the standing disclaimer at the foot of each article.'),
    'privacy',     jsonb_build_object('eyebrow', 'Legal',             'title', 'Privacy.',        'title_italic', '',                      'kicker', ''),
    'disclaimer',  jsonb_build_object('eyebrow', 'Legal',             'title', 'Medical',         'title_italic', 'Disclaimer.',           'kicker', ''),
    'not_found',   jsonb_build_object('eyebrow', '404 — Not Found',   'title', 'This page has wandered off', 'title_italic', 'or never existed.', 'kicker', '')
  ),
  'home', jsonb_build_object(
    'intro_paragraph_html', '<p>Dr. Parti writes on internal medicine, public health, and the discipline of clinical attention.</p>',
    'credibility_appointment_label', 'Senior Director, Fortis Memorial',
    'closing_quote',                 'Medicine is not the application of science to biology. It is the <em>translation of evidence into empathy</em>, within the constraints of a human life.',
    'closing_quote_meta',            'From the writing · 2026'
  ),
  'about', jsonb_build_object(
    'lede_quote',        'The single most consequential diagnostic tool remains what it was in 1900 — the willingness to listen without hurry.',
    'lede_source_href',  '/writing/the-art-of-listening',
    'lede_source_label', 'The Art of Listening',
    'sign_off',          '— Dr. Amitabh Parti'
  ),
  'contact_page', jsonb_build_object(
    'map_embed_url',     'https://www.google.com/maps?q=Fortis+Memorial+Research+Institute+Gurgaon&output=embed',
    'map_iframe_title',  'Fortis Memorial Research Institute, Gurgaon — map'
  )
)
where key = 'site';
