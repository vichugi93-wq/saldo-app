-- ============================================================
-- SALDO — Setup de emails y cron job
-- Ejecutar en Supabase > SQL Editor DESPUÉS de supabase-setup.sql
-- ============================================================

-- 1. TABLA email_logs
-- ------------------------------------------------------------
-- Evita enviar el mismo email dos veces al mismo usuario en el mismo día

create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  email_type text not null check (email_type in ('reminder_5d', 'reminder_1d', 'expired')),
  sent_at timestamptz default now()
);

-- Índice para búsquedas rápidas de deduplicación
create index if not exists idx_email_logs_user_type_sent
  on email_logs (user_id, email_type, sent_at desc);

-- 2. RLS para email_logs
-- ------------------------------------------------------------
alter table email_logs enable row level security;

-- Solo el admin puede leer los logs (la Edge Function usa service_role_key, bypass RLS)
create policy "Admins can read email logs" on email_logs
  for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- 3. EXTENSIONES necesarias para el cron
-- ------------------------------------------------------------
-- pg_cron: permite programar tareas SQL recurrentes
create extension if not exists pg_cron;

-- pg_net: permite hacer llamadas HTTP desde SQL (necesario para llamar a la Edge Function)
create extension if not exists pg_net;

-- 4. CRON JOB
-- ------------------------------------------------------------
-- Ejecuta send-plan-reminder todos los días a las 13:00 UTC (= 9:00 AM Paraguay, UTC-4)
--
-- IMPORTANTE: reemplazá los placeholders antes de ejecutar:
--   <PROJECT_REF>     → tu project ref de Supabase (ej: qlosicifqbqkmjdbszkd)
--   <SERVICE_ROLE_KEY> → en Supabase > Project Settings > API > service_role key

select cron.schedule(
  'saldo-plan-reminder-daily',       -- nombre del job (único)
  '0 13 * * *',                      -- todos los días a las 13:00 UTC
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-plan-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  )
  $$
);

-- Para verificar que el cron quedó registrado:
-- select * from cron.job;

-- Para pausar o eliminar el cron:
-- select cron.unschedule('saldo-plan-reminder-daily');

-- 5. PRUEBA MANUAL SIN CRON
-- ------------------------------------------------------------
-- Podés disparar la Edge Function manualmente con curl antes de activar el cron:
--
-- curl -X POST \
--   https://<PROJECT_REF>.supabase.co/functions/v1/send-plan-reminder \
--   -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
--   -H "Content-Type: application/json"
--
-- La respuesta devuelve cuántos emails se procesaron y cuántos fallaron.
