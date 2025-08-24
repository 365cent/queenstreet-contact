import { type NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    const result = await sendWelcomeEmail({
      to: email,
      customerName: name,
    })

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ error: "Failed to send welcome email", details: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in send-welcome-email API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
