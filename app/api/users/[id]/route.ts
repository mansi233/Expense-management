import { type NextRequest, NextResponse } from "next/server"
import { getSession, updateUser } from "@/lib/store"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const patch = await req.json()
  const updated = updateUser(params.id, patch)
  return NextResponse.json({ user: updated })
}
