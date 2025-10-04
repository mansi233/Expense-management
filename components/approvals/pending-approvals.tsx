"use client"

import useSWR, { mutate } from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function PendingApprovals() {
  const { data } = useSWR("/api/approvals/pending", fetcher, { refreshInterval: 3000 })
  const [comments, setComments] = useState<Record<string, string>>({})
  const expenses = data?.expenses || []

  async function act(id: string, path: "approve" | "reject") {
    const res = await fetch(`/api/expenses/${id}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: comments[id] || "" }),
    })
    if (!res.ok) alert("Action failed")
    mutate("/api/approvals/pending")
    mutate("/api/expenses")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {expenses.map((e: any) => (
          <div key={e.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">
                  {e.category} • {e.amount} {e.currency}
                </div>
                <div className="text-muted-foreground">{e.description || "No description"}</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-2">
              <Input
                placeholder="Comment (optional)"
                value={comments[e.id] || ""}
                onChange={(ev) => setComments({ ...comments, [e.id]: ev.target.value })}
              />
              <Button onClick={() => act(e.id, "approve")}>Approve</Button>
              <Button variant="destructive" onClick={() => act(e.id, "reject")}>
                Reject
              </Button>
            </div>
          </div>
        ))}
        {expenses.length === 0 && <p className="text-sm text-muted-foreground">No approvals pending.</p>}
      </CardContent>
    </Card>
  )
}
