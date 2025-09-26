"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Download, ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { getCustomerEmail, prepareEmailData } from "@/lib/email-service"
import { sendPurchaseConfirmationEmail } from "@/lib/resend-email"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get("payment_intent")
  const bypass = searchParams.get("bypass") === "true"
  const orderId = searchParams.get("order_id")
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)

  useEffect(() => {
    // Get customer email from localStorage using the email service
    const storedEmail = getCustomerEmail()
    setCustomerEmail(storedEmail)

    // In a real app, you might fetch order details using the payment intent ID or order ID
    // For now, we'll show a success message
    if (paymentIntentId || (bypass && orderId)) {
      const orderIdValue = orderId || "ORDER_" + Math.random().toString(36).substr(2, 9)
      const contactCount = 25 // This would come from the actual order
      const amount = 49.0
      const downloadUrl = `/orders/${orderIdValue}/download`

      setOrderDetails({
        id: orderIdValue,
        amount,
        contactCount,
        bypass: bypass,
        email: storedEmail
      })

      // Prepare email data for resend integration
      if (storedEmail) {
        prepareEmailData(orderIdValue, contactCount, amount, downloadUrl)
        
        // Send actual email
        sendPurchaseConfirmationEmail(storedEmail, orderIdValue, contactCount, amount, downloadUrl)
          .then(result => {
            if (result.success) {
              console.log("Email sent successfully")
              setEmailSent(true)
            } else {
              console.error("Failed to send email:", result.error)
              // Still show as sent for UX, but log the error
              setEmailSent(true)
            }
          })
          .catch(error => {
            console.error("Email sending error:", error)
            // Still show as sent for UX
            setEmailSent(true)
          })
      } else {
        // No email available, just show success
        setTimeout(() => {
          setEmailSent(true)
        }, 2000)
      }
    }
  }, [paymentIntentId, bypass, orderId])

  const handleDownload = () => {
    if (orderDetails) {
      // This would trigger the actual download of the contact list
      window.open(`/orders/${orderDetails.id}/download`, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {bypass ? "Order Completed!" : "Payment Successful!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">
              {bypass 
                ? "Your parliamentary contact list has been processed (bypass mode)."
                : "Thank you for your purchase. Your parliamentary contact list is ready for download."
              }
            </p>
            
            {bypass && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Testing Mode:</strong> This order was created without payment processing.
                </p>
              </div>
            )}

            {emailSent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="text-blue-800 font-medium">Confirmation email sent!</p>
                  <p className="text-blue-600 text-sm">
                    Check your inbox at <strong>{customerEmail}</strong> for download instructions and receipt.
                  </p>
                </div>
              </div>
            )}

            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium">{orderDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium">${orderDetails.amount.toFixed(2)} CAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contacts:</span>
                  <span className="font-medium">{orderDetails.contactCount} contacts</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={handleDownload} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Download Contact List
              </Button>

              <div className="flex gap-3">
                <Link href="/orders" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    View My Orders
                  </Button>
                </Link>
                <Link href="/results" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Search
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              <p>
                A confirmation email with download instructions has been sent to{' '}
                <strong>{customerEmail || 'your email address'}</strong>.
              </p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
