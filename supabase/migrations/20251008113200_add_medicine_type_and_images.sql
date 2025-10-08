-- Add medicine type and image fields to medicines table
alter table public.medicines 
add column if not exists medicine_type text check (medicine_type in ('tablet', 'capsule')),
add column if not exists image_url text,
add column if not exists shape text,
add column if not exists color text,
add column if not exists size text;

-- Update existing medicines with sample data
update public.medicines set 
  medicine_type = 'tablet',
  image_url = '/images/medicines/' || lower(replace(name, ' ', '_')) || '.jpg',
  shape = 'round',
  color = 'white'
where medicine_type is null;

-- Update specific medicines with more realistic data
update public.medicines set 
  medicine_type = 'tablet',
  shape = 'round',
  color = 'white',
  size = 'small'
where name = 'Aspirin';

update public.medicines set 
  medicine_type = 'tablet',
  shape = 'oval',
  color = 'white',
  size = 'medium'
where name = 'Paracetamol';

update public.medicines set 
  medicine_type = 'tablet',
  shape = 'round',
  color = 'orange',
  size = 'small'
where name = 'Ibuprofen';

update public.medicines set 
  medicine_type = 'capsule',
  shape = 'capsule',
  color = 'purple',
  size = 'medium'
where name = 'Omeprazole';

update public.medicines set 
  medicine_type = 'tablet',
  shape = 'oval',
  color = 'white',
  size = 'large'
where name = 'Metformin';
