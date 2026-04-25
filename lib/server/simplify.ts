import Decimal from "decimal.js";

export interface Transfer {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

// Greedy min-transfer debt simplification algorithm
export function simplifyDebts(rawBalances: Record<string, number>): Transfer[] {
  const balances = Object.entries(rawBalances).map(([userId, net]) => ({
    userId,
    balance: new Decimal(net).toDecimalPlaces(2),
  }));

  const creditors = balances
    .filter((b) => b.balance.greaterThan(0))
    .sort((a, b) => b.balance.comparedTo(a.balance));

  const debtors = balances
    .filter((b) => b.balance.lessThan(0))
    .sort((a, b) => a.balance.comparedTo(b.balance)); // most negative first

  const transfers: Transfer[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const amount = Decimal.min(
      creditor.balance,
      debtor.balance.negated(),
    ).toDecimalPlaces(2);

    if (amount.greaterThan(0)) {
      transfers.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: amount.toNumber(),
      });
    }

    creditor.balance = creditor.balance.minus(amount);
    debtor.balance = debtor.balance.plus(amount);

    if (creditor.balance.isZero()) ci++;
    if (debtor.balance.isZero()) di++;
  }

  return transfers;
}
