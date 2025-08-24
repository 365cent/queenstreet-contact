import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  // Only allow this in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  const diagnostics = {
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8) + "...",
    publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 8) + "...",
    nodeEnv: process.env.NODE_ENV,
  }

  return NextResponse.json(diagnostics)
}
