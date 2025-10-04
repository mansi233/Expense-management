"use client"

import useSWR, { mutate } from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ApprovalSettings() {
  const { data: companyData } = useSWR("/api/company", fetcher)
  const { data: usersData } = useSWR("/api/users", fetcher)
  const company = companyData?.company
  const users = usersData?.users || []

  async function save(patch: any) {
    const res = await fetch("/api/company", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (!res.ok) alert("Failed to save")
    mutate("/api/company")
  }

  function addStep() {
    const id = `stp_${Math.random().toString(36).slice(2, 6)}`
    const next = [
      ...(company?.approverSequence || []),
      { id, name: `Step ${company?.approverSequence?.length + 1 || 1}`, approverUserIds: [] },
    ]
    save({ approverSequence: next })
  }

  function updateStep(idx: number, patch: any) {
    const next = company.approverSequence.map((s: any, i: number) => (i === idx ? { ...s, ...patch } : s))
    save({ approverSequence: next })
  }

  function removeStep(idx: number) {
    const next = company.approverSequence.filter((_: any, i: number) => i !== idx)
    save({ approverSequence: next })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">Approval Workflow & Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="grid gap-1">
            <Label htmlFor="mgr-appr">Require Manager as first approver</Label>
            <p className="text-sm text-muted-foreground">If the employee has a manager, they must approve first.</p>
          </div>
          <Switch
            id="mgr-appr"
            checked={!!company?.isManagerApproverEnabled}
            onCheckedChange={(v) => save({ isManagerApproverEnabled: v })}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Approver Steps</h3>
            <Button onClick={addStep}>Add Step</Button>
          </div>

          <div className="grid gap-3">
            {company?.approverSequence?.map((s: any, idx: number) => (
              <div key={s.id} className="rounded-lg border p-3 space-y-2">
                <div className="grid md:grid-cols-3 gap-2">
                  <div className="grid gap-1">
                    <Label>Name</Label>
                    <Input value={s.name} onChange={(e) => updateStep(idx, { name: e.target.value })} />
                  </div>
                  <div className="grid gap-1 md:col-span-2">
                    <Label>Approvers (users)</Label>
                    <div className="flex flex-wrap gap-2">
                      {s.approverUserIds.map((id: string) => {
                        const user = users.find((u: any) => u.id === id)
                        return (
                          <span key={id} className="text-sm px-2 py-1 rounded-md bg-accent text-accent-foreground">
                            {user?.name || id}
                          </span>
                        )
                      })}
                    </div>
                    <Select
                      onValueChange={(v) =>
                        updateStep(idx, { approverUserIds: Array.from(new Set([...(s.approverUserIds || []), v])) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add approver" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u: any) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} ({u.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button variant="destructive" onClick={() => removeStep(idx)}>
                    Remove Step
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Conditional Rules</h3>
          <div className="grid md:grid-cols-3 gap-2">
            <div className="grid gap-1">
              <Label>Percentage required</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={company?.rules?.percentageRule ?? 100}
                onChange={(e) => save({ rules: { ...company.rules, percentageRule: Number(e.target.value) } })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Specific approver (auto-approves)</Label>
              <Select
                value={company?.rules?.specificApproverUserId || "none"}
                onValueChange={(v) =>
                  save({ rules: { ...company.rules, specificApproverUserId: v === "none" ? null : v } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Hybrid mode</Label>
              <Select
                value={company?.rules?.hybridOr ? "OR" : "AND"}
                onValueChange={(v) => save({ rules: { ...company.rules, hybridOr: v === "OR" } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OR">Approve if Percentage OR Specific approver</SelectItem>
                  <SelectItem value="AND">Require Percentage AND Specific approver</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
