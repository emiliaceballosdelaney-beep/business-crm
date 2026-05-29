import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { PROSPER_STARTUP_ID } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' })

  const rawBody = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const email = session.customer_details?.email ?? null
    const amountCents = session.amount_total ?? 0
    const packageType = (session.metadata?.package_type as string | undefined) ?? null
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : null

    // Find client by stripe_customer_id or email
    let clientId: string | null = null
    if (stripeCustomerId) {
      const { data } = await supabase
        .from('clients')
        .select('id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single()
      clientId = data?.id ?? null
    }

    if (!clientId && email) {
      const { data } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single()
      clientId = data?.id ?? null
    }

    // Log payment interaction
    await supabase.from('interactions').insert({
      startup_id: PROSPER_STARTUP_ID,
      client_id: clientId,
      interaction_type: 'stripe_payment',
      title: packageType ? `Payment — ${packageType} package` : 'Stripe payment received',
      occurred_at: new Date().toISOString(),
      amount_cents: amountCents,
      metadata: {
        stripe_session_id: session.id,
        package_type: packageType,
        customer_email: email,
      },
    })

    // Update client: last_contacted_at + package if metadata provided
    if (clientId) {
      const updates: Record<string, unknown> = {
        last_contacted_at: new Date().toISOString(),
      }
      if (stripeCustomerId) updates.stripe_customer_id = stripeCustomerId

      if (packageType) {
        const PACKAGE_MAP: Record<string, { sessions: number | null; months: number | null }> = {
          clarity:        { sessions: 3,    months: 6    },
          confidence:     { sessions: 6,    months: 12   },
          targeted:       { sessions: 1,    months: 1    },
          maintenance_90: { sessions: null, months: null },
          maintenance_60: { sessions: null, months: null },
          maintenance_30: { sessions: null, months: null },
        }
        const pkg = PACKAGE_MAP[packageType]
        if (pkg) {
          updates.package_type = packageType
          updates.billing_model = 'package'
          if (pkg.sessions !== null) updates.sessions_total = pkg.sessions
          updates.sessions_used = 0
          updates.package_start_date = new Date().toISOString().slice(0, 10)
          updates.package_price_cents = amountCents
          if (pkg.months) {
            const expiry = new Date()
            expiry.setMonth(expiry.getMonth() + pkg.months)
            updates.package_expiry_date = expiry.toISOString().slice(0, 10)
          }
          updates.status = 'active'
        }
      }

      await supabase.from('clients').update(updates).eq('id', clientId)
    }
  }

  return NextResponse.json({ received: true })
}
