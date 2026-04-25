import { cn } from "@/lib/client/utils";
import { TravelIcon, HomeGroupIcon, HeartIcon, GridIcon } from "./icons";

type GroupType = "TRIP" | "HOME" | "COUPLE" | "OTHER";

const typeConfig: Record<
  GroupType,
  { gradient: string; color: string; border: string; Icon: typeof TravelIcon }
> = {
  TRIP: {
    gradient: "linear-gradient(135deg, rgba(255,159,10,0.4), rgba(255,159,10,0.2))",
    color: "#ffb340",
    border: "rgba(255,159,10,0.3)",
    Icon: TravelIcon,
  },
  HOME: {
    gradient: "linear-gradient(135deg, rgba(48,209,88,0.35), rgba(48,209,88,0.18))",
    color: "#30d158",
    border: "rgba(48,209,88,0.3)",
    Icon: HomeGroupIcon,
  },
  COUPLE: {
    gradient: "linear-gradient(135deg, rgba(255,55,95,0.35), rgba(255,55,95,0.18))",
    color: "#ff6482",
    border: "rgba(255,55,95,0.3)",
    Icon: HeartIcon,
  },
  OTHER: {
    gradient: "linear-gradient(135deg, rgba(100,210,255,0.3), rgba(100,210,255,0.15))",
    color: "#64d2ff",
    border: "rgba(100,210,255,0.3)",
    Icon: GridIcon,
  },
};

interface GroupIconProps {
  type: GroupType;
  size?: number;
  className?: string;
}

export function GroupIcon({ type, size = 40, className }: GroupIconProps) {
  const { gradient, color, border, Icon } = typeConfig[type];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center flex-shrink-0 rounded-[12px] overflow-hidden",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: gradient,
        boxShadow: `inset 0 0 0 0.5px ${border}`,
        color,
      }}
    >
      {/* Top gloss */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.25), transparent)",
        }}
      />
      <Icon size={Math.floor(size * 0.5)} className="relative z-10" />
    </div>
  );
}
