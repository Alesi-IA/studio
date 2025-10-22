import { CannabisLeafIcon } from "./cannabis-leaf";
import { cn } from "@/lib/utils";

export function CannaGrowLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary-foreground">
        <div className="absolute inset-0 rounded-lg bg-primary opacity-80"></div>
        <CannabisLeafIcon className="relative h-5 w-5" />
      </div>
    </div>
  );
}
