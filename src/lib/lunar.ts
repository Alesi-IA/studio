
import { differenceInDays, startOfDay } from 'date-fns';
import { Moon, Circle, type LucideProps, type LucideIcon } from 'lucide-react';
import type { FC } from 'react';

// Known new moon: January 21, 2023, 20:53 UTC
const KNOWN_NEW_MOON = new Date('2023-01-21T20:53:00Z');
const LUNAR_CYCLE_DAYS = 29.53058867;

const phases: { [key: string]: { name: string; advice: string } } = {
    newMoon: { name: "Luna Nueva", advice: "Buen día para sembrar y plantar." },
    waxingCrescent: { name: "Creciente Iluminante", advice: "Ideal para el crecimiento de hojas y tallos." },
    firstQuarter: { name: "Cuarto Creciente", advice: "Buena energía para el crecimiento vegetativo." },
    waxingGibbous: { name: "Gibosa Iluminante", advice: "Favorable para podas y entrenamientos." },
    fullMoon: { name: "Luna Llena", advice: "Energía alta. Ideal para cosechar y aplicar fertilizantes foliares." },
    waningGibbous: { name: "Gibosa Menguante", advice: "Buen momento para trasplantes y trabajo de raíces." },
    lastQuarter: { name: "Cuarto Menguante", advice: "Propicio para podar y controlar plagas." },
    waningCrescent: { name: "Menguante Balsámica", advice: "Periodo de reposo. Evita tareas estresantes para la planta." },
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
    icon: LucideIcon;
    iconProps: LucideProps;
    advice: string;
}

const getIconForPhase = (phaseKey: keyof typeof phases): { icon: LucideIcon, props: LucideProps } => {
    let rotation = 0;

    switch(phaseKey) {
        case 'newMoon': return { icon: Circle, props: { fill: 'currentColor' } };
        case 'fullMoon': return { icon: Circle, props: { fill: 'currentColor' } };
        case 'waxingCrescent':
        case 'firstQuarter':
            rotation = 45;
            break;
        case 'waxingGibbous':
            rotation = 90;
            break;
        case 'waningGibbous':
            rotation = -90;
            break;
        case 'lastQuarter':
        case 'waningCrescent':
            rotation = -45;
            break;
    }
    
    return { icon: Moon, props: { style: { transform: `rotate(${rotation}deg)` } } };
};

export function getLunarPhase(date: Date): LunarPhaseInfo {
    const today = startOfDay(date);
    const daysSinceKnownNewMoon = differenceInDays(today, startOfDay(KNOWN_NEW_MOON));
    const currentCycleDay = (daysSinceKnownNewMoon % LUNAR_CYCLE_DAYS + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;
    const phaseIndex = Math.floor((currentCycleDay / LUNAR_CYCLE_DAYS) * 8);

    const phaseKey = phaseAngles[phaseIndex];
    const phaseInfo = phases[phaseKey];
    const { icon, props } = getIconForPhase(phaseKey);

    return {
        phaseName: phaseInfo.name,
        icon: icon,
        iconProps: props,
        advice: phaseInfo.advice,
    };
}
