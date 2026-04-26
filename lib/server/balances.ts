import { prisma } from "./db";
import Decimal from "decimal.js";

interface RawExpense {
  paidById: string;
  shares: { userId: string; amountOwed: { toString(): string } }[];
}
interface RawSettlement {
  fromUserId: string;
  toUserId: string;
  amount: { toString(): string };
}

// Compute balances from already-fetched data — no extra DB queries.
export function computeBalancesFromData(
  expenses: RawExpense[],
  settlements: RawSettlement[],
): UserBalance[] {
  const owedMap: Record<string, Record<string, Decimal>> = {};

  function ensureEntry(from: string, to: string) {
    if (!owedMap[from]) owedMap[from] = {};
    if (!owedMap[from][to]) owedMap[from][to] = new Decimal(0);
    if (!owedMap[to]) owedMap[to] = {};
    if (!owedMap[to][from]) owedMap[to][from] = new Decimal(0);
  }

  for (const expense of expenses) {
    for (const share of expense.shares) {
      if (share.userId === expense.paidById) continue;
      ensureEntry(share.userId, expense.paidById);
      owedMap[share.userId][expense.paidById] = owedMap[share.userId][
        expense.paidById
      ].plus(new Decimal(share.amountOwed.toString()));
    }
  }

  for (const s of settlements) {
    ensureEntry(s.fromUserId, s.toUserId);
    owedMap[s.fromUserId][s.toUserId] = owedMap[s.fromUserId][s.toUserId].minus(
      new Decimal(s.amount.toString()),
    );
    if (owedMap[s.fromUserId][s.toUserId].isNegative()) {
      const excess = owedMap[s.fromUserId][s.toUserId].negated();
      owedMap[s.fromUserId][s.toUserId] = new Decimal(0);
      owedMap[s.toUserId][s.fromUserId] = owedMap[s.toUserId][s.fromUserId].plus(excess);
    }
  }

  const userIds = new Set<string>();
  for (const expense of expenses) {
    userIds.add(expense.paidById);
    for (const share of expense.shares) userIds.add(share.userId);
  }
  for (const s of settlements) {
    userIds.add(s.fromUserId);
    userIds.add(s.toUserId);
  }

  const result: UserBalance[] = [];
  for (const userId of userIds) {
    const owes: Record<string, number> = {};
    const isOwed: Record<string, number> = {};
    let net = new Decimal(0);

    for (const otherId of userIds) {
      if (otherId === userId) continue;
      const iOweOther = owedMap[userId]?.[otherId] ?? new Decimal(0);
      const otherOwesMe = owedMap[otherId]?.[userId] ?? new Decimal(0);
      const netOwed = iOweOther.minus(otherOwesMe);
      if (netOwed.greaterThan(0)) {
        owes[otherId] = netOwed.toDecimalPlaces(2).toNumber();
        net = net.minus(netOwed);
      } else if (netOwed.lessThan(0)) {
        isOwed[otherId] = netOwed.negated().toDecimalPlaces(2).toNumber();
        net = net.plus(netOwed.negated());
      }
    }

    result.push({ userId, net: net.toDecimalPlaces(2).toNumber(), owes, isOwed });
  }

  return result;
}

export interface UserBalance {
  userId: string;
  net: number; // positive = owed to this user, negative = this user owes
  owes: Record<string, number>; // userId -> amount this user owes them
  isOwed: Record<string, number>; // userId -> amount they owe this user
}

