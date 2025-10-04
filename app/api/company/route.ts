import { type NextRequest, NextResponse } from "next/server"
import { getCompany, getSession, updateCompany } from "@/lib/store"

export async function GET(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const company = getCompany(session.companyId)
  return NextResponse.json({ company })
}

export async function PATCH(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const patch = await req.json()
  const updated = updateCompany(session.companyId, patch)
  return NextResponse.json({ company: updated })
}
