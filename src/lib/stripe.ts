import Stripe from 'stripe'

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_mock'

// @ts-ignore
export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2022-11-15',
})

export const isMockStripe = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export async function createCheckoutSession(userId: string, email: string, planId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  if (isMockStripe) {
    // Redirect to a local mock checkout page
    return `${appUrl}/dashboard/billing/checkout-mock?planId=${planId}`
  }
  
  const priceId = planId === 'basic' 
    ? process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID 
    : process.env.NEXT_PUBLIC_STRIPE_WHATSAPP_PRICE_ID
    
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${planId}`)
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
    customer_email: email,
    metadata: { 
      userId, 
      planId 
    },
  })
  
  return session.url!
}

export async function createPortalSession(customerId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  if (isMockStripe) {
    return `${appUrl}/dashboard/billing`
  }
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/billing`,
  })
  
  return session.url
}
