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
import { Leaf, Loader2 } from "lucide-react";

export default function LoginPage() {
    const { logIn } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await logIn(email, password);
            router.push('/');
        } catch (error) {
             console.error('Failed to sign in', error)
        } finally {
            setLoading(false);
        }
    }


  return (
    <Card className="mx-auto max-w-sm">
       <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
            <CannaGrowLogo />
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-2xl font-headline font-bold">CannaGrow</span>
        </div>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
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
                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
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
