# 💰 ExpenSmart – Full-Stack Expense Management System  

ExpenSmart is a **full-stack expense management app** built with **Next.js (App Router)**.  
It simplifies employee expense submission and enables managers/admins to approve with **multi-level workflows** and **conditional rules**.  

This project is designed for **hackathons and demos** — using an **in-memory store** (no external DB) and **mock authentication** with cookies.  

---

## 🎯 Purpose  

Companies often struggle with manual, error-prone reimbursement processes.  
ExpenSmart provides:  
- ✅ Multi-level approvals (Manager → Finance → Director)  
- ✅ Conditional approval rules (e.g., 60% approvers OR CFO auto-approval)  
- ✅ Role-based UI for Employees, Managers, and Admins  
- ✅ Mock authentication with cookies for quick demo  
- ✅ In-memory store to avoid DB setup  

---

## 🛠️ Tech Stack  

- **Framework:** Next.js (App Router)  
- **UI Library:** [shadcn/ui](https://ui.shadcn.com/)  
- **Styling:** Tailwind CSS with semantic tokens  
- **State & Data Fetching:** SWR (stale-while-revalidate)  
- **Storage:** In-memory store (demo mode)  
- **Authentication:** Mock auth with cookies  

---

## 👤 Roles & Features  

### 🧑 Employee  
- Submit expenses (Amount, Date, Category, Description)  
- View their expense history & statuses (Pending, Approved, Rejected)  

### 👨‍💼 Manager  
- Dashboard to view pending approvals  
- Approve/Reject with comments  
- Escalate based on rules  

### 🛠️ Admin  
- Configure multi-level approval rules  
- Set conditional rules (percentage approvals, mandatory approvers)  
- Manage company setup and role assignments  
- View all expenses and override approvals  

---

## 🔄 Workflow  

1. **Employee** submits an expense claim.  
2. Expense flows to **Manager → Finance → Director** as configured.  
3. **Conditional rules** (e.g., “60% approvers OR CFO approves”) may auto-approve.  
4. Each approver sees pending requests in their dashboard.  
5. **Admin** monitors all company expenses and rules.
