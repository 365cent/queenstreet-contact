import { type NextRequest, NextResponse } from "next/server"
import { getContacts } from "@/lib/database"

// Force dynamic runtime for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      search: searchParams.get("search") || undefined,
      categories: searchParams.getAll("category"),
      party: searchParams.getAll("party"),
      province: searchParams.getAll("province"),
      role: searchParams.getAll("role"),
      committee: searchParams.getAll("committee"),
      issue: searchParams.getAll("issue"),
      linkedin: searchParams.getAll("linkedin"),
      topline: searchParams.get("topline") || undefined,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined,
      offset: searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined,
      includeDirector: searchParams.get("includeDirector") === "true",
    }

    const contacts = await getContacts(filters)

    return NextResponse.json({ contacts, success: true })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts", success: false }, { status: 500 })
  }
}
