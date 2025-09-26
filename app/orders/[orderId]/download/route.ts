import { type NextRequest, NextResponse } from "next/server"
import { getOrderById, getContactsByIds } from "@/lib/database"
import { uploadCSVToBlob, generateBlobDownloadUrl, blobExists } from "@/lib/blob-storage"

// Helper function to generate CSV content from contacts
function generateCSVContent(contacts: any[]): string {
  // Define CSV headers based on the new contact schema
  const headers = [
    "Person Type",
    "Full Name", 
    "Title",
    "Email",
    "Telephone",
    "Alternate Phone",
    "Fax",
    "Street Address",
    "City",
    "Postal Code",
    "Country",
    "Profile URL",
    "Photo URL",
    "Website URL",
    // House of Commons specific
    "MP Name",
    "Political Party",
    "Riding",
    "Province",
    "Hill Office Street",
    "Hill Office City",
    "Hill Office Province",
    "Hill Office Postal Code",
    "Hill Office Phone",
    "Hill Office Fax",
    "Constituency Office Name",
    "Constituency Office Street",
    "Constituency Office City",
    "Constituency Office Province",
    "Constituency Office Postal Code",
    "Constituency Office Phone",
    "Constituency Office Fax",
    "Primary Role",
    "Current Roles",
    "Latest Role Start Date",
    "Committees",
    // Senate specific
    "Senator Name",
    "Senator Province",
    "Senator Affiliation",
    "Senator URL",
    "Nomination Date",
    "Retirement Date",
    "LinkedIn URL",
    // Provincial specific
    "Party",
    "Constituency",
    "Constituency Address",
    "Legislative Address",
    "Profile Summary",
    "Education",
    "Work Experience"
  ]

  const csvHeader = headers.join(",") + "\n"
  
  const csvRows = contacts.map(contact => {
    const row = [
      contact.person_type || "",
      contact.full_name || contact.name || "",
      contact.title || "",
      contact.email || "",
      contact.telephone || contact.phone || "",
      contact.alternate_phone || "",
      contact.fax || "",
      contact.street_address || "",
      contact.city || "",
      contact.postal_code || "",
      contact.country || "",
      contact.profile_url || "",
      contact.photo_url || "",
      contact.website_url || "",
      // House of Commons specific
      contact.mp_name || "",
      contact.political_party || "",
      contact.riding || "",
      contact.province || "",
      contact.hill_office_street || "",
      contact.hill_office_city || "",
      contact.hill_office_province || "",
      contact.hill_office_postal_code || "",
      contact.hill_office_phone || "",
      contact.hill_office_fax || "",
      contact.constituency_office_name || "",
      contact.constituency_office_street || "",
      contact.constituency_office_city || "",
      contact.constituency_office_province || "",
      contact.constituency_office_postal_code || "",
      contact.constituency_office_phone || "",
      contact.constituency_office_fax || "",
      contact.primary_role || "",
      contact.current_roles || "",
      contact.latest_role_start_date || "",
      contact.committees || "",
      // Senate specific
      contact.senator_name || "",
      contact.senator_province || "",
      contact.senator_affiliation || "",
      contact.senator_url || "",
      contact.nomination_date || "",
      contact.retirement_date || "",
      contact.linkedin_url || "",
      // Provincial specific
      contact.party || "",
      contact.constituency || "",
      contact.constituency_address || "",
      contact.legislative_address || "",
      contact.profile_summary || "",
      contact.education || "",
      contact.work_experience || ""
    ]
    
    // Escape quotes and wrap in quotes
    return row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")
  }).join("\n")

  return csvHeader + csvRows
}

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const orderId = Number.parseInt(params.orderId)

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Get order details
    const order = await getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found or not completed" }, { status: 404 })
    }

    // Get contacts for this order
    const contacts = await getContactsByIds((order as any).contact_ids)
    
    console.log("Order contact_ids:", (order as any).contact_ids)
    console.log("Retrieved contacts count:", contacts?.length || 0)
    console.log("First contact sample:", contacts?.[0])

    if (!contacts || contacts.length === 0) {
      console.error("No contacts found for order", orderId)
      return NextResponse.json({ error: "No contacts found for this order" }, { status: 404 })
    }

    // Generate CSV content
    const csvContent = generateCSVContent(contacts as any[])
    const contactCount = (contacts as any[]).length
    
    console.log("Generated CSV content length:", csvContent.length)
    console.log("CSV preview (first 200 chars):", csvContent.substring(0, 200))

    // Check if we should use Blob Storage (for new orders) or direct download (for legacy)
    const useBlobStorage = process.env.USE_BLOB_STORAGE === "true" || (order as any).created_at > new Date("2024-01-01")

    if (useBlobStorage) {
      // Upload to Blob Storage and redirect to the permanent URL
      const uploadResult = await uploadCSVToBlob(csvContent, orderId.toString(), contactCount)
      
      if (uploadResult.success && uploadResult.blobUrl) {
        // Redirect to the Blob Storage URL
        return NextResponse.redirect(uploadResult.blobUrl)
      } else {
        console.error("Failed to upload to Blob Storage:", uploadResult.error)
        // Fall back to direct download
      }
    }

    // Direct download fallback
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="parliamentary-contacts-order-${orderId}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error generating download:", error)
    return NextResponse.json({ error: "Failed to generate download" }, { status: 500 })
  }
}
