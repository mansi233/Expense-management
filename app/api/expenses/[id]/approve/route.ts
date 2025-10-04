import { type NextRequest, NextResponse } from "next/server"
import { getCompany, getExpense, getSession, getUser, updateExpense } from "@/lib/store"
import { buildApproverStepsForExpense, evaluateStepApproval } from "@/lib/rules"

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
  if (!currentStep) return NextResponse.json({ error: "No pending step" }, { status: 400 })
  if (!currentStep.approverUserIds.includes(me.id)) {
    return NextResponse.json({ error: "Not authorized for this step" }, { status: 403 })
  }

  const approvals = [
    ...expense.approvals,
    {
      stepId: currentStep.id,
      approverUserId: me.id,
      decision: "APPROVED" as const,
      comment,
      at: new Date().toISOString(),
    },
  ]
  let next = updateExpense(expense.id, { approvals, status: "IN_REVIEW" })

  const { approved, rejected } = evaluateStepApproval({
    expense: next!,
    stepApproverIds: currentStep.approverUserIds,
    company,
  })

  if (rejected) {
    next = updateExpense(expense.id, { status: "REJECTED" })
  } else if (approved) {
    const nextIndex = stepIndex + 1
    if (nextIndex >= steps.length) {
      next = updateExpense(expense.id, { currentStepIndex: stepIndex, status: "APPROVED" })
    } else {
      next = updateExpense(expense.id, { currentStepIndex: stepIndex, status: "PENDING" })
    }
  }

  return NextResponse.json({ expense: next })
}
