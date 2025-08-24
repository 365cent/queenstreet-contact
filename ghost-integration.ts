// Ghost CMS and payment integration
export interface PurchaseRequest {
  contactListId: string
  userEmail: string
  filters: Record<string, any>
  totalContacts: number
  price: number
}

export async function createGhostPayment(purchase: PurchaseRequest) {
  // Integration with Ghost's member system and Stripe
  const response = await fetch("/api/ghost/create-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchase),
  })

  return response.json()
}

export async function sendPurchaseEmail(userEmail: string, downloadLink: string) {
  // Send email with download link after successful payment
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: userEmail,
      subject: "Your Canadian Parliamentary Contact List",
      template: "contact-list-purchase",
      data: {
        downloadLink,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    }),
  })

  return response.json()
}
