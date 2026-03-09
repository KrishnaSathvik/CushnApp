import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildEditorialEmail, cushnHighlight, escapeEmailHtml } from '../_shared/cushnEmail.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_URL = 'https://api.resend.com/emails'

function getCycleLabel(cycle: string): string {
  if (cycle === 'annual') return 'annual'
  if (cycle === 'quarterly') return 'quarterly'
  if (cycle === 'weekly') return 'weekly'
  if (cycle === 'biweekly') return 'biweekly'
  return 'monthly'
}

function buildReminderEmailHtml(
  recipientName: string,
  name: string,
  amount: number,
  currency: string,
  cycle: string,
  renewalDate: string,
  siteUrl: string,
) {
  const serviceName = name || 'Subscription'
  const formattedAmount = `${escapeEmailHtml(currency)} ${Number(amount).toFixed(2)}`
  const cycleLabel = getCycleLabel(cycle)

  return buildEditorialEmail({
    title: `${serviceName} renews soon`,
    greeting: `Hey ${escapeEmailHtml(recipientName || 'there')} 👋`,
    paragraphs: [
      `This is a quick reminder that ${cushnHighlight(serviceName)} is renewing soon.`,
      `Your next charge is ${cushnHighlight(`${formattedAmount} ${cycleLabel}`)} and is scheduled for ${cushnHighlight(renewalDate)}.`,
      `At ${cushnHighlight('Cushn')}, we help you stay ahead of renewals so recurring costs stay visible before charges hit.`,
    ],
    sectionTitle: '🔔 What to Review',
    sectionBody: `Double-check the service, amount, and renewal timing now. You can adjust reminder preferences anytime in Cushn Settings if you want fewer or different alerts.`,
    ctaLabel: 'Review My Renewals',
    ctaHref: `${siteUrl}/calendar`,
    footerNote: `Service: ${escapeEmailHtml(serviceName)} · Amount: ${formattedAmount} · Renewal date: ${escapeEmailHtml(renewalDate)}`,
    footerSecondaryLabel: 'Manage preferences',
    footerSecondaryHref: `${siteUrl}/login?redirect=%2Fpreferences`,
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Cushn <support@cushn.app>'
    const siteUrl = Deno.env.get('SITE_URL') || 'https://cushn.app'
    const authHeader = req.headers.get('Authorization')
    const targetDate = new Date().toISOString().slice(0, 10)

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !resendApiKey) {
      return new Response(JSON.stringify({ error: 'Missing required environment configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: userError?.message || 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!user.email) {
      return new Response(JSON.stringify({ error: 'User email not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: emailEvents, error: eventsError } = await adminClient
      .from('notification_events')
      .select('id,subscription_id,renewal_date')
      .eq('user_id', user.id)
      .eq('channel', 'email')
      .eq('status', 'queued')
      .eq('reminder_date', targetDate)
      .limit(50)

    if (eventsError) {
      return new Response(JSON.stringify({ error: eventsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let emailsSent = 0
    let emailsFailed = 0

    for (const event of emailEvents || []) {
      try {
        const { data: sub, error: subError } = await adminClient
          .from('subscriptions')
          .select('name,amount,currency,cycle,renewal_date')
          .eq('id', event.subscription_id)
          .eq('user_id', user.id)
          .single()

        if (subError) throw new Error(subError.message)

        const recipientName =
          user.user_metadata?.full_name ||
          user.email.split('@')[0] ||
          'there'

        const subject = `Reminder: ${sub.name} renews on ${sub.renewal_date}`
        const html = buildReminderEmailHtml(
          recipientName,
          sub.name,
          sub.amount,
          sub.currency,
          sub.cycle,
          sub.renewal_date,
          siteUrl,
        )

        const emailRes = await fetch(RESEND_API_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [user.email],
            subject,
            html,
          }),
        })

        if (!emailRes.ok) {
          const text = await emailRes.text()
          throw new Error(text || 'Email provider error')
        }

        const { error: markSentError } = await adminClient
          .from('notification_events')
          .update({ status: 'sent', sent_at: new Date().toISOString(), error_text: '' })
          .eq('id', event.id)
          .eq('status', 'queued')

        if (markSentError) throw new Error(markSentError.message)
        emailsSent++
      } catch (err) {
        emailsFailed++
        await adminClient
          .from('notification_events')
          .update({
            status: 'failed',
            error_text: String(err).slice(0, 900),
          })
          .eq('id', event.id)
          .eq('status', 'queued')
      }
    }

    return new Response(JSON.stringify({
      targetDate,
      queued: emailEvents?.length || 0,
      emailsSent,
      emailsFailed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
