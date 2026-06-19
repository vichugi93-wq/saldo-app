-- ═══════════════════════════════════════════════════
-- SALDO — Presupuestos por categoría
-- Ejecutar en Supabase SQL Editor
-- ═══════════════════════════════════════════════════

create table if not exists public.budgets (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  category    text        not null,
  amount      numeric     not null check (amount > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, category)
);

-- RLS
alter table public.budgets enable row level security;

create policy "users manage own budgets"
  on public.budgets for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índice de consulta rápida por usuario
create index if not exists budgets_user_id_idx on public.budgets(user_id);

-- Trigger updated_at automático (reutiliza la función si ya existe)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists budgets_updated_at on public.budgets;
create trigger budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();
