"use client"

import useSWR from "swr"
import AuthForm, { AuthGate } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { ExpenseList } from "@/components/expenses/expense-list"
import { PendingApprovals } from "@/components/approvals/pending-approvals"
import { UserManagement } from "@/components/users/user-management"
import { ApprovalSettings } from "@/components/settings/approval-settings"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function HomePage() {
  const { data, mutate } = useSWR("/api/session", fetcher)
  const user = data?.user
  const company = data?.company

  async function logout() {
    await fetch("/api/session", { method: "DELETE" })
    mutate()
  }

  if (!user) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6">
        <div className="w-full">
          <AuthGate onAuthed={() => mutate()} />
          <AuthForm onAuthed={() => mutate()} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pretty">{company?.name} • Expense Management</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {user.name} ({user.role})
          </p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </header>

      {user.role === "ADMIN" && (
        <section className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <UserManagement />
            <ApprovalSettings />
          </div>
          <ExpenseList title="All Company Expenses" />
          <PendingApprovals />
        </section>
      )}

      {user.role === "MANAGER" && (
        <section className="grid gap-6">
          <PendingApprovals />
          <ExpenseList title="Team & My Expenses" />
        </section>
      )}

      {user.role === "EMPLOYEE" && (
        <section className="grid gap-6">
          <ExpenseForm />
          <ExpenseList title="My Expenses" />
        </section>
      )}

      <footer className="py-6">
        <Card>
          <CardContent className="text-center text-sm text-muted-foreground py-4">
            Built for multi-level approvals with conditional rules (percentage, specific approver, hybrid).
          </CardContent>
        </Card>
      </footer>
    </main>
  )
}
