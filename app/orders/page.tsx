"use client"

import { Package, Calendar, CreditCard, Download, Eye, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Order {
  id: number
  contact_ids: number[]
  total_amount: number
  currency: string
  status: string
  created_at: string
  contact_names: string[]
  contact_emails: string[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      // For demo purposes, using a mock user ID
      // In a real app, this would come from authentication
      const mockUserId = "user_123"

      const response = await fetch(`/api/orders?userId=${mockUserId}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders)
      } else {
        console.error("Error loading orders:", data.error)
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = (orderId: number) => {
    // This would trigger the download of the purchased contact list
    alert(`Downloading contact list for order #${orderId}`)
  }

  const handleViewDetails = (orderId: number) => {
    // This would show detailed order information
    alert(`Viewing details for order #${orderId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">View and manage your contact list purchases</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any contact lists yet. Start by searching for contacts.
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">Start Searching</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(order.created_at)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />${order.total_amount.toFixed(2)} {order.currency}
                        </div>
                        <div>{order.contact_ids.length} contacts purchased</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contacts Preview</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {order.contact_names.slice(0, 3).map((name, index) => (
                          <div key={index}>{name}</div>
                        ))}
                        {order.contact_names.length > 3 && (
                          <div className="text-gray-500">+{order.contact_names.length - 3} more contacts</div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order.id)}
                        className="flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      {order.status === "completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleDownload(order.id)}
                          className="bg-green-600 hover:bg-green-700 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
