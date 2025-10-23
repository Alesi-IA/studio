import { cn } from "@/lib/utils";

export function CannabisLeafIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("w-6 h-6", className)}
    >
      <path d="M12 2C9.4 3.72 4.42 6.53 4.5 13.91c.05 4.65 3.33 8.09 7.5 8.09s7.45-3.44 7.5-8.09C19.58 6.53 14.6 3.72 12 2zM12 19.5c-2.43 0-4.5-2.07-4.5-4.5s2.07-4.5 4.5-4.5 4.5 2.07 4.5 4.5-2.07 4.5-4.5 4.5z" />
    </svg>
  );
}
