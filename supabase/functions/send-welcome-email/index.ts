import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildEditorialEmail, cushnHighlight, escapeEmailHtml } from '../_shared/cushnEmail.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_URL = 'https://api.resend.com/emails'

function buildWelcomeEmailHtml(recipientName: string, siteUrl: string) {
  return buildEditorialEmail({
    title: 'Welcome to Cushn',
    greeting: `Hey ${escapeEmailHtml(recipientName || 'there')} 👋`,
    paragraphs: [
      `Welcome to ${cushnHighlight('Cushn')}. Your account is ready, and you can now start managing your subscriptions in one place with a cleaner command-center workflow.`,
      'Cushn helps you stay ahead of recurring spend, spot upcoming renewals earlier, and keep your budget aligned without digging through old emails and statements.',
    ],
    sectionTitle: '✨ What you can do now',
    sectionBody: 'Add subscriptions by text or voice, track renewal dates in your dashboard and calendar, turn on in-app and email reminders, and keep recurring spend aligned with your budget.',
    ctaLabel: 'Open Cushn',
    ctaHref: `${siteUrl}/`,
    footerNote: 'Start with the dashboard, add your first few services, and let Cushn keep the renewal timeline visible from there.',
    footerSecondaryLabel: 'Manage preferences',
    footerSecondaryHref: `${siteUrl}/preferences`,
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

    if (!user.email_confirmed_at) {
      return new Response(JSON.stringify({ sent: false, skipped: 'email_not_confirmed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (user.user_metadata?.welcome_email_sent_at) {
      return new Response(JSON.stringify({ sent: false, skipped: 'already_sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!user.email) {
      return new Response(JSON.stringify({ error: 'User email not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const recipientName = user.user_metadata?.full_name || user.email.split('@')[0] || 'there'
    const html = buildWelcomeEmailHtml(recipientName, siteUrl)

    const emailRes = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [user.email],
        subject: 'Welcome to Cushn',
        html,
      }),
    })

    if (!emailRes.ok) {
      const text = await emailRes.text()
      return new Response(JSON.stringify({ error: text || 'Email provider error' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        welcome_email_sent_at: new Date().toISOString(),
      },
    })

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      sent: true,
      userId: user.id,
      email: user.email,
      welcomeEmailSentAt: new Date().toISOString(),
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
