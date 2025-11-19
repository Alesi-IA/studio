export type CultivationPhase = 'germination' | 'vegetative' | 'flowering';

export interface PredefinedTask {
    day: number;
    phase: CultivationPhase;
    name: string;
    description: string;
}

export const predefinedTasks: PredefinedTask[] = [
    // --- Germination Phase (Day 1-7) ---
    {
        day: 1,
        phase: 'germination',
        name: "Iniciar Germinación",
        description: "Coloca las semillas en un medio húmedo (ej. toallas de papel mojadas dentro de un tupper) en un lugar oscuro y cálido. Mantén la humedad constante."
    },
    {
        day: 3,
        phase: 'germination',
        name: "Revisar Humedad y Raíz",
        description: "Asegúrate de que el medio de germinación siga húmedo. Busca la aparición de la raíz primaria (radícula). Si mide ~1cm, está lista para plantar."
    },
    {
        day: 5,
        phase: 'germination',
        name: "Plantar Semilla Germinada",
        description: "Planta la semilla con la raíz hacia abajo, a 1-2 cm de profundidad en el sustrato final. Riega suavemente. Enciende la luz a 18h/día."
    },

    // --- Vegetative Phase (Day 8-37) ---
    {
        day: 8,
        phase: 'vegetative',
        name: "Monitorear Primeras Hojas",
        description: "Los cotiledones (primeras hojas redondas) deberían estar abiertos. Ahora aparecerá el primer par de hojas 'verdaderas' (serradas)."
    },
    {
        day: 15,
        phase: 'vegetative',
        name: "Primer Riego con Nutrientes (1/4 dosis)",
        description: "Introduce una dosis muy baja de nutrientes de crecimiento. Observa la reacción de la planta para evitar sobrefertilización."
    },
    {
        day: 21,
        phase: 'vegetative',
        name: "Considerar Inicio de LST (Low Stress Training)",
        description: "Si la planta tiene 4-5 nudos, puedes empezar a doblar suavemente el tallo principal para fomentar un crecimiento más horizontal y tupido."
    },
    {
        day: 28,
        phase: 'vegetative',
        name: "Aumentar Nutrientes (1/2 dosis)",
        description: "Si la planta responde bien, aumenta la dosis de nutrientes de crecimiento a la mitad de lo recomendado por el fabricante."
    },
    {
        day: 35,
        phase: 'vegetative',
        name: "Realizar Poda Apical (Opcional)",
        description: "Si buscas múltiples colas principales, puedes cortar la punta del tallo principal. Esto estresa la planta; asegúrate de que esté sana antes de hacerlo."
    },

    // --- Flowering Phase (Day 38-90) ---
    {
        day: 38,
        phase: 'flowering',
        name: "Cambio a 12/12 y Nutrientes de Floración",
        description: "Cambia el ciclo de luz a 12 horas de luz y 12 de oscuridad para inducir la floración. Empieza a usar nutrientes específicos para esta fase."
    },
    {
        day: 45,
        phase: 'flowering',
        name: "Identificar Primeros Pistilos",
        description: "Busca los 'pelitos' blancos (pistilos) en los nudos. Esto confirma que la planta ha entrado en floración y es hembra."
    },
    {
        day: 55,
        phase: 'flowering',
        name: "Defoliación Ligera",
        description: "Quita algunas hojas grandes que tapen la luz a los cogollos inferiores para mejorar la penetración de la luz y la ventilación."
    },
    {
        day: 65,
        phase: 'flowering',
        name: "Pico de Desarrollo de Cogollos",
        description: "Los cogollos deberían estar engordando visiblemente. Mantén una humedad baja (40-50%) para prevenir el moho."
    },
    {
        day: 75,
        phase: 'flowering',
        name: "Iniciar Lavado de Raíces",
        description: "Deja de usar nutrientes y riega solo con agua (con pH ajustado). Esto elimina el exceso de sales del sustrato y mejora el sabor final."
    },
    {
        day: 85,
        phase: 'flowering',
        name: "Revisar Tricomas para Cosecha",
        description: "Usa una lupa para observar los tricomas. Cosecha cuando la mayoría estén de color blanco lechoso y unos pocos de color ámbar."
    },
    {
        day: 90,
        phase: 'flowering',
        name: "¡Día de la Cosecha!",
        description: "¡Felicidades! Es hora de cortar tu planta. Prepara el espacio de secado (oscuro, ventilado, 50-60% humedad)."
    }
];
