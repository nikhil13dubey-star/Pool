export interface Category {
  key: string;
  label: string;
  hue: number;
}

export const CATEGORIES: Category[] = [
  { key: "Food", label: "Food & Drink", hue: 28 },
  { key: "Groceries", label: "Groceries", hue: 140 },
  { key: "Travel", label: "Travel", hue: 200 },
  { key: "Stay", label: "Stay", hue: 260 },
  { key: "Entertainment", label: "Fun", hue: 300 },
  { key: "Shopping", label: "Shopping", hue: 330 },
  { key: "Utilities", label: "Utilities", hue: 190 },
  { key: "Health", label: "Health", hue: 0 },
  { key: "Other", label: "Other", hue: 220 },
];

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
export function categoryHue(key: string): number {
  return CATEGORIES.find((c) => c.key === key)?.hue ?? 220;
}
