// Email sending service using Resend
// This is a placeholder implementation - replace with actual Resend integration

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

import { Resend } from "resend"

let resendInstance: Resend | null = null

function getResendInstance() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export async function sendPurchaseConfirmationEmail(
  email: string,
  orderId: string,
  contactCount: number,
  amount: number,
  downloadUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendInstance()
    const subject = `Your Parliamentary Contact List - Order ${orderId}`
    const html = generateEmailHTML(orderId, contactCount, amount, downloadUrl)
    const text = generateEmailText(orderId, contactCount, amount, downloadUrl)

    const { error } = await resend.emails.send({
      from: 'Queen Street Analytics <orders@queenstreetanalytics.com>',
      to: [email],
      subject,
      html,
      text,
    })

    if (error) {
      console.error("Failed to send email via Resend:", error)
      return { success: false, error: typeof error === "string" ? error : JSON.stringify(error) }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

function generateEmailHTML(
  orderId: string,
  contactCount: number,
  amount: number,
  downloadUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Parliamentary Contact List</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Thank You for Your Purchase!</h1>
        
        <p>Your parliamentary contact list is ready for download.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Contacts:</strong> ${contactCount} contacts</p>
          <p><strong>Amount:</strong> $${amount.toFixed(2)} CAD</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${downloadUrl}" 
             style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Download Contact List
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    </body>
    </html>
  `
}

function generateEmailText(
  orderId: string,
  contactCount: number,
  amount: number,
  downloadUrl: string
): string {
  return `
Thank You for Your Purchase!

Your parliamentary contact list is ready for download.

Order Details:
- Order ID: ${orderId}
- Contacts: ${contactCount} contacts
- Amount: $${amount.toFixed(2)} CAD

Download your contact list: ${downloadUrl}

If you have any questions, please contact our support team.
  `
}
