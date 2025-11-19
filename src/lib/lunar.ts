import { differenceInDays, startOfDay } from 'date-fns';
import { Moon, Circle, ChevronsRight, ChevronsLeft, LucideProps } from 'lucide-react';
import type { FC } from 'react';

// Known new moon: January 21, 2023, 20:53 UTC
const KNOWN_NEW_MOON = new Date('2023-01-21T20:53:00Z');
const LUNAR_CYCLE_DAYS = 29.53058867;

const phases: { [key: string]: { name: string, icon: FC<LucideProps>, advice: string } } = {
    newMoon: { name: "Luna Nueva", icon: Circle, advice: "Buen día para sembrar y plantar." },
    waxingCrescent: { name: "Creciente Iluminante", icon: Moon, advice: "Ideal para el crecimiento de hojas y tallos." },
    firstQuarter: { name: "Cuarto Creciente", icon: Moon, advice: "Buena energía para el crecimiento vegetativo." },
    waxingGibbous: { name: "Gibosa Iluminante", icon: Moon, advice: "Favorable para podas y entrenamientos." },
    fullMoon: { name: "Luna Llena", icon: Circle, advice: "Energía alta. Ideal para cosechar y aplicar fertilizantes foliares." },
    waningGibbous: { name: "Gibosa Menguante", icon: Moon, advice: "Buen momento para trasplantes y trabajo de raíces." },
    lastQuarter: { name: "Cuarto Menguante", icon: Moon, advice: "Propicio para podar y controlar plagas." },
    waningCrescent: { name: "Menguante Balsámica", icon: Moon, advice: "Periodo de reposo. Evita tareas estresantes para la planta." },
};

const phaseAngles: { [key: number]: keyof typeof phases } = {
    0: 'newMoon',
    1: 'waxingCrescent',
    2: 'firstQuarter',
    3: 'waxingGibbous',
    4: 'fullMoon',
    5: 'waningGibbous',
    6: 'lastQuarter',
    7: 'waningCrescent',
};

export interface LunarPhaseInfo {
    phaseName: string;
    icon: FC<LucideProps>;
    advice: string;
}

export function getLunarPhase(date: Date): LunarPhaseInfo {
    const today = startOfDay(date);
    const daysSinceKnownNewMoon = differenceInDays(today, startOfDay(KNOWN_NEW_MOON));
    const currentCycleDay = (daysSinceKnownNewMoon % LUNAR_CYCLE_DAYS + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
    const phaseIndex = Math.floor((currentCycleDay / LUNAR_CYCLE_DAYS) * 8);

    const phaseKey = phaseAngles[phaseIndex];
    const phaseInfo = phases[phaseKey];

    // Adjust icon rotation for different phases
    let customIcon = phaseInfo.icon;
    const iconStyle: React.CSSProperties = {};

    if (phaseKey === 'waxingCrescent' || phaseKey === 'firstQuarter') {
        iconStyle.transform = 'rotate(45deg)';
    } else if (phaseKey === 'waxingGibbous') {
        iconStyle.transform = 'rotate(90deg)';
    } else if (phaseKey === 'waningGibbous') {
        iconStyle.transform = 'rotate(-90deg)';
    } else if (phaseKey === 'lastQuarter' || phaseKey === 'waningCrescent') {
        iconStyle.transform = 'rotate(-45deg)';
    }
    
    if (phaseKey === 'newMoon') {
         customIcon = ({className, ...props}) => <Circle {...props} className={`${className} fill-foreground`} />;
    } else if (phaseKey === 'fullMoon') {
         customIcon = ({className, ...props}) => <Circle {...props} className={`${className} fill-current`} />;
    } else {
        customIcon = ({className, ...props}) => <Moon {...props} style={iconStyle} className={className} />;
    }


    return {
        phaseName: phaseInfo.name,
        icon: customIcon,
        advice: phaseInfo.advice,
    };
}
