
import Link from "next/link"

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

export default function RegisterPage() {
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
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input id="username" placeholder="TuUsuario" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full">
            Crear cuenta
          </Button>
        </div>
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
