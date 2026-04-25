// Shared types used across client and server

export type ExpenseCategory =
  | "Food"
  | "Groceries"
  | "Rent"
  | "Utilities"
  | "Travel"
  | "Entertainment"
  | "Health"
  | "Shopping"
  | "Other";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food",
  "Groceries",
  "Rent",
  "Utilities",
  "Travel",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

export type AvatarColor = 1 | 2 | 3 | 4 | 5 | 6;

// Deterministic avatar color from name
export function getAvatarColor(name: string): string {
  const colors = [
    "linear-gradient(135deg, #ff9f0a, #c8740a)",
    "linear-gradient(135deg, #30d158, #1a8a3a)",
    "linear-gradient(135deg, #ff6482, #c84368)",
    "linear-gradient(135deg, #64d2ff, #3590bb)",
    "linear-gradient(135deg, #bf5af2, #8a3eb5)",
    "linear-gradient(135deg, #ffd60a, #c8a608)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getAvatarHex(name: string): string {
  const hexes = ["#ff9f0a", "#30d158", "#ff6482", "#64d2ff", "#bf5af2", "#ffd60a"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hexes[Math.abs(hash) % hexes.length];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatINR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatAmount(amount: number | string): {
  symbol: string;
  whole: string;
  decimal: string;
} {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const fixed = Math.abs(num).toFixed(2);
  const [whole, decimal] = fixed.split(".");
  return {
    symbol: "₹",
    whole: parseInt(whole).toLocaleString("en-IN"),
    decimal: decimal === "00" ? "" : `.${decimal}`,
  };
}
