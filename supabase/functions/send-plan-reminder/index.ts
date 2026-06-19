// @ts-ignore — tipos de Deno provistos por el runtime de Supabase Edge Functions
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'Saldo <noreply@saldo.app>';
const appUrl = (Deno.env.get('APP_URL') ?? 'https://tu-app.vercel.app').replace(/\/$/, '');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ProfileRow {
  id: string;
  name: string | null;
  plan: string;
  plan_expires_at: string;
}

type EmailType = 'reminder_5d' | 'reminder_1d' | 'expired';

// ─── Utilidades ───────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function alreadySentToday(userId: string, emailType: EmailType): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('email_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('email_type', emailType)
    .gte('sent_at', since)
    .limit(1);
  if (error) console.error('[email_logs] Error verificando deduplicación:', error.message);
  return (data?.length ?? 0) > 0;
}

async function logEmail(userId: string, emailType: EmailType): Promise<void> {
  const { error } = await supabase
    .from('email_logs')
    .insert({ user_id: userId, email_type: emailType });
  if (error) console.error('[email_logs] Error al guardar log:', error.message);
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: fromEmail, to, subject, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[Resend] Error ${res.status} enviando a ${to}:`, body);
    }
    return res.ok;
  } catch (err) {
    console.error(`[Resend] Excepción enviando a ${to}:`, err);
    return false;
  }
}

// ─── Plantillas HTML ──────────────────────────────────────────────────────────

function baseEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Saldo</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:700;color:#22c55e;letter-spacing:-0.5px;">Saldo</span>
              <p style="margin:4px 0 0;font-size:13px;color:#71717a;">Tus finanzas, bajo control</p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;padding:32px 28px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#52525b;">
                Recibís este email porque tenés una cuenta activa en Saldo.<br/>
                ¿No querés más avisos?
                <a href="mailto:hola@saldo.app?subject=No%20quiero%20emails" style="color:#71717a;">Escribinos aquí</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function emailReminder5d(name: string): { subject: string; html: string } {
  const planesUrl = `${appUrl}/planes`;
  return {
    subject: 'Tu prueba de Saldo Pro vence en 5 días',
    html: baseEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
        Hola${name ? ` ${name}` : ''}! &#x23F3;
      </h1>
      <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.6;">
        Tu período de prueba de <strong style="color:#22c55e;">Saldo Pro</strong> vence en
        <strong style="color:#ffffff;">5 días</strong>.
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#a1a1aa;line-height:1.6;">
        Hasta ahora pudiste usar:
      </p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr><td style="padding:4px 0;font-size:14px;color:#a1a1aa;">
          <span style="color:#22c55e;margin-right:8px;">&#10003;</span> Transacciones ilimitadas
        </td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#a1a1aa;">
          <span style="color:#22c55e;margin-right:8px;">&#10003;</span> Metas de ahorro ilimitadas
        </td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#a1a1aa;">
          <span style="color:#22c55e;margin-right:8px;">&#10003;</span> Análisis de IA para tus finanzas
        </td></tr>
        <tr><td style="padding:4px 0;font-size:14px;color:#a1a1aa;">
          <span style="color:#22c55e;margin-right:8px;">&#10003;</span> Gráficos avanzados y exportación
        </td></tr>
      </table>
      <p style="margin:0 0 28px;font-size:15px;color:#a1a1aa;line-height:1.6;">
        Renovalo por <strong style="color:#ffffff;">$4 USD / mes</strong> y
        seguí con todo el control sobre tus finanzas.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <a href="${planesUrl}"
               style="display:inline-block;background:#22c55e;color:#000000;font-weight:700;
                      font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
              Renovar mi plan
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

function emailReminder1d(name: string): { subject: string; html: string } {
  const planesUrl = `${appUrl}/planes`;
  return {
    subject: 'Último día de tu plan Pro en Saldo',
    html: baseEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
        Hola${name ? ` ${name}` : ''}! Mañana vence tu plan &#x1F514;
      </h1>
      <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.6;">
        Hoy es el <strong style="color:#eab308;">último día</strong> de tu plan
        <strong style="color:#22c55e;">Saldo Pro</strong>.
        Mañana tu cuenta vuelve automáticamente al plan Básico.
      </p>
      <div style="background:#1f1500;border:1px solid #854d0e;border-radius:10px;padding:16px;margin:0 0 24px;">
        <p style="margin:0;font-size:14px;color:#fbbf24;line-height:1.6;">
          Con el plan Básico vas a tener:<br/>
          &bull; Límite de 50 transacciones por mes<br/>
          &bull; Solo 1 meta de ahorro activa<br/>
          &bull; Sin análisis IA ni gráficos avanzados
        </p>
      </div>
      <p style="margin:0 0 28px;font-size:15px;color:#a1a1aa;line-height:1.6;">
        Si querés seguir con todo sin interrupciones, es el momento de renovar.
        Solo son <strong style="color:#ffffff;">$4 USD / mes</strong>.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <a href="${planesUrl}"
               style="display:inline-block;background:#22c55e;color:#000000;font-weight:700;
                      font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
              Renovar ahora
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

function emailExpired(name: string): { subject: string; html: string } {
  const planesUrl = `${appUrl}/planes`;
  return {
    subject: 'Tu plan venció — volviste a Saldo Básico',
    html: baseEmail(`
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#ffffff;">
        Hola${name ? ` ${name}` : ''}
      </h1>
      <p style="margin:0 0 20px;font-size:15px;color:#a1a1aa;line-height:1.6;">
        Tu plan Pro en Saldo venció hoy. Tu cuenta sigue activa y
        <strong style="color:#ffffff;">todos tus datos están intactos</strong>,
        pero ahora estás en el plan Básico.
      </p>
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 10px;font-size:13px;color:#71717a;font-weight:600;
                  text-transform:uppercase;letter-spacing:0.5px;">
          Plan Básico — activo ahora
        </p>
        <table cellpadding="0" cellspacing="0">
          <tr><td style="padding:3px 0;font-size:14px;color:#a1a1aa;">
            <span style="color:#22c55e;margin-right:8px;">&#10003;</span> Tus transacciones y datos guardados
          </td></tr>
          <tr><td style="padding:3px 0;font-size:14px;color:#a1a1aa;">
            <span style="color:#22c55e;margin-right:8px;">&#10003;</span> Dashboard básico disponible
          </td></tr>
          <tr><td style="padding:3px 0;font-size:14px;color:#71717a;">
            <span style="margin-right:8px;">&#10007;</span> Límite de 50 transacciones / mes
          </td></tr>
          <tr><td style="padding:3px 0;font-size:14px;color:#71717a;">
            <span style="margin-right:8px;">&#10007;</span> Solo 1 meta activa
          </td></tr>
          <tr><td style="padding:3px 0;font-size:14px;color:#71717a;">
            <span style="margin-right:8px;">&#10007;</span> Sin análisis IA ni gráficos avanzados
          </td></tr>
        </table>
      </div>
      <p style="margin:0 0 28px;font-size:15px;color:#a1a1aa;line-height:1.6;">
        Podés renovar cuando quieras desde la app.
        <strong style="color:#ffffff;">Tus datos nunca se borran.</strong>
      </p>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center">
            <a href="${planesUrl}"
               style="display:inline-block;background:#22c55e;color:#000000;font-weight:700;
                      font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
              Renovar mi plan
            </a>
          </td>
        </tr>
      </table>
    `),
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const in5Days = addDays(now, 5);
  const in1Day = addDays(now, 1);

  let processed = 0;
  let errors = 0;

  // Obtener mapa userId → email desde auth.users (requiere service_role)
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    console.error('[listUsers] Error:', usersError.message);
    return new Response(
      JSON.stringify({ ok: false, error: usersError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const emailMap = new Map<string, string>(
    usersData.users.map((u: { id: string; email?: string }) => [u.id, u.email ?? '']),
  );

  // Buscar perfiles con plan pago activo (no básico, con fecha de vencimiento)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, plan, plan_expires_at')
    .neq('plan', 'basic')
    .not('plan_expires_at', 'is', null);

  if (profilesError) {
    console.error('[profiles] Error:', profilesError.message);
    return new Response(
      JSON.stringify({ ok: false, error: profilesError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!profiles || profiles.length === 0) {
    console.log('send-plan-reminder: sin perfiles con plan activo.');
    return new Response(
      JSON.stringify({ ok: true, processed: 0, errors: 0 }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  }

  for (const profile of profiles as ProfileRow[]) {
    const expiryDate = profile.plan_expires_at.slice(0, 10);
    const email = emailMap.get(profile.id) ?? '';

    if (!email) {
      console.warn(`[skip] Usuario ${profile.id} sin email registrado.`);
      continue;
    }

    const name = profile.name ?? '';

    try {
      if (expiryDate === in5Days) {
        if (!(await alreadySentToday(profile.id, 'reminder_5d'))) {
          const { subject, html } = emailReminder5d(name);
          const ok = await sendEmail(email, subject, html);
          if (ok) { await logEmail(profile.id, 'reminder_5d'); processed++; }
          else errors++;
        }

      } else if (expiryDate === in1Day) {
        if (!(await alreadySentToday(profile.id, 'reminder_1d'))) {
          const { subject, html } = emailReminder1d(name);
          const ok = await sendEmail(email, subject, html);
          if (ok) { await logEmail(profile.id, 'reminder_1d'); processed++; }
          else errors++;
        }

      } else if (expiryDate <= today) {
        if (!(await alreadySentToday(profile.id, 'expired'))) {
          // Primero degradar el plan, luego notificar
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ plan: 'basic' })
            .eq('id', profile.id);

          if (updateError) {
            console.error(`[profiles] Error degradando plan de ${profile.id}:`, updateError.message);
            errors++;
            continue;
          }

          const { subject, html } = emailExpired(name);
          const ok = await sendEmail(email, subject, html);
          if (ok) { await logEmail(profile.id, 'expired'); processed++; }
          else errors++;
        }
      }
    } catch (err) {
      console.error(`[loop] Error procesando usuario ${profile.id}:`, err);
      errors++;
    }
  }

  console.log(`send-plan-reminder: ${processed} emails enviados, ${errors} errores.`);

  return new Response(
    JSON.stringify({ ok: true, processed, errors, timestamp: now.toISOString() }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});

// ─── Cómo configurar Resend ───────────────────────────────────────────────────
//
// 1. Crear cuenta gratuita en https://resend.com
// 2. Resend > API Keys > Create API Key → copiar la key
// 3. Supabase > Project Settings > Edge Functions > Secrets, agregar:
//      RESEND_API_KEY  = re_xxxxxxxxxxxxxxxx
//      FROM_EMAIL      = Saldo <noreply@tudominio.com>   ← dominio verificado en Resend
//      APP_URL         = https://tu-app.vercel.app
//
//    Durante testing: FROM_EMAIL = onboarding@resend.dev (solo envía a tu propio email)
//
// 4. Verificar dominio en Resend: Domains > Add Domain > seguir pasos DNS
//
// 5. Deploy:
//    supabase functions deploy send-plan-reminder --project-ref <project-ref>
//
// 6. Prueba manual:
//    curl -X POST https://<project-ref>.supabase.co/functions/v1/send-plan-reminder \
//         -H "Authorization: Bearer <service-role-key>"
