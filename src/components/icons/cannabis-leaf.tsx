import { cn } from "@/lib/utils";

export function CannabisLeafIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
    >
      <path d="M12 2c-.9 3.5-3.5 4.5-5 5-1.8.6-3.5.6-3.5.6s.5 2.1 2 4.5c.8 1.2 1.4 2.3 1.5 3.4" />
      <path d="M12 2c.9 3.5 3.5 4.5 5 5 1.8.6 3.5.6 3.5.6s-.5 2.1-2 4.5c-.8 1.2-1.4 2.3-1.5 3.4" />
      <path d="M12 22v-3.5c0-1.4.5-2.8 1.5-3.8 1.5-1.5 3-2.3 4.5-3.2 0 0 .6-1.5.6-3.5s-2.1-2-4.5-2.5-4-1-5.5.5" />
      <path d="M12 22v-3.5c0-1.4-.5-2.8-1.5-3.8-1.5-1.5-3-2.3-4.5-3.2 0 0-.6-1.5-.6-3.5s2.1-2 4.5-2.5 4-1 5.5.5" />
    </svg>
  );
}
