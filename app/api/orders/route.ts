import { type NextRequest, NextResponse } from "next/server"
import { getOrdersByUserId } from "@/lib/database"

// Force dynamic runtime for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required", success: false }, { status: 400 })
    }

    const orders = await getOrdersByUserId(userId)

    return NextResponse.json({ orders, success: true })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders", success: false }, { status: 500 })
  }
}
