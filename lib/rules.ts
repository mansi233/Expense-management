import type { Company, Expense, User } from "./types"

/**
 * Build the concrete approver steps for a specific expense based on company config and employee's manager.
 * We return a list of step objects: { id, name, approverUserIds }
 */
export function buildApproverStepsForExpense(company: Company, employee: User): Company["approverSequence"] {
  const steps: Company["approverSequence"] = []
  if (company.isManagerApproverEnabled && employee.managerId) {
    steps.push({ id: "mgr", name: "Manager", approverUserIds: [employee.managerId] })
  }
  // append configured sequence
  for (const s of company.approverSequence) {
    steps.push({ id: s.id, name: s.name, approverUserIds: [...s.approverUserIds] })
  }
  return steps
}

export function evaluateStepApproval({
  expense,
  stepApproverIds,
  company,
}: {
  expense: Expense
  stepApproverIds: string[]
  company: Company
}): { approved: boolean; rejected: boolean } {
  const approvalsForThisStep = expense.approvals.filter((a) => stepApproverIds.includes(a.approverUserId))
  const hasReject = approvalsForThisStep.some((a) => a.decision === "REJECTED")
  if (hasReject) return { approved: false, rejected: true }

  const approvedCount = approvalsForThisStep.filter((a) => a.decision === "APPROVED").length
  const total = stepApproverIds.length

  // Specific approver rule
  const specificApproved =
    company.rules.specificApproverUserId &&
    approvalsForThisStep.some(
      (a) => a.decision === "APPROVED" && a.approverUserId === company.rules.specificApproverUserId,
    )

  // Percentage rule
  const pct = company.rules.percentageRule ?? 100
  const pctApproved = total === 0 ? false : (approvedCount / total) * 100 >= pct

  // Hybrid rule OR (if enabled) or AND (if not)
  let approved = false
  if (company.rules.hybridOr) {
    approved = Boolean(specificApproved || pctApproved)
  } else {
    // If no specific approver provided, AND reduces to pct rule
    approved = specificApproved ? specificApproved && pctApproved : pctApproved
  }

  return { approved, rejected: false }
}
