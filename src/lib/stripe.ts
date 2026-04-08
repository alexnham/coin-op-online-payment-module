import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Single unit: 4 credits per unit. Customers pick a quantity of units.
export const CREDIT_PACKAGES = [
  {
    id: 'unit',
    credits: 4,
    price: 1300,        // $13.00 in cents per unit (4 credits)
    label: '4 Credits',
    priceEnv: 'STRIPE_PRICE_4_CREDITS',
    popular: false,
  },
]
