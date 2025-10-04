import { type NextRequest, NextResponse } from "next/server"
import { createUser, getSession, listUsers } from "@/lib/store"
import type { Role } from "@/lib/types"

export async function GET(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ users: listUsers(session.companyId) })
}

export async function POST(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { email, name, role, managerId } = body as { email: string; name: string; role: Role; managerId?: string }
  if (!email || !name || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const user = createUser({
    email: email.toLowerCase(),
    name,
    role,
    managerId: managerId || null,
    companyId: session.companyId,
  })
  return NextResponse.json({ user })
}
