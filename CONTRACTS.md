# CONTRACTS.md — API Request / Response Shapes

> This file is the single source of truth for all API contracts between Backend and Frontend agents.
> Update before coding starts on any new endpoint.

---

## Groups

### `POST /api/groups`

**Request:** `{ name: string, type: "TRIP"|"HOME"|"COUPLE"|"OTHER", defaultCurrency?: string }`
**Response 201:** `Group`

### `GET /api/groups`

**Response 200:** `Group[]` (for current user's groups)

### `GET /api/groups/[id]`

**Response 200:** `Group & { members: (GroupMember & { user: User })[] }`

### `PATCH /api/groups/[id]`

**Request:** `{ name?: string, simplifyDebts?: boolean }`
**Response 200:** `Group`

### `DELETE /api/groups/[id]`

**Response 200:** `{ ok: true }`

### `POST /api/groups/[id]/members`

**Request:** `{ name: string }` (creates ghost user)
**Response 201:** `GroupMember & { user: User }`

### `GET /api/groups/[id]/balances`

**Response 200:** `UserBalance[]`

```ts
interface UserBalance {
  userId: string;
  net: number; // positive = owed to user, negative = user owes
  owes: Record<string, number>; // userId -> amount this user owes them
  isOwed: Record<string, number>; // userId -> amount they owe this user
}
```

---

## Expenses

### `POST /api/expenses`

**Request:**

```ts
{
  groupId: string;
  description: string;
  amount: number;
  currency?: string;
  paidById: string;
  category: string;
  notes?: string;
  expenseDate: string; // YYYY-MM-DD
  splitMethod: "EQUAL" | "EXACT";
  participants: string[];   // userIds
  exactAmounts?: Record<string, number>; // userId -> amount (EXACT only)
}
```

**Response 201:** `Expense`

### `PATCH /api/expenses/[id]`

**Request:** Same as POST but all fields optional
**Response 200:** `Expense`

### `DELETE /api/expenses/[id]`

**Response 200:** `{ ok: true }` (soft delete)

### `POST /api/expenses/[id]/restore`

**Response 200:** `Expense`

---

## Settlements

### `POST /api/settlements`

**Request:**

```ts
{
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency?: string;
  method: "CASH" | "UPI" | "OTHER";
  note?: string;
  settledAt?: string; // ISO datetime
}
```

**Response 201:** `Settlement`

---

## Invites

### `POST /api/invites`

**Request:** `{ groupId: string, ghostUserId?: string }`
**Response 201:** `{ token: string, url: string, expiresAt: string }`

### `GET /api/invites/[token]`

**Response 200:** `{ groupId, groupName, groupType, ghostName?, expiresAt }`

### `POST /api/invites/[token]`

**Request:** `{}` (requires auth session)
**Response 200:** `{ groupId: string }`

---

## Notifications

### `GET /api/notifications`

**Response 200:** `Notification[]`

### `PATCH /api/notifications/[id]`

**Response 200:** `{ ok: true }`

---

## Me

### `GET /api/me/balances`

**Response 200:** `Record<userId, { owed: number, owes: number }>`
