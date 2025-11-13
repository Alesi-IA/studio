'use client';

import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CannaGrowLogo } from "@/components/icons/logo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
    const { logInAsGuest } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGuestLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await logInAsGuest();
            // La redirección es manejada por el AuthProvider
        } catch (err: any) {
            setError("No se pudo iniciar sesión como invitado. Por favor, inténtalo de nuevo.");
            console.error('Guest login failed', err);
        } finally {
            setLoading(false);
        }
    }


  return (
    <Card className="mx-auto max-w-sm">
       <CardHeader className="text-center">
        <CannaGrowLogo className="mx-auto mb-2" />
        <CardTitle className="text-2xl font-headline font-bold">CannaGrow</CardTitle>
        <CardDescription>
          Bienvenido a tu compañero de cultivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <Button onClick={handleGuestLogin} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar como invitado'}
          </Button>
          {error && <p className="text-sm text-center text-destructive">{error}</p>}
        </div>
        <div className="mt-4 text-center text-sm">
          El registro por email está deshabilitado en este proyecto.
        </div>
      </CardContent>
    </Card>
  )
}
