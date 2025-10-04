import { type NextRequest, NextResponse } from "next/server"
import { createSession, getUser, verifyCredentials } from "@/lib/store"
import type { LoginPayload } from "@/lib/types"

export async function POST(req: NextRequest) {
  const body = (await req.json()) as LoginPayload
  const userId = verifyCredentials(body.email, body.password)
  if (!userId) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const user = getUser(userId)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const sid = createSession(user.id, user.companyId)
  const res = NextResponse.json({ user })
  res.cookies.set("session_id", sid, { httpOnly: true, sameSite: "lax", path: "/" })
  return res
}
