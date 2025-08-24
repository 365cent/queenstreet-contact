import { type NextRequest, NextResponse } from "next/server"
import { getOrderById, getContactsByIds } from "@/lib/database"

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
    const contacts = await getContactsByIds(order.contact_ids)

    // Generate CSV content
    const csvHeader = "Name,Title,Department,Email,Phone,Office Location,Constituency,Party,Province,Category\n"
    const csvRows = contacts
      .map(
        (contact) =>
          `"${contact.name}","${contact.title}","${contact.department}","${contact.email}","${contact.phone}","${contact.office_location}","${contact.constituency}","${contact.party}","${contact.province}","${contact.category}"`,
      )
      .join("\n")

    const csvContent = csvHeader + csvRows

    // Return CSV file
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
