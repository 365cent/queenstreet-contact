"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Lock, Users } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  contactIds: number[]
  userId: string
}

function CheckoutForm({ contactIds, userId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contactIds,
            userId,
            amount: 4900, // $49.00 in cents
          }),
        })

        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setClientSecret(data.clientSecret)
        }
      } catch (err) {
        setError("Failed to initialize payment")
      }
    }

    if (contactIds.length > 0 && userId) {
      createPaymentIntent()
    }
  }, [contactIds, userId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError("Card element not found")
      setLoading(false)
      return
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: "Customer", // In a real app, get this from user input
        },
      },
    })

    if (stripeError) {
      setError(stripeError.message || "Payment failed")
      setLoading(false)
    } else if (paymentIntent?.status === "succeeded") {
      // Payment successful, redirect to success page
      router.push(`/checkout/success?payment_intent=${paymentIntent.id}`)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
    },
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/results" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Results
      </Link>

      <div className="space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Parliamentary Contact List</span>
                <span>{contactIds.length} contacts</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-3">
                <span>Total</span>
                <span>$49.00 CAD</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                <div className="border border-gray-300 rounded-md p-3 bg-white">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Lock className="w-4 h-4 mr-2" />
                Your payment information is secure and encrypted
              </div>

              <Button
                type="submit"
                disabled={!stripe || loading || !clientSecret}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                {loading ? "Processing..." : "Complete Purchase - $49.00"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const contactIds = searchParams.get("contacts")?.split(",").map(Number) || []
  const userId = "user_123" // In a real app, get from authentication

  if (contactIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No contacts selected</h2>
            <p className="text-gray-600 mb-4">Please select contacts to purchase.</p>
            <Link href="/results">
              <Button>Browse Contacts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Elements stripe={stripePromise}>
        <CheckoutForm contactIds={contactIds} userId={userId} />
      </Elements>
    </div>
  )
}
