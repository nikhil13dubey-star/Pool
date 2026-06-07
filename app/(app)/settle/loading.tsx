import { Loader } from "@/components/ui/loader";

export default function Loading() {
  return (
    <Loader
      label="Loading settle up…"
      icon={
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 7h11l-3-3M17 17H6l3 3" />
        </svg>
      }
    />
  );
}
