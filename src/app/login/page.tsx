
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

export default function LoginPage() {
    const { logIn, logInAsGuest } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await logIn(email, password);
            router.push('/');
        } catch (err: any) {
            let message = "No se pudo iniciar sesión. Por favor, comprueba tus credenciales.";
            if (err instanceof FirebaseError) {
                if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                    message = "Email o contraseña incorrectos.";
                } else {
                    message = `Error: ${err.message}`;
                }
            }
            setError(message);
            console.error('Login failed', err);
        } finally {
            setLoading(false);
        }
    }

    const handleGuestLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await logInAsGuest();
            router.push('/');
        } catch (err: any) {
             let message = "No se pudo iniciar sesión como invitado.";
             if (err instanceof FirebaseError) {
                message = `Error: ${err.message}`;
             }
            setError(message);
            console.error('Guest login failed', err);
        } finally {
            setLoading(false);
        }
    }


  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CannaGrowLogo className="mx-auto mb-4" />
        <CardTitle className="text-2xl font-headline text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Introduce tus datos para acceder a tu jardín.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="grid gap-4">
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
            <div className="flex items-center">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
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
            {loading ? <Loader2 className="animate-spin" /> : 'Iniciar Sesión'}
          </Button>
        </form>
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                O continuar con
                </span>
            </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGuestLogin} disabled={loading}>
          Entrar como Invitado
        </Button>
      </CardContent>
      <CardFooter className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <Link href="/register" className="underline ml-1">
          Regístrate
        </Link>
      </CardFooter>
    </Card>
  )
}
