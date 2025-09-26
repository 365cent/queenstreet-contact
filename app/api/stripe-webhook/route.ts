import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { updateOrderStatus } from "@/lib/database"
import { sendPurchaseConfirmation } from "@/lib/email"

let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set")
    }
    stripe = new Stripe(secretKey, {
      apiVersion: "2025-07-30.basil",
    })
  }
  return stripe
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set")
  }
  return secret
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret())
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const orderId = Number.parseInt(paymentIntent.metadata.orderId)
        const userId = paymentIntent.metadata.userId
        const contactCount = Number.parseInt(paymentIntent.metadata.contactCount)

        // Update order status to completed
        await updateOrderStatus(orderId, "completed", paymentIntent.id)

        try {
          // Use Blob Storage URL for permanent download link
          const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/download`

          await sendPurchaseConfirmation({
            to: "customer@example.com", // In a real app, get from user profile
            customerName: "Valued Customer", // In a real app, get from user profile
            orderId: orderId.toString(),
            contactCount,
            amount: paymentIntent.amount / 100, // Convert from cents
            downloadUrl,
          })

          console.log(`Purchase confirmation email sent for order ${orderId}`)
        } catch (emailError) {
          console.error("Error sending purchase confirmation email:", emailError)
          // Don't fail the webhook if email fails
        }

        console.log(`Payment succeeded for order ${orderId}`)
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent
        const failedOrderId = Number.parseInt(failedPayment.metadata.orderId)

        // Update order status to failed
        await updateOrderStatus(failedOrderId, "failed", failedPayment.id)

        console.log(`Payment failed for order ${failedOrderId}`)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
