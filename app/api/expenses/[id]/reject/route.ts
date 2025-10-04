import { type NextRequest, NextResponse } from "next/server"
import { getCompany, getExpense, getSession, getUser, updateExpense } from "@/lib/store"
import { buildApproverStepsForExpense } from "@/lib/rules"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sid = req.cookies.get("session_id")?.value
  const session = getSession(sid)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const me = getUser(session.userId)
  const company = getCompany(session.companyId)
  const expense = getExpense(params.id)
  if (!me || !company || !expense) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { comment } = await req.json()

  const steps = buildApproverStepsForExpense(company, getUser(expense.userId)!)
  const stepIndex = Math.max(0, expense.currentStepIndex + 1)
  const currentStep = steps[stepIndex]
  if (!currentStep || !currentStep.approverUserIds.includes(me.id)) {
    return NextResponse.json({ error: "Not authorized for this step" }, { status: 403 })
  }

  const approvals = [
    ...expense.approvals,
    {
      stepId: currentStep.id,
      approverUserId: me.id,
      decision: "REJECTED" as const,
      comment,
      at: new Date().toISOString(),
    },
  ]
  const next = updateExpense(expense.id, { approvals, status: "REJECTED" })
  return NextResponse.json({ expense: next })
}
