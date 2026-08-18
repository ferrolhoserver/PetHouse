-- PetHouse V2 — Migração não destrutiva para identidade, backup cifrado e MFA.
--
-- IMPORTANTE:
-- 1. Execute em ambiente de homologação antes de produção.
-- 2. Esta migração NÃO altera nem apaga pethouse_data legado.
-- 3. Revogue as políticas públicas da tabela legada somente após a janela de migração.

create extension if not exists pgcrypto;

create table if not exists public.pethouse_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  remote_schema_version integer not null default 2
);

create table if not exists public.pethouse_encrypted_vaults (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid,
  payload jsonb not null,
  payload_version integer not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint pethouse_encrypted_vaults_payload_object check (jsonb_typeof(payload) = 'object')
);

create index if not exists pethouse_encrypted_vaults_owner_updated_idx
  on public.pethouse_encrypted_vaults (owner_id, updated_at desc)
  where deleted_at is null;

create table if not exists public.pethouse_devices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 120),
  public_key jsonb,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists pethouse_devices_owner_active_idx
  on public.pethouse_devices (owner_id, last_seen_at desc)
  where revoked_at is null;

create table if not exists public.pethouse_security_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type ~ '^[a-z0-9_]{3,80}$'),
  device_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists pethouse_security_events_owner_created_idx
  on public.pethouse_security_events (owner_id, created_at desc);

alter table public.pethouse_profiles enable row level security;
alter table public.pethouse_encrypted_vaults enable row level security;
alter table public.pethouse_devices enable row level security;
alter table public.pethouse_security_events enable row level security;

-- Acesso básico ao próprio perfil. Nenhuma tabela admite leitura cruzada.
drop policy if exists "pethouse_profile_owner" on public.pethouse_profiles;
create policy "pethouse_profile_owner" on public.pethouse_profiles
  for all to authenticated
  using ((select auth.uid()) = user_id and deleted_at is null)
  with check ((select auth.uid()) = user_id);

-- Cofres remotos exigem MFA concluído (AAL2) e pertencimento ao usuário.
drop policy if exists "pethouse_vault_owner_mfa" on public.pethouse_encrypted_vaults;
create policy "pethouse_vault_owner_mfa" on public.pethouse_encrypted_vaults
  as restrictive for all to authenticated
  using (
    (select auth.uid()) = owner_id
    and deleted_at is null
    and (select auth.jwt() ->> 'aal') = 'aal2'
  )
  with check (
    (select auth.uid()) = owner_id
    and (select auth.jwt() ->> 'aal') = 'aal2'
  );

-- Dispositivos podem ser geridos pelo dono; remoção/revogação é lógica no app.
drop policy if exists "pethouse_device_owner" on public.pethouse_devices;
create policy "pethouse_device_owner" on public.pethouse_devices
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Eventos contêm somente metadados pseudonimizados e são privados por usuário.
drop policy if exists "pethouse_event_owner" on public.pethouse_security_events;
create policy "pethouse_event_owner" on public.pethouse_security_events
  for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- Trigger genérico de updated_at, criado somente se ainda não existir.
create or replace function public.pethouse_touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pethouse_profiles_touch_updated_at on public.pethouse_profiles;
create trigger pethouse_profiles_touch_updated_at
before update on public.pethouse_profiles
for each row execute function public.pethouse_touch_updated_at();

drop trigger if exists pethouse_vaults_touch_updated_at on public.pethouse_encrypted_vaults;
create trigger pethouse_vaults_touch_updated_at
before update on public.pethouse_encrypted_vaults
for each row execute function public.pethouse_touch_updated_at();

-- PASSO MANUAL APÓS A MIGRAÇÃO DE TODOS OS PERFIS:
-- Revise e então substitua a política pública antiga de pethouse_data.
-- Não execute este bloco enquanto houver usuários legados.
-- drop policy if exists "Permitir acesso público" on public.pethouse_data;
-- create policy "pethouse_data_legacy_blocked" on public.pethouse_data for all using (false) with check (false);
