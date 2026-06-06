import Decimal from "decimal.js";

export interface SplitResult {
  userId: string;
  amountOwed: number;
  shareValue: number;
}

export function splitExpense(
  totalAmount: number,
  method: "EQUAL" | "EXACT",
  participants: string[],
  exactAmounts?: Record<string, number>,
): SplitResult[] {
  if (participants.length === 0) throw new Error("No participants");

  const total = new Decimal(totalAmount).toDecimalPlaces(2);

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
