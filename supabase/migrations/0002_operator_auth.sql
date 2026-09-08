create table if not exists public.operator_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.operator_profiles enable row level security;

create or replace function public.is_active_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.operator_profiles
    where user_id = auth.uid() and active = true
  );
$$;

revoke all on function public.is_active_operator() from public;
grant execute on function public.is_active_operator() to authenticated;

drop policy if exists operator_profiles_select_self on public.operator_profiles;
create policy operator_profiles_select_self on public.operator_profiles
  for select to authenticated
  using (auth.uid() = user_id and active = true);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['event_contacts','discovery_interviews','pain_observations','event_timeline'] loop
    execute format('drop policy if exists %I on public.%I', table_name || '_select_active_operator', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_insert_active_operator', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_update_active_operator', table_name);
    execute format('create policy %I on public.%I for select to authenticated using (public.is_active_operator())', table_name || '_select_active_operator', table_name);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_active_operator())', table_name || '_insert_active_operator', table_name);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_active_operator()) with check (public.is_active_operator())', table_name || '_update_active_operator', table_name);
  end loop;
end $$;

comment on table public.operator_profiles is 'Provisioned event operators; rows are created by an administrator, never by public signup.';
