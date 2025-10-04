import { type NextRequest, NextResponse } from "next/server"
import { getCompany, getSession, getUser, listExpensesByCompany } from "@/lib/store"
import { buildApproverStepsForExpense } from "@/lib/rules"

export async function GET(req: NextRequest) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const me = getUser(session.userId)
  const company = getCompany(session.companyId)
  if (!me || !company) return NextResponse.json({ approvals: [] })

  const all = listExpensesByCompany(company.id)
  const pendingForMe = all.filter((e) => {
    if (e.status === "APPROVED" || e.status === "REJECTED") return false
    const steps = buildApproverStepsForExpense(company, getUser(e.userId)!)
    const stepIndex = Math.max(0, e.currentStepIndex + 1)
    const nextStep = steps[stepIndex]
    if (!nextStep) return false
    return nextStep.approverUserIds.includes(me.id)
  })

  return NextResponse.json({ expenses: pendingForMe })
}
