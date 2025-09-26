import { NextResponse } from "next/server"

import { getFilterOptions } from "@/lib/filters"

// Force dynamic runtime for this route
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const topline = url.searchParams.get("topline") ?? "house"

    const filters = await getFilterOptions(topline)

    return NextResponse.json({ success: true, filters })
  } catch (error) {
    console.error("Failed to load filter options:", error)

    const errorMessage = error instanceof Error ? error.message : "Database connection failed"

    // Check if it's a database connection issue
    if (errorMessage.includes('Database connection failed') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('placeholder password')) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: "Please update your .env.local file with the correct Azure database credentials. Run: node scripts/test-connection.js to test the connection."
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: "Please check your database configuration and ensure the materialized views exist"
    }, { status: 500 })
  }
}

