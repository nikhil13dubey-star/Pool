import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <Loader
      label="Loading activity…"
      icon={
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      }
    />
  );
}
