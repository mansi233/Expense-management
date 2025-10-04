"use client"

import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useState } from "react"
import type { Role } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function UserManagement() {
  const { data: usersData } = useSWR("/api/users", fetcher)
  const users = usersData?.users || []
  const [form, setForm] = useState({ email: "", name: "", role: "EMPLOYEE" as Role, managerId: "" })

  async function create() {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) return alert("Failed to create user")
    mutate("/api/users")
  }

  async function setManager(userId: string, managerId: string) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerId }),
    })
    if (!res.ok) alert("Failed to set manager")
    mutate("/api/users")
  }

  async function setRole(userId: string, role: Role) {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) alert("Failed to set role")
    mutate("/api/users")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">User Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-4 gap-2">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v: Role) => setForm({ ...form, role: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={create}>Create</Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">All Users</h3>
          <div className="grid gap-2">
            {users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="text-sm">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-muted-foreground">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={u.role} onValueChange={(v: any) => setRole(u.id, v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={u.managerId || "none"}
                    onValueChange={(v) => setManager(u.id, v === "none" ? null : v)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {users
                        .filter((x: any) => x.role === "MANAGER")
                        .map((m: any) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
