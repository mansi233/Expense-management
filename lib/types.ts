export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE"

export type User = {
  id: string
  email: string
  name: string
  role: Role
  managerId?: string | null // direct manager for employee
  companyId: string
}

export type Company = {
  id: string
  name: string
  country: string
  baseCurrency: string
  // Approval sequence: an ordered list of steps. Each step can include one or more approver userIds.
  approverSequence: { id: string; name: string; approverUserIds: string[] }[]
  // Conditional rules
  rules: {
    percentageRule?: number // 0..100
    specificApproverUserId?: string // e.g., CFO user id
    hybridOr?: boolean // if true: percentage OR specific approver
  }
  // If true, the direct manager must approve first (when employee has a manager)
  isManagerApproverEnabled: boolean
}

export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "IN_REVIEW"

export type Expense = {
  id: string
  userId: string
  companyId: string
  amount: number
  currency: string
  category: string
  description?: string
  date: string // ISO
  status: ExpenseStatus
  // Approval progress
  currentStepIndex: number // -1 before any step
  approvals: {
    stepId: string
    approverUserId: string
    decision: "APPROVED" | "REJECTED"
    comment?: string
    at: string
  }[]
}

export type Session = {
  userId: string
  companyId: string
}

export type SignupPayload = {
  email: string
  name: string
  password: string
  companyName: string
  country: string
  currency: string
}

export type LoginPayload = {
  email: string
  password: string
}
