-- Meli2026 transactional discovery storage. Apply only after reviewing operator auth/RLS.
create table if not exists public.event_contacts (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  captured_by text not null,
  actor_type text not null,
  full_name text,
  company_name text,
  whatsapp text,
  email text,
  meli_nickname text,
  followup_consent boolean not null default false
);

create table if not exists public.discovery_interviews (
  id uuid primary key,
  contact_id uuid references public.event_contacts(id) on delete cascade,
  event_id text not null,
  actor_type text not null,
  operator_id text not null,
  started_at timestamptz not null,
  updated_at timestamptz not null,
  completed_at timestamptz,
  current_step integer not null default 0,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  unique (event_id, id)
);

create table if not exists public.pain_observations (
  id uuid primary key,
  interview_id uuid references public.discovery_interviews(id) on delete cascade,
  contact_id uuid references public.event_contacts(id) on delete cascade,
  tag text not null,
  text text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.event_timeline (
  id uuid primary key,
  entity_type text not null,
  entity_id uuid not null,
  contact_id uuid references public.event_contacts(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  unique (entity_type, entity_id, event_type, occurred_at)
);

create index if not exists event_contacts_actor_type_idx on public.event_contacts(actor_type);
create index if not exists event_contacts_whatsapp_idx on public.event_contacts(whatsapp);
create index if not exists discovery_interviews_contact_id_idx on public.discovery_interviews(contact_id);
create index if not exists discovery_interviews_completed_at_idx on public.discovery_interviews(completed_at);
create index if not exists discovery_interviews_status_idx on public.discovery_interviews(status);
create index if not exists pain_observations_contact_id_idx on public.pain_observations(contact_id);
create index if not exists pain_observations_tag_idx on public.pain_observations(tag);
create index if not exists event_timeline_contact_id_idx on public.event_timeline(contact_id);

alter table public.event_contacts enable row level security;
alter table public.discovery_interviews enable row level security;
alter table public.pain_observations enable row level security;
alter table public.event_timeline enable row level security;

-- No public SELECT/INSERT policies are created until operator authentication is defined.
