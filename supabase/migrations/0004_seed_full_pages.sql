-- =========================================================================
-- amitabhparti.com · re-seed pages.about and pages.credentials with the full
-- rich content currently rendered on the live site. One-shot UPDATE — safe
-- to re-run (it overwrites body_html).
--
-- After running this once, the admin /admin/pages/about editor will show
-- the complete biography, and the live /about page will render whatever the
-- admin saves going forward.
-- =========================================================================

update public.pages
set body_html = $html$
<p class="italic">The final biographical text will be developed from an interview with Dr. Parti, in his own voice. What follows is an outline of the chapters that will be filled in.</p>

<p>Dr. Amitabh Parti grew up in Punjab and went to medical school at the University of Punjab, graduating MBBS in 1986 with a gold medal. He went on to take his MD in Internal Medicine at the same institution in 1991.</p>

<h2>Training</h2>
<p>[Postgraduate training locations, formative wards, mentors, the cases that stayed with him from the first few years of practice — to be developed from interview.]</p>

<h2>A career in internal medicine</h2>
<p>For most of his career, Dr. Parti has practised as a general internist — the specialist most patients need before any other specialist, and often the one they never knew they were looking for. He currently serves as Senior Director and Unit Head of Internal Medicine at Fortis Memorial Research Institute in Gurgaon, where he manages outpatient and complex in-patient care across cardiac, diabetic, pulmonary, and tropical illnesses.</p>

<h2>Clinical interests</h2>
<p>Infectious disease, hypertension, diabetes management, and thyroid disorders make up the centre of his clinical practice. His interest in general internal medicine is rooted in a simple belief: that thinking through the whole of a patient, rather than the fragment handed to one specialist, is the work most worth doing.</p>

<h2>Teaching and correspondence</h2>
<p>[Affiliations with teaching programmes, fellowships supervised, CME lectures, panels served on — to be developed.]</p>

<h2>Away from the clinic</h2>
<p>[Personal paragraph — interests, family, reading, the ordinary things that make a physician a person — to be developed.]</p>
$html$,
    body_json = null
where key = 'about';

update public.pages
set body_html = $html$
<p><strong>Senior Director &amp; Unit Head, Internal Medicine</strong><br>
Fortis Memorial Research Institute, Gurgaon.</p>

<p>Thirty-eight years of clinical practice, including thirty-two years of post-specialisation experience — cardiac, diabetic, pulmonary, and tropical disease related conditions.</p>
$html$,
    body_json = null
where key = 'credentials';

-- Confirm
select key, length(body_html) as html_length, updated_at from public.pages order by key;
