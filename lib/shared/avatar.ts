// Default profile avatars: a friendly, universally-liked set of 10 animal emoji
// on distinct gradients. Up to 10 people in a group get a distinct default look.
export const AVATARS: { emoji: string; grad: string }[] = [
  { emoji: "🦊", grad: "linear-gradient(140deg,#ffb347,#ff7a45)" },
  { emoji: "🐼", grad: "linear-gradient(140deg,#cfd9df,#8a99a8)" },
  { emoji: "🐧", grad: "linear-gradient(140deg,#74b9ff,#3a7bd5)" },
  { emoji: "🦁", grad: "linear-gradient(140deg,#ffd86f,#fc6262)" },
  { emoji: "🐯", grad: "linear-gradient(140deg,#ffb88c,#de6262)" },
  { emoji: "🐸", grad: "linear-gradient(140deg,#9be15d,#00c46a)" },
  { emoji: "🦉", grad: "linear-gradient(140deg,#c79081,#8e6e63)" },
  { emoji: "🐙", grad: "linear-gradient(140deg,#ff9a9e,#f857a6)" },
  { emoji: "🦄", grad: "linear-gradient(140deg,#c2a3ff,#7b5cff)" },
  { emoji: "🐳", grad: "linear-gradient(140deg,#43e7d5,#2e8bb0)" },
];

export function hueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

// Resolve an avatar index (0-9) from the stored avatarColor value (a hue string)
// or any seed — keeps working with existing data without a migration.
export function avatarIndex(seed: number | string): number {
  const n = typeof seed === "string" ? parseInt(seed, 10) : seed;
  return (((Number.isFinite(n) ? n : 0) % 10) + 10) % 10;
}

export function avatarFor(seed: number | string) {
  return AVATARS[avatarIndex(seed)];
}

export function gradientFromHue(hue: number | string): string {
  return avatarFor(hue).grad;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
