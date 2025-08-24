import { type NextRequest, NextResponse } from "next/server"
import { parseCSV, filterContacts, exportToCSV } from "@/lib/csv-processor"
import { createGhostPayment, sendPurchaseEmail } from "@/lib/ghost-integration"

// Mock CSV data - replace with actual file reading
const mockCSVData = `name,title,party,province,constituency,email,phone,office,committee,policyAreas
"Hon. Sarah Johnson","Member of Parliament","Liberal","Ontario","Toronto Centre","sarah.johnson@parl.gc.ca","(613) 992-4567","House of Commons","Finance","Healthcare,Economy"
"Hon. Michael Chen","Senator","Conservative","British Columbia","Vancouver","michael.chen@sen.parl.gc.ca","(613) 992-8901","Senate","Defence","Defence,Security"
"Dr. Emily Rodriguez","Member of Parliament","NDP","Quebec","Montreal East","emily.rodriguez@parl.gc.ca","(613) 992-2345","House of Commons","Health","Healthcare,Climate"`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const filters = {
    chamber: searchParams.get("chamber") || undefined,
    province: searchParams.get("province") || undefined,
    party: searchParams.get("party") || undefined,
    role: searchParams.get("role") || undefined,
    committee: searchParams.get("committee") || undefined,
    policyArea: searchParams.get("policyArea") || undefined,
  }

  // Parse CSV data (in production, read from file system or database)
  const allContacts = parseCSV(mockCSVData)
  const filteredContacts = filterContacts(allContacts, filters)

  return NextResponse.json({
    contacts: filteredContacts,
    total: filteredContacts.length,
    preview: filteredContacts.slice(0, 3), // Only show first 3 for preview
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, filters, userEmail } = body

  if (action === "purchase") {
    // Process payment through Ghost
    const allContacts = parseCSV(mockCSVData)
    const filteredContacts = filterContacts(allContacts, filters)

    const purchase = {
      contactListId: `list_${Date.now()}`,
      userEmail,
      filters,
      totalContacts: filteredContacts.length,
      price: 49,
    }

    try {
      const paymentResult = await createGhostPayment(purchase)

      if (paymentResult.success) {
        // Generate CSV and create download link
        const csvContent = exportToCSV(filteredContacts)
        const downloadLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${purchase.contactListId}`

        // Send email with download link
        await sendPurchaseEmail(userEmail, downloadLink)

        return NextResponse.json({
          success: true,
          downloadLink,
          message: "Purchase successful! Check your email for the download link.",
        })
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing failed",
        },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
