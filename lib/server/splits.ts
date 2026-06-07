import Decimal from "decimal.js";

export interface SplitResult {
  userId: string;
  amountOwed: number;
  shareValue: number;
}

export type SplitMethod = "EQUAL" | "EXACT" | "SHARES" | "PERCENT";

export function splitExpense(
  totalAmount: number,
  method: SplitMethod,
  participants: string[],
  exactAmounts?: Record<string, number>,
  // weights = share counts (SHARES) or percentages (PERCENT), keyed by userId
  weights?: Record<string, number>,
): SplitResult[] {
  if (participants.length === 0) throw new Error("No participants");

  const total = new Decimal(totalAmount).toDecimalPlaces(2);

  // SHARES / PERCENT: split proportionally to weights; last participant absorbs the remainder.
  if (method === "SHARES" || method === "PERCENT") {
    if (!weights) throw new Error("weights required");
    const w = participants.map((u) => new Decimal(weights[u] ?? 0));
    const totalW = w.reduce((a, b) => a.plus(b), new Decimal(0));
    if (totalW.lessThanOrEqualTo(0)) throw new Error("Weights must be positive");
    let acc = new Decimal(0);
    return participants.map((userId, i) => {
      let amount: Decimal;
      if (i === participants.length - 1) amount = total.minus(acc);
      else {
        amount = total.times(w[i]).dividedBy(totalW).toDecimalPlaces(2);
        acc = acc.plus(amount);
      }
      return { userId, amountOwed: amount.toNumber(), shareValue: w[i].toNumber() };
    });
  }

  if (method === "EQUAL") {
    const share = total.dividedBy(participants.length).toDecimalPlaces(2);
    const distributed = share.times(participants.length - 1);
    const lastShare = total.minus(distributed); // last absorbs rounding remainder

    return participants.map((userId, i) => ({
      userId,
      amountOwed: (i === participants.length - 1 ? lastShare : share).toNumber(),
      shareValue: 1,
    }));
  }

  if (method === "EXACT") {
    if (!exactAmounts) throw new Error("exactAmounts required for EXACT split");

    // Sum over PARTICIPANTS only (not raw input keys) so debt can't silently leak
    // when exactAmounts contains keys that aren't participants.
    const sum = participants.reduce(
      (acc, userId) => acc.plus(new Decimal(exactAmounts[userId] ?? 0)),
      new Decimal(0),
    );

    if (!sum.toDecimalPlaces(2).equals(total)) {
      throw new Error(
        `Exact amounts sum (${sum.toFixed(2)}) must equal total (${total.toFixed(2)})`,
      );
    }

    return participants.map((userId) => {
      const amount = new Decimal(exactAmounts[userId] ?? 0).toDecimalPlaces(2);
      return {
        userId,
        amountOwed: amount.toNumber(),
        shareValue: amount.toNumber(),
      };
    });
  }

  throw new Error(`Unknown split method: ${method}`);
}
