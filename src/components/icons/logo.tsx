import { Leaf } from "lucide-react";

export function CannaConnectLogo() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary-foreground">
      <div className="absolute inset-0 rounded-lg bg-primary opacity-80"></div>
      <Leaf className="relative h-5 w-5" />
    </div>
  );
}
