import { type NextRequest, NextResponse } from "next/server"
import { createExpense, getSession, getUser, listExpensesByCompany, listExpensesByUser } from "@/lib/store"

export async function GET(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const u = getUser(session.userId)
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (u.role === "ADMIN" || u.role === "MANAGER") {
    return NextResponse.json({ expenses: listExpensesByCompany(session.companyId) })
  }
  return NextResponse.json({ expenses: listExpensesByUser(u.id) })
}

export async function POST(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { amount, currency, category, description, date } = body as {
    amount: number
    currency: string
    category: string
    description?: string
    date: string
  }
  if (!amount || !currency || !category || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const exp = createExpense({
    userId: session.userId,
    companyId: session.companyId,
    amount: Number(amount),
    currency,
    category,
    description,
    date,
  })
  return NextResponse.json({ expense: exp })
}
