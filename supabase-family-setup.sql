-- ═══════════════════════════════════════════════════
-- SALDO — Plan Familiar con invitaciones
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Función helper para obtener el email del usuario actual
create or replace function public.current_user_email()
returns text language sql security definer
as $$ select email from auth.users where id = auth.uid(); $$;

-- Grupo familiar (uno por titular del plan)
create table if not exists public.family_groups (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade unique,
  max_members int  not null default 4,
  created_at  timestamptz not null default now()
);

-- Invitaciones
create table if not exists public.family_invitations (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid not null references public.family_groups(id) on delete cascade,
  invited_email   text not null,
  token           text not null unique,
  status          text not null default 'pending' check (status in ('pending', 'accepted', 'cancelled')),
  invited_user_id uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null default now() + interval '7 days',
  unique (group_id, invited_email)
);

-- Columna en profiles para saber a qué grupo pertenece el usuario
alter table public.profiles
  add column if not exists family_group_id uuid references public.family_groups(id) on delete set null;

-- ─── RLS ───────────────────────────────────────────

alter table public.family_groups enable row level security;
alter table public.family_invitations enable row level security;

-- El titular puede gestionar su grupo
drop policy if exists "owner manages group" on public.family_groups;
create policy "owner manages group"
  on public.family_groups for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Los miembros pueden ver el grupo al que pertenecen
drop policy if exists "member reads group" on public.family_groups;
create policy "member reads group"
  on public.family_groups for select
  using (id = (select family_group_id from public.profiles where id = auth.uid()));

-- El titular gestiona las invitaciones de su grupo
drop policy if exists "owner manages invitations" on public.family_invitations;
create policy "owner manages invitations"
  on public.family_invitations for all
  using  (group_id in (select id from public.family_groups where owner_id = auth.uid()))
  with check (group_id in (select id from public.family_groups where owner_id = auth.uid()));

-- Cualquiera con el token puede leer la invitación (el token es el secreto)
drop policy if exists "read by token" on public.family_invitations;
create policy "read by token"
  on public.family_invitations for select
  using (true);

-- El invitado puede aceptar su propia invitación
drop policy if exists "accept own invitation" on public.family_invitations;
create policy "accept own invitation"
  on public.family_invitations for update
  using (
    invited_email = public.current_user_email()
    or invited_user_id = auth.uid()
  );

-- Índices
create index if not exists family_groups_owner_idx on public.family_groups(owner_id);
create index if not exists family_invitations_group_idx on public.family_invitations(group_id);
create index if not exists family_invitations_token_idx on public.family_invitations(token);
create index if not exists profiles_family_group_idx on public.profiles(family_group_id);
