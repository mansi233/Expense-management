"use client"

import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ExpenseList({ title = "Expenses" }: { title?: string }) {
  const { data } = useSWR("/api/expenses", fetcher, { refreshInterval: 3000 })
  const expenses = data?.expenses || []
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {expenses.map((e: any) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
            <div className="text-sm">
              <div className="font-medium">
                {e.category} • {e.amount} {e.currency}
              </div>
              <div className="text-muted-foreground">
                {e.description || "No description"} • {new Date(e.date).toLocaleDateString()}
              </div>
            </div>
            <Badge
              variant={e.status === "APPROVED" ? "default" : e.status === "REJECTED" ? "destructive" : "secondary"}
            >
              {e.status}
            </Badge>
          </div>
        ))}
        {expenses.length === 0 && <p className="text-sm text-muted-foreground">No expenses found.</p>}
      </CardContent>
    </Card>
  )
}
