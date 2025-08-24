import { Resend } from "resend"

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set")
    }
    resend = new Resend(apiKey)
  }
  return resend
}

interface SendPurchaseConfirmationProps {
  to: string
  customerName: string
  orderId: string
  contactCount: number
  amount: number
  downloadUrl: string
}

export async function sendPurchaseConfirmation({
  to,
  customerName,
  orderId,
  contactCount,
  amount,
  downloadUrl,
}: SendPurchaseConfirmationProps) {
  try {
    const { data, error } = await getResend().emails.send({
      from: "Queen Street Analytics <orders@queenstreetanalytics.com>",
      to: [to],
      subject: `Your Parliamentary Contact List is Ready - Order #${orderId}`,
      html: generatePurchaseConfirmationHTML({
        customerName,
        orderId,
        contactCount,
        amount,
        downloadUrl,
      }),
      text: generatePurchaseConfirmationText({
        customerName,
        orderId,
        contactCount,
        amount,
        downloadUrl,
      }),
    })

    if (error) {
      console.error("Error sending purchase confirmation email:", error)
      return { success: false, error }
    }

    console.log("Purchase confirmation email sent successfully:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Error sending purchase confirmation email:", error)
    return { success: false, error }
  }
}

function generatePurchaseConfirmationHTML({
  customerName,
  orderId,
  contactCount,
  amount,
  downloadUrl,
}: Omit<SendPurchaseConfirmationProps, "to">) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Parliamentary Contact List is Ready</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 30px 20px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .order-details {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .download-button {
          display: inline-block;
          background: #16a34a;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #1f2937;
          color: #9ca3af;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 8px 8px;
          font-size: 14px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Queen Street Analytics</div>
        <h1>Your Contact List is Ready!</h1>
      </div>
      
      <div class="content">
        <p>Dear ${customerName},</p>
        
        <p>Thank you for your purchase! Your parliamentary contact list has been processed and is now ready for download.</p>
        
        <div class="order-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Contacts:</strong> ${contactCount} parliamentary contacts</p>
          <p><strong>Amount Paid:</strong> $${amount.toFixed(2)} CAD</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
        </div>
        
        <p>Your contact list includes verified email addresses, phone numbers, office locations, and constituency information for all selected parliamentary contacts.</p>
        
        <div style="text-align: center;">
          <a href="${downloadUrl}" class="download-button">Download Your Contact List</a>
        </div>
        
        <p><strong>What's included in your download:</strong></p>
        <ul>
          <li>Complete contact information (email, phone, office address)</li>
          <li>Political party affiliation and constituency details</li>
          <li>Committee memberships and roles</li>
          <li>CSV and Excel formats for easy import</li>
        </ul>
        
        <p>If you have any questions about your purchase or need assistance accessing your download, please don't hesitate to contact our support team.</p>
        
        <p>Best regards,<br>
        The Queen Street Analytics Team</p>
      </div>
      
      <div class="footer">
        <p>Queen Street Analytics - Your trusted source for government affairs intelligence</p>
        <p>If you have questions, reply to this email or visit our support center.</p>
      </div>
    </body>
    </html>
  `
}

function generatePurchaseConfirmationText({
  customerName,
  orderId,
  contactCount,
  amount,
  downloadUrl,
}: Omit<SendPurchaseConfirmationProps, "to">) {
  return `
Queen Street Analytics - Your Contact List is Ready!

Dear ${customerName},

Thank you for your purchase! Your parliamentary contact list has been processed and is now ready for download.

ORDER DETAILS
Order ID: #${orderId}
Contacts: ${contactCount} parliamentary contacts
Amount Paid: $${amount.toFixed(2)} CAD
Date: ${new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

Your contact list includes verified email addresses, phone numbers, office locations, and constituency information for all selected parliamentary contacts.

DOWNLOAD YOUR CONTACT LIST
${downloadUrl}

WHAT'S INCLUDED:
- Complete contact information (email, phone, office address)
- Political party affiliation and constituency details
- Committee memberships and roles
- CSV and Excel formats for easy import

If you have any questions about your purchase or need assistance accessing your download, please don't hesitate to contact our support team.

Best regards,
The Queen Street Analytics Team

---
Queen Street Analytics - Your trusted source for government affairs intelligence
If you have questions, reply to this email or visit our support center.
  `
}

interface SendWelcomeEmailProps {
  to: string
  customerName: string
}

export async function sendWelcomeEmail({ to, customerName }: SendWelcomeEmailProps) {
  try {
    const { data, error } = await getResend().emails.send({
      from: "Queen Street Analytics <welcome@queenstreetanalytics.com>",
      to: [to],
      subject: "Welcome to Queen Street Analytics",
      html: generateWelcomeHTML(customerName),
      text: generateWelcomeText(customerName),
    })

    if (error) {
      console.error("Error sending welcome email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending welcome email:", error)
    return { success: false, error }
  }
}

function generateWelcomeHTML(customerName: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Queen Street Analytics</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 30px 20px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .cta-button {
          display: inline-block;
          background: #16a34a;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #1f2937;
          color: #9ca3af;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 8px 8px;
          font-size: 14px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Queen Street Analytics</div>
        <h1>Welcome to Queen Street Analytics!</h1>
      </div>
      
      <div class="content">
        <p>Dear ${customerName},</p>
        
        <p>Welcome to Queen Street Analytics, your trusted source for government affairs intelligence and parliamentary contact information.</p>
        
        <p>We're excited to help you connect with key decision-makers and stay informed about government activities that matter to your organization.</p>
        
        <p><strong>What you can do with Queen Street Analytics:</strong></p>
        <ul>
          <li>Access comprehensive parliamentary contact lists</li>
          <li>Search and filter contacts by party, province, committee, and role</li>
          <li>Download verified contact information in multiple formats</li>
          <li>Stay updated with our weekly government relations newsletters</li>
        </ul>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="cta-button">Start Exploring Contacts</a>
        </div>
        
        <p>If you have any questions or need assistance, our support team is here to help. Simply reply to this email or visit our support center.</p>
        
        <p>Thank you for choosing Queen Street Analytics!</p>
        
        <p>Best regards,<br>
        The Queen Street Analytics Team</p>
      </div>
      
      <div class="footer">
        <p>Queen Street Analytics - Your trusted source for government affairs intelligence</p>
        <p>If you have questions, reply to this email or visit our support center.</p>
      </div>
    </body>
    </html>
  `
}

function generateWelcomeText(customerName: string) {
  return `
Queen Street Analytics - Welcome!

Dear ${customerName},

Welcome to Queen Street Analytics, your trusted source for government affairs intelligence and parliamentary contact information.

We're excited to help you connect with key decision-makers and stay informed about government activities that matter to your organization.

WHAT YOU CAN DO WITH QUEEN STREET ANALYTICS:
- Access comprehensive parliamentary contact lists
- Search and filter contacts by party, province, committee, and role
- Download verified contact information in multiple formats
- Stay updated with our weekly government relations newsletters

Get started: ${process.env.NEXT_PUBLIC_BASE_URL}

If you have any questions or need assistance, our support team is here to help. Simply reply to this email or visit our support center.

Thank you for choosing Queen Street Analytics!

Best regards,
The Queen Street Analytics Team

---
Queen Street Analytics - Your trusted source for government affairs intelligence
If you have questions, reply to this email or visit our support center.
  `
}
