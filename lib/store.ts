import type { Company, Expense, Session, User } from "./types"

const db = {
  companies: new Map<string, Company>(),
  users: new Map<string, User>(),
  expenses: new Map<string, Expense>(),
  sessions: new Map<string, Session>(), // sessionId -> session
  credentials: new Map<string, { password: string; userId: string }>(), // email -> creds
}

export function uid(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

export function createCompany(name: string, country: string, baseCurrency: string): Company {
  const company: Company = {
    id: uid("cmp_"),
    name,
    country,
    baseCurrency,
    approverSequence: [],
    rules: {},
    isManagerApproverEnabled: true,
  }
  db.companies.set(company.id, company)
  return company
}

export function createUser(params: Omit<User, "id">): User {
  const user: User = { id: uid("usr_"), ...params }
  db.users.set(user.id, user)
  return user
}

export function setCredentials(email: string, password: string, userId: string) {
  db.credentials.set(email.toLowerCase(), { password, userId })
}

export function verifyCredentials(email: string, password: string): string | null {
  const creds = db.credentials.get(email.toLowerCase())
  if (!creds) return null
  return creds.password === password ? creds.userId : null
}

export function createSession(userId: string, companyId: string): string {
  const sid = uid("ses_")
  db.sessions.set(sid, { userId, companyId })
  return sid
}

export function getSession(sessionId?: string | null): Session | null {
  if (!sessionId) return null
  return db.sessions.get(sessionId) ?? null
}

export function deleteSession(sessionId: string) {
  db.sessions.delete(sessionId)
}

export function getCompany(id: string): Company | null {
  return db.companies.get(id) ?? null
}

export function updateCompany(id: string, patch: Partial<Company>): Company | null {
  const current = db.companies.get(id)
  if (!current) return null
  const next = { ...current, ...patch }
  db.companies.set(id, next)
  return next
}

export function getUser(id: string): User | null {
  return db.users.get(id) ?? null
}

export function listUsers(companyId: string): User[] {
  return Array.from(db.users.values()).filter((u) => u.companyId === companyId)
}

export function updateUser(id: string, patch: Partial<User>): User | null {
  const current = db.users.get(id)
  if (!current) return null
  const next = { ...current, ...patch }
  db.users.set(id, next)
  return next
}

export function createExpense(expense: Omit<Expense, "id" | "status" | "currentStepIndex" | "approvals">): Expense {
  const newExpense: Expense = {
    id: uid("exp_"),
    ...expense,
    status: "PENDING",
    currentStepIndex: -1,
    approvals: [],
  }
  db.expenses.set(newExpense.id, newExpense)
  return newExpense
}

export function getExpense(id: string): Expense | null {
  return db.expenses.get(id) ?? null
}

export function updateExpense(id: string, patch: Partial<Expense>): Expense | null {
  const current = db.expenses.get(id)
  if (!current) return null
  const next = { ...current, ...patch }
  db.expenses.set(id, next)
  return next
}

export function listExpensesByUser(userId: string): Expense[] {
  return Array.from(db.expenses.values()).filter((e) => e.userId === userId)
}

export function listExpensesByCompany(companyId: string): Expense[] {
  return Array.from(db.expenses.values()).filter((e) => e.companyId === companyId)
}
