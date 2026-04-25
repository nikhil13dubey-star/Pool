# DECISIONS.md — Architectural Decision Records

---

## ADR-001: Balances computed, never stored

**Date:** 2026-04-25
**Decision:** Balances are always computed on-demand from `Expense`, `ExpenseShare`, and `Settlement` tables via `computeBalances(groupId)`.
**Why:** Avoids balance inconsistency bugs when expenses are edited/deleted/restored. Single source of truth.
**Trade-off:** Slightly more DB reads per page load. Acceptable given group sizes (~100 people max) and Neon's low latency in ap-south-1.

## ADR-002: decimal.js for all money arithmetic

**Date:** 2026-04-25
**Decision:** All balance and split calculations use `decimal.js`. JS floats are never used for money.
**Why:** Prevents IEEE 754 rounding bugs (e.g., 100/3 = 33.333... not 33.34).

## ADR-003: Soft-delete everywhere

**Date:** 2026-04-25
**Decision:** `isDeleted` flag on `Group`, `Expense`, `Comment`. No hard deletes in Phase 1.
**Why:** Allows restore, audit trail, and prevents data loss bugs.

## ADR-004: Ghost users are first-class DB rows

**Date:** 2026-04-25
**Decision:** Ghost users (`isGhost=true, email=null`) are real `User` rows that can be added to groups without auth. They get claimed via invite token.
**Why:** Zero-friction member addition — most real-world groups have people who won't sign up immediately.

## ADR-005: Auth.js v5 magic link only

**Date:** 2026-04-25
**Decision:** Only Resend magic link. No social login, no password.
**Why:** Personal app for trusted friends. Passwordless is simpler and has no credential leak risk.
