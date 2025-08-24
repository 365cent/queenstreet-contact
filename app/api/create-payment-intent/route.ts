import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createOrder } from "@/lib/database"

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

export async function POST(request: NextRequest) {
  try {
    const { contactIds, userId, amount = 4900 } = await request.json() // $49.00 in cents

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create order in database
    const order = await createOrder(userId, contactIds, amount / 100)

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Type assertion since we know the order structure from database
    const orderRecord = order as { id: number; [key: string]: any }

    // Create payment intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency: "cad",
      metadata: {
        orderId: orderRecord.id.toString(),
        userId,
        contactCount: contactIds.length.toString(),
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: orderRecord.id,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