export async function computeBalances(groupId: string): Promise<UserBalance[]> {
  const [expenses, settlements] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId, isDeleted: false },
      include: { shares: true },
    }),
    prisma.settlement.findMany({ where: { groupId } }),
  ]);

  // Map: userId -> userId -> amount owed (from -> to)
  const owedMap: Record<string, Record<string, Decimal>> = {};

  function ensureEntry(from: string, to: string) {
    if (!owedMap[from]) owedMap[from] = {};
    if (!owedMap[from][to]) owedMap[from][to] = new Decimal(0);
    if (!owedMap[to]) owedMap[to] = {};
    if (!owedMap[to][from]) owedMap[to][from] = new Decimal(0);
  }

  // Accumulate expense shares
  for (const expense of expenses) {
    for (const share of expense.shares) {
      if (share.userId === expense.paidById) continue;
      ensureEntry(share.userId, expense.paidById);
      owedMap[share.userId][expense.paidById] = owedMap[share.userId][
        expense.paidById
      ].plus(new Decimal(share.amountOwed.toString()));
    }
  }

  // Subtract settlements
  for (const s of settlements) {
    ensureEntry(s.fromUserId, s.toUserId);
    owedMap[s.fromUserId][s.toUserId] = owedMap[s.fromUserId][s.toUserId].minus(
      new Decimal(s.amount.toString()),
    );

    // If negative after settlement, reverse direction
    if (owedMap[s.fromUserId][s.toUserId].isNegative()) {
      const excess = owedMap[s.fromUserId][s.toUserId].negated();
      owedMap[s.fromUserId][s.toUserId] = new Decimal(0);
      owedMap[s.toUserId][s.fromUserId] = owedMap[s.toUserId][s.fromUserId].plus(excess);
    }
  }

  // Collect all user IDs
  const userIds = new Set<string>();
  for (const expense of expenses) {
    userIds.add(expense.paidById);
    for (const share of expense.shares) userIds.add(share.userId);
  }
  for (const s of settlements) {
    userIds.add(s.fromUserId);
    userIds.add(s.toUserId);
  }

  // Build result
  const result: UserBalance[] = [];

  for (const userId of userIds) {
    const owes: Record<string, number> = {};
    const isOwed: Record<string, number> = {};
    let net = new Decimal(0);

    for (const otherId of userIds) {
      if (otherId === userId) continue;

      const iOweOther = owedMap[userId]?.[otherId] ?? new Decimal(0);
      const otherOwesMe = owedMap[otherId]?.[userId] ?? new Decimal(0);

      // Net the two directions
      const netOwed = iOweOther.minus(otherOwesMe);

      if (netOwed.greaterThan(0)) {
        owes[otherId] = netOwed.toDecimalPlaces(2).toNumber();
        net = net.minus(netOwed);
      } else if (netOwed.lessThan(0)) {
        isOwed[otherId] = netOwed.negated().toDecimalPlaces(2).toNumber();
        net = net.plus(netOwed.negated());
      }
    }

    result.push({
      userId,
      net: net.toDecimalPlaces(2).toNumber(),
      owes,
      isOwed,
    });
  }

  return result;
}

// Fetches all expenses + settlements for multiple groups in 2 queries,
// then computes the given user's net balance per group in memory.
// Use this on the home page instead of calling computeBalances() per-group.
export async function computeAllGroupBalances(
  groupIds: string[],
  userId: string,
): Promise<Record<string, number>> {
  if (groupIds.length === 0) return {};

  const [expenses, settlements] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: { in: groupIds }, isDeleted: false },
      select: {
        groupId: true,
        paidById: true,
        shares: { select: { userId: true, amountOwed: true } },
      },
    }),
    prisma.settlement.findMany({
      where: { groupId: { in: groupIds } },
      select: { groupId: true, fromUserId: true, toUserId: true, amount: true },
    }),
  ]);

  const result: Record<string, number> = {};

  for (const groupId of groupIds) {
    let net = new Decimal(0);

    for (const expense of expenses) {
      if (expense.groupId !== groupId) continue;
      if (expense.paidById === userId) {
        for (const share of expense.shares) {
          if (share.userId !== userId) {
            net = net.plus(new Decimal(share.amountOwed.toString()));
          }
        }
      } else {
        const myShare = expense.shares.find((s) => s.userId === userId);
        if (myShare) {
          net = net.minus(new Decimal(myShare.amountOwed.toString()));
        }
      }
    }

    for (const s of settlements) {
      if (s.groupId !== groupId) continue;
      if (s.fromUserId === userId) {
        net = net.plus(new Decimal(s.amount.toString()));
      } else if (s.toUserId === userId) {
        net = net.minus(new Decimal(s.amount.toString()));
      }
    }

    result[groupId] = net.toDecimalPlaces(2).toNumber();
  }

  return result;
}
