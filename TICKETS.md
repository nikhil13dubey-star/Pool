# TICKETS.md — Sprint Tracker

> Coordinator updates this file. Status: 🔲 Open | 🔄 In Progress | ✅ Done | ❌ Blocked

---

## Sprint 0 — Foundation

| ID    | Title                                                                      | Owner       | Status                                         |
| ----- | -------------------------------------------------------------------------- | ----------- | ---------------------------------------------- |
| T-001 | Initialize Next.js 15 + TypeScript strict + pnpm                           | DevOps      | ✅ Done                                        |
| T-002 | Tailwind + shadcn/ui setup                                                 | Frontend    | ✅ Done                                        |
| T-003 | Prisma + Neon connection                                                   | Schema      | ✅ Done (schema written; needs DB credentials) |
| T-004 | Auth.js v5 + Resend magic link                                             | Backend     | ✅ Done (needs .env)                           |
| T-005 | Vercel deploy from GitHub main                                             | DevOps      | 🔲 Open (push to GitHub first)                 |
| T-006 | Folder structure scaffold                                                  | Coordinator | ✅ Done                                        |
| T-007 | Husky pre-commit + lint-staged                                             | DevOps      | ✅ Done                                        |
| T-008 | CONTRACTS.md, DECISIONS.md, RUNBOOK.md, TEST_PLAN.md, TICKETS.md skeletons | Coordinator | ✅ Done                                        |
| T-009 | Vitest + Playwright setup                                                  | Test        | ✅ Done                                        |

## Sprint 1 — Users, Groups, Members

| ID    | Title                                                | Owner    | Status                                           |
| ----- | ---------------------------------------------------- | -------- | ------------------------------------------------ |
| T-101 | Full Prisma schema migration                         | Schema   | ✅ Done (schema written; run migrate after .env) |
| T-102 | getCurrentUser() helper + auth middleware            | Backend  | ✅ Done                                          |
| T-103 | API: POST /api/groups                                | Backend  | ✅ Done                                          |
| T-104 | API: POST /api/groups/[id]/members (ghost)           | Backend  | ✅ Done                                          |
| T-105 | API: GET /api/groups and GET /api/groups/[id]        | Backend  | ✅ Done                                          |
| T-106 | UI: Home page listing user's groups                  | Frontend | ✅ Done                                          |
| T-107 | UI: Create group flow                                | Frontend | ✅ Done                                          |
| T-108 | UI: Group detail page (header + tabs)                | Frontend | ✅ Done                                          |
| T-109 | UI: Avatar component                                 | Frontend | ✅ Done                                          |
| T-110 | API: Ghost-claim flow                                | Backend  | ✅ Done                                          |
| T-111 | UI: "Invite this person" share-link UI               | Frontend | 🔲 Open                                          |
| T-112 | UI: Claim landing page                               | Frontend | 🔲 Open                                          |
| T-113 | Tests: API contract tests                            | Test     | 🔲 Open                                          |
| T-114 | Tests: E2E create group → add ghost → invite → claim | Test     | 🔲 Open                                          |

## Sprint 2 — Expenses & Balances

| ID    | Title                                    | Owner    | Status  |
| ----- | ---------------------------------------- | -------- | ------- |
| T-201 | lib/server/balances.ts — computeBalances | Backend  | ✅ Done |
| T-202 | lib/server/splits.ts — splitExpense      | Backend  | ✅ Done |
| T-203 | API: POST /api/expenses                  | Backend  | ✅ Done |
| T-204 | API: PATCH /api/expenses/[id]            | Backend  | ✅ Done |
| T-205 | API: DELETE /api/expenses/[id]           | Backend  | ✅ Done |
| T-206 | API: POST /api/expenses/[id]/restore     | Backend  | ✅ Done |
| T-207 | API: GET /api/groups/[id]/expenses       | Backend  | 🔲 Open |
| T-208 | API: GET /api/groups/[id]/balances       | Backend  | ✅ Done |
| T-209 | API: GET /api/me/balances                | Backend  | ✅ Done |
| T-210 | UI: Add expense form                     | Frontend | ✅ Done |
| T-211 | UI: Edit expense form                    | Frontend | 🔲 Open |
| T-212 | UI: Group balance widget                 | Frontend | ✅ Done |
| T-213 | UI: Expense list (per group)             | Frontend | ✅ Done |
| T-214 | UI: Expense detail / edit page           | Frontend | 🔲 Open |
| T-215 | UI: Recycle bin                          | Frontend | 🔲 Open |
| T-216 | UI: Friends balance summary on home      | Frontend | ✅ Done |
| T-217 | Tests: Unit — computeBalances            | Test     | 🔲 Open |
| T-218 | Tests: Unit — splitExpense               | Test     | 🔲 Open |

## Sprint 3–5

🔲 Pending Sprint 2 completion
