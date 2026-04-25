import { describe, it, expect } from "vitest";
import { simplifyDebts } from "@/lib/server/simplify";

describe("simplifyDebts", () => {
  it("returns empty for empty balances", () => {
    expect(simplifyDebts({})).toEqual([]);
  });

  it("returns empty when all settled", () => {
    const result = simplifyDebts({ a: 0, b: 0, c: 0 });
    expect(result).toHaveLength(0);
  });

  it("single debtor to single creditor", () => {
    const result = simplifyDebts({ a: 100, b: -100 });
    expect(result).toHaveLength(1);
    expect(result[0].fromUserId).toBe("b");
    expect(result[0].toUserId).toBe("a");
    expect(result[0].amount).toBe(100);
  });

  it("A→B 100, B→C 100 simplifies to A→C 100", () => {
    // A owed 100, B netted 0, C owes 100
    const result = simplifyDebts({ a: 100, b: 0, c: -100 });
    expect(result).toHaveLength(1);
    expect(result[0].fromUserId).toBe("c");
    expect(result[0].toUserId).toBe("a");
    expect(result[0].amount).toBe(100);
  });

  it("3-person circular: A→B 100, B→C 100, C→A 100 = all zero", () => {
    const result = simplifyDebts({ a: 0, b: 0, c: 0 });
    expect(result).toHaveLength(0);
  });

  it("total transferred = total |negative balances|", () => {
    const balances = { a: 200, b: -50, c: -150 };
    const result = simplifyDebts(balances);
    const totalTransferred = result.reduce((s, t) => s + t.amount, 0);
    const totalOwed = Math.abs(-50) + Math.abs(-150);
    expect(totalTransferred).toBeCloseTo(totalOwed, 2);
  });

  it("single creditor, multiple debtors", () => {
    const result = simplifyDebts({ rich: 300, p1: -100, p2: -100, p3: -100 });
    expect(result).toHaveLength(3);
    const total = result.reduce((s, t) => s + t.amount, 0);
    expect(total).toBeCloseTo(300, 2);
  });
});
