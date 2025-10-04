import { type NextRequest, NextResponse } from "next/server"
import { deleteSession, getSession, getUser, getCompany } from "@/lib/store"

export async function GET(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ session: null })
  const user = getUser(session.userId)
  const company = getCompany(session.companyId)
  return NextResponse.json({ session, user, company })
}

export async function DELETE(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  if (sid) deleteSession(sid)
  const res = NextResponse.json({ ok: true })
  res.cookies.delete("session_id")
  return res
}
