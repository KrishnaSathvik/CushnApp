const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildEditorialEmail, cushnHighlight, escapeEmailHtml } from '../_shared/cushnEmail.ts'

type QueueResponse = {
  queued: number
  emailsSent: number
  emailsFailed: number
  targetDate: string
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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const cronSecret = Deno.env.get('CRON_SECRET')
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Cushn <support@cushn.app>'
    const siteUrl = Deno.env.get('SITE_URL') || 'https://cushn.app'
    const authHeader = req.headers.get('Authorization')
    const headerSecret = req.headers.get('x-cron-secret')
    const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!supabaseUrl || !serviceRoleKey || !cronSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or CRON_SECRET' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (headerSecret !== cronSecret && bearerSecret !== cronSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const targetDate = typeof body?.targetDate === 'string' && body.targetDate
      ? body.targetDate
      : new Date().toISOString().slice(0, 10)

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: queuedRaw, error: queueError } = await supabase
      .rpc('queue_renewal_reminders', { target_date: targetDate })
    if (queueError) {
      return new Response(JSON.stringify({ error: queueError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const queued = Number(queuedRaw) || 0
    let emailsSent = 0
    let emailsFailed = 0

    if (resendApiKey) {
      const batchSize = 200

      while (true) {
        const { data: emailEvents, error: eventsError } = await supabase
          .from('notification_events')
          .select('id,user_id,subscription_id,renewal_date')
          .eq('channel', 'email')
          .eq('status', 'queued')
          .eq('reminder_date', targetDate)
          .limit(batchSize)

        if (eventsError) {
          return new Response(JSON.stringify({ error: eventsError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        if (!emailEvents?.length) break

        for (const event of emailEvents) {
          try {
            const { data: sub, error: subError } = await supabase
              .from('subscriptions')
              .select('name,amount,currency,cycle,renewal_date')
              .eq('id', event.subscription_id)
              .single()
            if (subError) throw new Error(subError.message)

            const { data: userResult, error: userErr } = await supabase.auth.admin.getUserById(event.user_id)
            if (userErr || !userResult.user?.email) throw new Error(userErr?.message || 'User email not found')
            const recipientName =
              userResult.user.user_metadata?.full_name ||
              userResult.user.email?.split('@')[0] ||
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
                to: [userResult.user.email],
                subject,
                html,
              }),
            })

            if (!emailRes.ok) {
              const text = await emailRes.text()
              throw new Error(text || 'Email provider error')
            }

            const { error: markSentError } = await supabase
              .from('notification_events')
              .update({ status: 'sent', sent_at: new Date().toISOString(), error_text: '' })
              .eq('id', event.id)
            if (markSentError) throw new Error(markSentError.message)

            emailsSent++
          } catch (err) {
            emailsFailed++
            await supabase
              .from('notification_events')
              .update({
                status: 'failed',
                error_text: String(err).slice(0, 900),
              })
              .eq('id', event.id)
          }
        }

        if (emailEvents.length < batchSize) break
      }
    }

    const payload: QueueResponse = { queued, emailsSent, emailsFailed, targetDate }

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
