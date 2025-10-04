import { type NextRequest, NextResponse } from "next/server"
import { createCompany, createSession, createUser, setCredentials } from "@/lib/store"
import type { SignupPayload } from "@/lib/types"

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SignupPayload
  if (!body.email || !body.password || !body.companyName || !body.country || !body.currency || !body.name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const company = createCompany(body.companyName, body.country, body.currency)
  const admin = createUser({
    email: body.email.toLowerCase(),
    name: body.name,
    role: "ADMIN",
    companyId: company.id,
    managerId: null,
  })
  setCredentials(body.email, body.password, admin.id)
  const sid = createSession(admin.id, company.id)

  const res = NextResponse.json({ user: admin, company })
  res.cookies.set("session_id", sid, { httpOnly: true, sameSite: "lax", path: "/" })
  return res
}
