-- ============================================================
-- SALDO — Setup completo de Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLAS
-- ------------------------------------------------------------

create table if not exists profiles (
  id uuid references auth.users primary key,
  name text,
  currency text default 'PYG',
  plan text default 'basic',
  plan_expires_at timestamptz,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  description text,
  date date not null,
  created_at timestamptz default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric default 0,
  deadline date,
  category text,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create table if not exists ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamptz default now()
);

create table if not exists family_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  name text not null,
  color text,
  currency text default 'PYG',
  created_at timestamptz default now()
);

create table if not exists payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  plan_requested text not null check (plan_requested in ('pro', 'family')),
  receipt_url text not null,
  reference_note text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  reviewed_by uuid references auth.users,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table profiles enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table ai_analyses enable row level security;
alter table family_profiles enable row level security;
alter table payment_requests enable row level security;

-- profiles
create policy "Users can read own profile" on profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);
-- Admin puede leer todos los perfiles
create policy "Admins can read all profiles" on profiles
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );
create policy "Admins can update all profiles" on profiles
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- transactions
create policy "Users can CRUD own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- goals
create policy "Users can CRUD own goals" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ai_analyses
create policy "Users can CRUD own analyses" on ai_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- family_profiles
create policy "Users can CRUD own family profiles" on family_profiles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- payment_requests: usuario crea y lee las suyas; admin puede actualizar
create policy "Users can insert own requests" on payment_requests
  for insert with check (auth.uid() = user_id);
create policy "Users can read own requests" on payment_requests
  for select using (auth.uid() = user_id);
create policy "Admins can read all requests" on payment_requests
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );
create policy "Admins can update requests" on payment_requests
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true)
  );

-- 3. STORAGE
-- ------------------------------------------------------------

-- Crear bucket privado para comprobantes de pago
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprobantes',
  'comprobantes',
  false,
  5242880,  -- 5 MB en bytes
  array['image/jpeg', 'image/png', 'application/pdf']
)
on conflict (id) do nothing;

-- Usuarios pueden subir archivos solo a su propia carpeta ({user_id}/...)
create policy "Users upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'comprobantes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuarios pueden leer sus propios archivos
create policy "Users read own files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'comprobantes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Usuarios pueden eliminar sus propios archivos
create policy "Users delete own files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'comprobantes'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admin puede leer todos los comprobantes
create policy "Admins read all files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'comprobantes'
    AND exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );

-- 4. PRIMER ADMIN
-- ------------------------------------------------------------
-- INSTRUCCIÓN: después de registrarte en la app, reemplazá el ID de abajo
-- con el tuyo (lo encontrás en Supabase > Authentication > Users)
-- y ejecutá este bloque por separado:
--
-- update profiles set is_admin = true where id = 'tu-user-id-aqui';

-- 5. ÍNDICES (mejora performance)
-- ------------------------------------------------------------
create index if not exists idx_transactions_user_date on transactions (user_id, date desc);
create index if not exists idx_goals_user_status on goals (user_id, status);
create index if not exists idx_payment_requests_status on payment_requests (status);
create index if not exists idx_payment_requests_user on payment_requests (user_id);
create index if not exists idx_ai_analyses_user on ai_analyses (user_id, created_at desc);
