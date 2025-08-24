import { type NextRequest, NextResponse } from "next/server"
import { getContacts } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get("search") || undefined,
      party: searchParams.get("party") || undefined,
      province: searchParams.get("province") || undefined,
      category: searchParams.get("category") || undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined,
    }

    const contacts = await getContacts(filters)

    return NextResponse.json({ contacts, success: true })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts", success: false }, { status: 500 })
  }
}
