-- =========================================================================
-- amitabhparti.com · seed data — three founding articles + pages
-- Run after 0001_init.sql
-- =========================================================================

insert into public.posts
  (slug, title, excerpt, pull_quote, category, reading_time, status, published_at, body_html)
values
(
  'the-art-of-listening',
  'The Art of Listening',
  'Modern medicine has an instrument for every organ except the one thing that still matters most — attention.',
  'Medicine has built magnificent instruments. The single most consequential remains the willingness to listen.',
  'Reflection',
  '4 min read',
  'published',
  '2026-04-02',
$body$
<p>A patient once told me that the first time he felt truly heard was in his forty-seventh year, sitting across from a physician who simply stopped writing.</p>
<p>Medicine has built magnificent instruments. We can visualise the beat of a heart, the flicker of a neuron, the silent growth of a tumour months before a patient feels anything at all. And yet, with all this, the single most consequential diagnostic tool remains what it was in 1900 — the willingness to listen without hurry.</p>
<h2>What a careful history still teaches</h2>
<p>In internal medicine, the history often tells the story before any test does. A vague tiredness that began on a Tuesday. A cough that only troubles him when he lies on his left side. The small shifts in appetite that a spouse noticed before he did. These are signals, and they are rarely captured by a checkbox.</p>
<p>When we rush the history, we do not save time. We defer it. The patient returns; the diagnosis turns out to be what a longer first conversation would have suggested; the investigations we ordered in haste become a paper trail of missed meaning.</p>
<h2>The economics of attention</h2>
<p>A fifteen-minute consultation is a cultural artefact, not a medical one. It suits hospital logistics and insurance forms. It does not suit the patient with three chronic conditions and a story of fear, and it never did.</p>
<p>I am not arguing for infinite time. I am arguing for a posture. One can give the first three minutes of any consultation entirely to the patient, interrupting nothing, and the remaining twelve will almost always be better spent for it.</p>
<h2>A small discipline</h2>
<p>I keep a simple rule for myself: before touching a keyboard, ask one open question and do not speak again until the patient has finished answering. It is astonishing how often the diagnosis is in that answer.</p>
$body$
),
(
  'monsoon-illness-in-north-india',
  'Monsoon Illness in North India',
  'Fever in July looks like dengue until proven otherwise — and the proving matters more than the assuming.',
  'Empirical antibiotics in the first forty-eight hours of an undifferentiated fever rarely help. Observation is a clinical act.',
  'Awareness',
  '6 min read',
  'published',
  '2026-03-18',
$body$
<p>Every July the clinics of Gurgaon fill with fever. Patients arrive with headaches, body aches, sometimes a faint rash; the families arrive with anxiety — and with good reason, because the city has learned in recent years to respect what the monsoon brings with it.</p>
<h2>The four to rule in, and out</h2>
<p>In practical terms, four diagnoses account for the great majority of monsoon febrile illness in our region: dengue, malaria, typhoid, and — increasingly — influenza. Chikungunya, scrub typhus, and leptospirosis appear less often but should never be forgotten. A careful history and a small, thoughtfully chosen set of tests sort most of this within a day.</p>
<h2>What patients can usefully do at home</h2>
<ul>
  <li>Hydration, and more hydration. Oral rehydration solution is not only for diarrhoea; it is a friend of any febrile patient whose appetite has flagged.</li>
  <li>Paracetamol, not NSAIDs. Ibuprofen and aspirin can worsen bleeding tendency in dengue and strain the kidneys in any febrile illness where dehydration is a risk.</li>
  <li>Watch the warning signs. Severe abdominal pain, persistent vomiting, bleeding from any site, unusual drowsiness, cold extremities. These are not symptoms to manage at home; they are symptoms to bring to a physician, today.</li>
</ul>
<h2>What the physician should resist</h2>
<p>Empirical antibiotics in the first forty-eight hours of an undifferentiated viral-looking fever rarely help and sometimes confuse. So does the urge to repeat investigations within a short window. The correct answer is often to observe, to support, and to reassess with fresh eyes.</p>
<p>The monsoon is a predictable teacher. Every year it reminds us that good medicine is patient, and that panic — on either side of the consulting table — is almost never a diagnosis.</p>
$body$
),
(
  'diabetes-and-the-long-game',
  'Diabetes and the Long Game',
  'Glycaemic control is a thirty-year conversation. The first ten minutes of the first consultation usually decide how it will go.',
  'What we fear in diabetes is rarely the blood sugar. It is the slow, patient erosion of kidneys, retinas, and feet.',
  'Essay',
  '7 min read',
  'published',
  '2026-02-27',
$body$
<p>A new diagnosis of diabetes is not, for most patients, a medical event. It is a biographical one. Something shifts in the way they think about food, about their parents, about the next twenty years. The work of the first consultation is as much to meet that shift as it is to prescribe a drug.</p>
<h2>Numbers that matter, and numbers that do not</h2>
<p>HbA1c is a useful number; fasting sugar taken at a laboratory three days after a wedding is not. Part of our job is to help patients understand which number is the signal and which is the noise. A single high reading on an ordinary day means less than the average of the last three months. Conversely, a perfectly normal reading after a fasting morning tells us nothing about what happens after dinner.</p>
<h2>The quiet complications</h2>
<p>What we fear in diabetes is rarely the blood sugar itself. It is the slow, patient erosion — of kidneys, of retinas, of the small vessels of the feet. Annual review of these is not a formality. It is the actual practice of diabetes care, and the part most often neglected in busy clinics.</p>
<h2>What usually works</h2>
<p>Most patients can, with reasonable effort, reach a reasonable HbA1c with a familiar short list: a walk most days, a few changes in the evening meal, metformin unless contraindicated, and an honest conversation every three months. Newer drugs — the GLP-1 agonists, the SGLT2 inhibitors — have earned a real place, and for the right patient they change the story. But the foundation is ordinary, and that is its strength.</p>
<h2>A word on the spouse</h2>
<p>No other illness is so clearly a household matter. Whoever cooks, whoever walks, whoever notices the morning hypoglycaemia — they are, in practice, co-authors of the treatment plan. The consultation that excludes them is usually the consultation that fails.</p>
$body$
)
on conflict (slug) do nothing;

-- Long-form pages
insert into public.pages (key, body_html) values
  ('about',
$about$
<p>Dr. Amitabh Parti grew up in Punjab and went to medical school at the University of Punjab, graduating MBBS in 1986 with a gold medal. He went on to take his MD in Internal Medicine at the same institution in 1991.</p>
<p>The final biographical text will be developed from an interview with Dr. Parti, in his own voice.</p>
$about$
  ),
  ('credentials',
$cred$
<p>Senior Director &amp; Unit Head, Internal Medicine, Fortis Memorial Research Institute, Gurgaon. 38 years of clinical practice, 32+ post-specialisation.</p>
$cred$
  )
on conflict (key) do update set body_html = excluded.body_html;

-- Verification query
select slug, category, status, published_at from public.posts order by published_at desc;
