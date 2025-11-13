'use client';

import Link from "next/link"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Redirige a la página de login ya que el registro está deshabilitado.
export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/login');
    }, [router]);

    return (
        <div className="text-center">
            <p>Redirigiendo a la página de inicio de sesión...</p>
        </div>
    );
}
