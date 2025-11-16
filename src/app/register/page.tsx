
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { FirebaseError } from "firebase/app";

export default function RegisterPage() {
    const { signUp } = useAuth();
    const router = useRouter();
    
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signUp(displayName, email, password);
            router.push('/');
        } catch (err: any) {
             let message = "No se pudo crear la cuenta. Por favor, inténtalo de nuevo.";
            if (err instanceof FirebaseError) {
                if (err.code === 'auth/email-already-in-use') {
                    message = "Este email ya está registrado. Por favor, inicia sesión.";
                } else if (err.code === 'auth/weak-password') {
                    message = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres.";
                }
            }
            setError(message);
            console.error('Sign up failed', err);
        } finally {
            setLoading(false);
        }
    }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CannaGrowLogo className="mx-auto mb-4" />
        <CardTitle className="text-2xl font-headline text-center">Crear una cuenta</CardTitle>
        <CardDescription className="text-center">
          Introduce tus datos para empezar tu viaje de cultivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="display-name">Nombre de Usuario</Label>
            <Input 
                id="display-name" 
                placeholder="Tu apodo" 
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />
          </div>
           {error && <p className="text-sm text-center text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Crear Cuenta'}
          </Button>
        </form>
      </CardContent>
       <CardFooter className="text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="underline ml-1">
          Inicia Sesión
        </Link>
      </CardFooter>
    </Card>
  )
}
