
import { cn } from "@/lib/utils";

export function TowlieIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className={cn("w-8 h-8", className)}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
        >
            {/* Towel Body */}
            <path
                d="M10 20 Q10 10, 20 10 H80 Q90 10, 90 20 V80 Q90 90, 80 90 H20 Q10 90, 10 80 V20 Z"
                className="fill-blue-300 stroke-blue-500"
            />
            
            {/* Stripes */}
            <line x1="10" y1="25" x2="90" y2="25" className="stroke-blue-500" />
            <line x1="10" y1="75" x2="90" y2="75" className="stroke-blue-500" />

            {/* Eyes */}
            <ellipse cx="38" cy="45" rx="12" ry="15" className="fill-white stroke-black" />
            <ellipse cx="62" cy="45" rx="12" ry="15" className="fill-white stroke-black" />

            {/* Pupils */}
            <circle cx="42" cy="48" r="3" className="fill-black stroke-none" />
            <circle cx="58" cy="48" r="3" className="fill-black stroke-none" />

            {/* Eyelids (for the classic look) */}
            <path d="M26 40 Q38 32, 50 40" className="stroke-red-500" strokeWidth="4" />
            <path d="M50 40 Q62 32, 74 40" className="stroke-red-500" strokeWidth="4" />

            {/* Mouth */}
            <path d="M40 65 Q50 70, 60 65" className="stroke-black" strokeWidth="2" />
        </svg>
    );
}
