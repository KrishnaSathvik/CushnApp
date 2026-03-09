import { createClient } from '@supabase/supabase-js'

const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'E2E_TEST_EMAIL', 'E2E_TEST_PASSWORD']
const missing = required.filter((k) => !process.env[k])

if (missing.length > 0) {
  console.error(`Missing env vars: ${missing.join(', ')}`)
  console.error('Set these and rerun: npm run test:realtime')
  process.exit(1)
}

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function run() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_TEST_EMAIL,
    password: process.env.E2E_TEST_PASSWORD,
  })
  if (authError) throw authError

  const userId = authData.user?.id
  if (!userId) throw new Error('No authenticated user id available')

  let fallbackCategory = null
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id,name')
    .eq('user_id', userId)
    .order('name')
  if (!catErr && Array.isArray(categories)) {
    fallbackCategory = categories.find((c) => c.name.toLowerCase() === 'other') || categories[0] || null
  }

  let seenEvent = null
  const channel = supabase
    .channel(`realtime-e2e-${userId}-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` },
      (payload) => {
        seenEvent = payload
      }
    )

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Realtime channel subscribe timeout')), 10000)
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(timer)
        resolve()
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        clearTimeout(timer)
        reject(new Error(`Realtime subscribe failed: ${status}`))
      }
    })
  })

  const marker = `Realtime E2E ${Date.now()}`
  const { data: inserted, error: insertErr } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      name: marker,
      amount: 1.23,
      currency: 'USD',
      cycle: 'monthly',
      category_id: fallbackCategory?.id ?? null,
      renewal_date: new Date().toISOString().slice(0, 10),
      status: 'active',
      notes: 'realtime smoke test',
    })
    .select('id,name')
    .single()
  if (insertErr) throw insertErr

  const eventDeadline = Date.now() + 10000
  while (Date.now() < eventDeadline) {
    if (seenEvent?.new?.id === inserted.id) break
    await timeout(100)
  }

  try {
    await supabase.from('subscriptions').delete().eq('id', inserted.id).eq('user_id', userId)
  } finally {
    await supabase.removeChannel(channel)
    await supabase.auth.signOut()
  }

  if (seenEvent?.new?.id !== inserted.id) {
    throw new Error('Did not receive expected realtime insert event')
  }

  console.log(`PASS realtime event received for subscription ${inserted.id}`)
}

run().catch((err) => {
  console.error(`FAIL ${err.message || String(err)}`)
  process.exit(1)
})
