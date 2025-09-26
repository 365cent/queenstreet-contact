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
  const [bypassMode, setBypassMode] = useState(false)
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)

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

        if (!response.ok || data.error) {
          setError(data.error || `Failed to create payment intent: ${response.status}`)
        } else {
          setClientSecret(data.clientSecret)
        }
      } catch (err) {
        console.error("Payment initialization error:", err)
        setError("Failed to initialize payment")
      }
    }

    if (contactIds.length > 0 && userId) {
      createPaymentIntent()
    }
  }, [contactIds, userId])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleBypass = async () => {
    setLoading(true)
    setError(null)
    setEmailError(null)

    // Validate email
    if (!email.trim()) {
      setEmailError("Email address is required")
      setLoading(false)
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      setLoading(false)
      return
    }

    // Store email in localStorage for email integration
    localStorage.setItem('customerEmail', email.trim())

    try {
      // Create a mock order without payment
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactIds,
          userId,
          amount: 4900,
          bypass: true, // Add bypass flag
        }),
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        setError(data.error || "Failed to create bypass order")
        setLoading(false)
      } else {
        // Redirect to success page with bypass flag
        router.push(`/checkout/success?bypass=true&order_id=${data.orderId}`)
      }
    } catch (err) {
      console.error("Bypass error:", err)
      setError("Failed to process bypass order")
      setLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (bypassMode) {
      await handleBypass()
      return
    }

    // Validate email for regular payment too
    if (!email.trim()) {
      setEmailError("Email address is required")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    // Store email in localStorage for email integration
    localStorage.setItem('customerEmail', email.trim())

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)
    setError(null)
    setEmailError(null)

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
          email: email.trim(),
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
            {/* Bypass Toggle for Testing */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Testing Mode</h4>
                  <p className="text-xs text-yellow-700">Toggle to bypass payment for testing</p>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={bypassMode}
                    onChange={(e) => setBypassMode(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-yellow-800">Bypass Payment</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError(null)
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  required
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  We'll send your download link and receipt to this email address
                </p>
              </div>

              {!bypassMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
                  <div className="border border-gray-300 rounded-md p-3 bg-white">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>
              )}

              {bypassMode && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Bypass Mode:</strong> Payment will be skipped and order will be created directly.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {!bypassMode && (
                <div className="flex items-center text-sm text-gray-600">
                  <Lock className="w-4 h-4 mr-2" />
                  Your payment information is secure and encrypted
                </div>
              )}

              <Button
                type="submit"
                disabled={(!bypassMode && (!stripe || !clientSecret)) || loading}
                className={`w-full py-3 ${
                  bypassMode 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loading 
                  ? "Processing..." 
                  : bypassMode 
                    ? "Bypass Payment & Complete Order" 
                    : "Complete Purchase - $49.00"
                }
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
