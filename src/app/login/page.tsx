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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const { logIn } = useAuth();
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
            // On successful login, AuthProvider's onAuthStateChanged will update the user state.
            // AppShell will then detect the user and render the main app content.
            // We can now safely redirect.
            router.push('/');
        } catch (err: any) {
             setError("Las credenciales son incorrectas. Por favor, inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    }


  return (
    <Card className="mx-auto max-w-sm">
       <CardHeader className="text-center">
        <CannaGrowLogo className="mx-auto" />
        <CardTitle className="text-2xl font-headline font-bold">CannaGrow</CardTitle>
        <CardDescription>
          Ingresa tu email para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
            <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                />
            </div>
            <div className="grid gap-2">
                <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
                </div>
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
             {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : 'Iniciar sesión'}
            </Button>
            </div>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes una cuenta?{" "}
          <Link href="/register" className="underline">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
