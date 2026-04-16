-- =========================================================================
-- amitabhparti.com · settings table for editable site-wide content
-- =========================================================================

create table if not exists public.settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- updated_at trigger (re-uses the function from 0001_init.sql)
drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.tg_set_updated_at();

-- RLS
alter table public.settings enable row level security;

drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings
  for select
  using (true);

drop policy if exists "settings_auth_write" on public.settings;
create policy "settings_auth_write" on public.settings
  for all to authenticated
  using (true)
  with check (true);

-- Seed the single row used by the site. If it already exists, leave it alone
-- (so re-running this migration doesn't stomp user edits).
insert into public.settings (key, value) values (
  'site',
  jsonb_build_object(
    'hero', jsonb_build_object(
      'quote',        'Medicine has built magnificent instruments. The single most consequential remains the willingness to listen.',
      'highlight',    'willingness to listen',
      'attribution',  'Dr. Amitabh Parti · Internal Medicine, Fortis Memorial, Gurgaon'
    ),
    'contact', jsonb_build_object(
      'email',          'office@amitabhparti.com',
      'fortis_profile', 'https://www.fortishealthcare.com/doctors/dr-amitabh-parti-1097'
    ),
    'address', jsonb_build_object(
      'hospital', 'Fortis Memorial Research Institute',
      'line1',    'Sector 44, Opposite HUDA City Centre Metro Station',
      'line2',    'Gurugram, Haryana 122002',
      'country',  'India'
    ),
    'clinical_interests', jsonb_build_array(
      jsonb_build_object('title', 'Infectious Disease',       'note', 'Tropical, systemic, and everyday infections.'),
      jsonb_build_object('title', 'Hypertension',              'note', 'Quiet, lifelong, and under-treated.'),
      jsonb_build_object('title', 'Diabetes Management',       'note', 'A thirty-year conversation, held one visit at a time.'),
      jsonb_build_object('title', 'Thyroid Disorders',         'note', 'Commoner than once thought; frequently missed.'),
      jsonb_build_object('title', 'Tropical Medicine',         'note', 'The seasons and their diseases in North India.'),
      jsonb_build_object('title', 'General Internal Medicine', 'note', 'The specialist before specialists.')
    ),
    'empanelments', jsonb_build_array(
      'Engineers India Limited',
      'Ballarpur Industries Limited',
      'Indus Towers Limited',
      'Instyle Exports Limited',
      'University of Delhi'
    )
  )
)
on conflict (key) do nothing;
