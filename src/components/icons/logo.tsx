import { TowlieIcon } from "./towlie";
import { cn } from "@/lib/utils";

export function CannaGrowLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/20 text-primary-foreground">
        <div className="absolute inset-0 rounded-lg bg-blue-400 opacity-80"></div>
        <TowlieIcon className="relative h-7 w-7" />
      </div>
    </div>
  );
}
