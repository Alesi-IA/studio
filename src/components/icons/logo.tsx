import { CannabisLeafIcon } from "./cannabis-leaf";

export function CannaGrowLogo() {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary-foreground">
      <div className="absolute inset-0 rounded-lg bg-primary opacity-80"></div>
      <CannabisLeafIcon className="relative h-5 w-5" />
    </div>
  );
}
