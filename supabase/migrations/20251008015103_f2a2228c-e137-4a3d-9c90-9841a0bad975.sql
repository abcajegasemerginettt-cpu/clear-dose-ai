-- Create medicines table
create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dosage text,
  description text,
  side_effects jsonb default '[]'::jsonb,
  manufacturer text,
  image_features jsonb,
  created_at timestamptz not null default now()
);

-- Create scan_history table
create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  medicine_id uuid references public.medicines(id) on delete set null,
  medicine_name text,
  confidence int check (confidence >= 0 and confidence <= 100),
  scanned_image_url text,
  scanned_at timestamptz not null default now()
);

-- Enable RLS
alter table public.medicines enable row level security;
alter table public.scan_history enable row level security;

-- Policies (public app demo)
-- Medicines: public can read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'medicines' and policyname = 'Public can read medicines'
  ) then
    create policy "Public can read medicines" on public.medicines for select using (true);
  end if;
end $$;

-- Scan history: public can read/insert/delete
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'scan_history' and policyname = 'Public can read scan history'
  ) then
    create policy "Public can read scan history" on public.scan_history for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'scan_history' and policyname = 'Public can insert scan history'
  ) then
    create policy "Public can insert scan history" on public.scan_history for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'scan_history' and policyname = 'Public can delete scan history'
  ) then
    create policy "Public can delete scan history" on public.scan_history for delete using (true);
  end if;
end $$;

-- Seed sample medicines
insert into public.medicines (name, dosage, description, side_effects, manufacturer)
values
  ('Aspirin', '325 mg', 'Pain reliever and fever reducer.', '["Stomach upset","Bleeding risk"]', 'Bayer'),
  ('Paracetamol', '500 mg', 'Analgesic and antipyretic.', '["Liver issues at high dose"]', 'Acme Pharma'),
  ('Ibuprofen', '200 mg', 'NSAID for pain and inflammation.', '["GI irritation","Kidney risk"]', 'HealthCorp'),
  ('Omeprazole', '20 mg', 'Proton pump inhibitor for reflux.', '["Headache","Abdominal pain"]', 'Wellness Labs'),
  ('Metformin', '500 mg', 'First-line therapy for Type 2 diabetes.', '["GI upset","Vitamin B12 deficiency"]', 'GlucoseCare')
on conflict do nothing;