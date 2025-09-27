'use client';

import Link from "next/link"
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { CannaConnectLogo } from "@/components/icons/logo"
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    const { signUp } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signUp(username, email, password);
            router.push('/');
        } catch (error) {
            console.error('Failed to sign up', error)
        } finally {
            setLoading(false);
        }
    }


  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
            <CannaConnectLogo />
        </div>
        <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
        <CardDescription>
          Ingresa tus datos para unirte a la comunidad
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister}>
            <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input id="username" placeholder="TuUsuario" required value={username} onChange={e => setUsername(e.target.value)} />
            </div>
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
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required/>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                 {loading ? <Loader2 className="animate-spin" /> : 'Crear cuenta'}
            </Button>
            </div>
        </form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="underline">
            Iniciar sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
