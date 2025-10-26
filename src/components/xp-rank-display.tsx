
'use client';

import { rankConfig } from '@/app/profile/[id]/page';
import { cn } from '@/lib/utils';
import { CannabisLeafIcon } from './icons/cannabis-leaf';

interface XpRankDisplayProps {
  currentXp: number;
  rankId: number;
  className?: string;
}

const LEAF_COUNT = 5;

const rankColors: { [key: number]: string } = {
  0: 'fill-green-500',    // Brote
  1: 'fill-yellow-500',   // Aprendiz
  2: 'fill-orange-500',   // Cultivador
  3: 'fill-red-500',      // Experto
  4: 'fill-purple-500',   // Maestro
  5: 'fill-yellow-400',   // Dueño
};

export function XpRankDisplay({ currentXp, rankId, className }: XpRankDisplayProps) {
  const currentRank = rankConfig[rankId as keyof typeof rankConfig] || rankConfig[0];
  const rankMinXp = 'minXP' in currentRank ? currentRank.minXP : 0;
  const rankMaxXp = 'maxXP' in currentRank ? currentRank.maxXP : Infinity;

  // Handle Maestro rank where there's no upper limit
  if (rankMaxXp === Infinity) {
    return (
      <div className={cn("flex justify-center gap-1", className)}>
        {Array.from({ length: LEAF_COUNT }).map((_, i) => (
          <CannabisLeafIcon
            key={i}
            className={cn("h-6 w-6", rankColors[rankId] || 'fill-gray-300')}
          />
        ))}
      </div>
    );
  }
  
  const xpInRank = currentXp - rankMinXp;
  const xpForNextRank = rankMaxXp - rankMinXp + 1;
  const progressPercentage = (xpInRank / xpForNextRank) * 100;
  
  const litLeaves = Math.floor((progressPercentage / 100) * LEAF_COUNT);

  return (
    <div className={cn("flex justify-center gap-1", className)}>
      {Array.from({ length: LEAF_COUNT }).map((_, i) => (
        <CannabisLeafIcon
          key={i}
          className={cn(
            "h-6 w-6 transition-colors duration-300",
            i < litLeaves ? (rankColors[rankId] || 'fill-gray-300') : 'fill-muted'
          )}
        />
      ))}
    </div>
  );
}
