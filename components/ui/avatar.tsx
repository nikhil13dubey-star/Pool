import { avatarFor } from "@/lib/shared/avatar";

export function Avatar({
  name,
  hue,
  size = 30,
  ring,
}: {
  name: string;
  hue: number | string;
  size?: number;
  ring?: boolean;
}) {
  const { emoji, grad } = avatarFor(hue);
  return (
    <span
      className={`av${ring ? " av-me" : ""}`}
      title={name}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.55),
        background: grad,
        lineHeight: 1,
      }}
    >
      {emoji}
    </span>
  );
}
