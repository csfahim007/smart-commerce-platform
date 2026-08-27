const apiUrl =
  import.meta.env.VITE_API_URL?.trim() || '/api/v1'

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim() || ''

export const env = {
  apiUrl,
  stripePublishableKey,
} as const
