import { describe, it, expect } from "vitest";
import { splitExpense } from "@/lib/server/splits";

describe("splitExpense — EQUAL", () => {
  it("splits equally among 2", () => {
    const result = splitExpense(100, "EQUAL", ["a", "b"]);
    expect(result).toHaveLength(2);
    expect(result[0].amountOwed).toBe(50);
    expect(result[1].amountOwed).toBe(50);
  });

  it("last share absorbs rounding remainder", () => {
    const result = splitExpense(100, "EQUAL", ["a", "b", "c"]);
    expect(result[0].amountOwed).toBe(33.33);
    expect(result[1].amountOwed).toBe(33.33);
    expect(result[2].amountOwed).toBe(33.34); // remainder goes to last
    const total = result.reduce((s, r) => s + r.amountOwed, 0);
    expect(total).toBeCloseTo(100, 2);
  });

  it("N=1 works", () => {
    const result = splitExpense(500, "EQUAL", ["solo"]);
    expect(result[0].amountOwed).toBe(500);
  });

  it("N=10 sums to total", () => {
    const result = splitExpense(
      1000,
      "EQUAL",
      Array.from({ length: 10 }, (_, i) => `u${i}`),
    );
    const total = result.reduce((s, r) => s + r.amountOwed, 0);
    expect(total).toBeCloseTo(1000, 2);
  });

  it("INR odd amount ₹101 split 2 ways", () => {
    const result = splitExpense(101, "EQUAL", ["a", "b"]);
    const total = result.reduce((s, r) => s + r.amountOwed, 0);
    expect(total).toBeCloseTo(101, 2);
    // 50.50 + 50.50
    expect(result[0].amountOwed + result[1].amountOwed).toBeCloseTo(101, 2);
  });
});

describe("splitExpense — EXACT", () => {
  it("exact split validates sum equals total", () => {
    const result = splitExpense(100, "EXACT", ["a", "b"], { a: 60, b: 40 });
    expect(result[0].amountOwed).toBe(60);
    expect(result[1].amountOwed).toBe(40);
  });

  it("throws if exact amounts don't sum to total", () => {
    expect(() => splitExpense(100, "EXACT", ["a", "b"], { a: 60, b: 30 })).toThrow();
  });

  it("handles decimal exact amounts", () => {
    const result = splitExpense(100, "EXACT", ["a", "b", "c"], {
      a: 33.33,
      b: 33.33,
      c: 33.34,
    });
    const total = result.reduce((s, r) => s + r.amountOwed, 0);
    expect(total).toBeCloseTo(100, 2);
  });
});
