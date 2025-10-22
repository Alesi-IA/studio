'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, BarChart, File, ListFilter, LogIn, Users, Crown, ShieldCheck, UserCog, ShieldHalf } from 'lucide-react';
import {
  Bar,
  BarChart as BarChartComponent,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const chartData = [
  { name: 'Ene', total: Math.floor(Math.random() * 20) + 10 },
  { name: 'Feb', total: Math.floor(Math.random() * 20) + 15 },
  { name: 'Mar', total: Math.floor(Math.random() * 30) + 20 },
  { name: 'Abr', total: Math.floor(Math.random() * 40) + 25 },
  { name: 'May', total: Math.floor(Math.random() * 50) + 30 },
  { name: 'Jun', total: Math.floor(Math.random() * 60) + 35 },
];

const mockUsers = [
    { uid: 'owner-uid', name: 'AlexisGrow', email: 'alexisgrow@cannagrow.com', posts: 42, role: 'owner', photoURL: 'https://picsum.photos/seed/AlexisGrow/128/128' },
    { uid: 'co-owner-uid', name: 'CannaCoOwner', email: 'coowner@cannagrow.com', posts: 31, role: 'co-owner', photoURL: 'https://picsum.photos/seed/co-owner-uid/128/128' },
    { uid: 'moderator-uid', name: 'CannaMod', email: 'mod@cannagrow.com', posts: 23, role: 'moderator', photoURL: 'https://picsum.photos/seed/moderator-uid/128/128' },
    { uid: 'user-uid-1', name: 'Cultivador1', email: 'cultivador1@email.com', posts: 15, role: 'user', photoURL: 'https://picsum.photos/seed/user-uid-1/128/128' },
    { uid: 'user-uid-2', name: 'YerbaBuena', email: 'yerba.buena@email.com', posts: 8, role: 'user', photoURL: 'https://picsum.photos/seed/user-uid-2/128/128' },
    { uid: 'user-uid-4', name: 'Sativus', email: 'sativus@email.com', posts: 5, role: 'user', photoURL: 'https://picsum.photos/seed/user-uid-4/128/128' },
]

export default function AdminPage() {
  const { _injectUser, user: currentUser, isOwner } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if(!isOwner) {
        router.push('/');
    }
  }, [isOwner, router]);


  const handleImpersonate = (targetUser: (typeof mockUsers)[0]) => {
    const userToImpersonate = {
        uid: targetUser.uid,
        email: targetUser.email,
        displayName: targetUser.name,
        role: targetUser.role,
        photoURL: targetUser.photoURL
    };
    _injectUser(userToImpersonate);
    toast({
        title: 'Suplantación Exitosa',
        description: `Ahora estás navegando como ${targetUser.name}.`,
    });
    router.push('/');
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Panel de Administrador"
        description="Gestiona la comunidad, roles y visualiza las estadísticas."
      />
      <div className="p-4 md:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">1,254</div>
                <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Publicaciones Totales</CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">4,890</div>
                <p className="text-xs text-muted-foreground">+180 desde la semana pasada</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos Hoy</CardTitle>
                <AreaChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">312</div>
                <p className="text-xs text-muted-foreground">+32 desde ayer</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nuevos Usuarios (Mes)</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+98</div>
                <p className="text-xs text-muted-foreground">Un 15% más que el mes anterior</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Nuevos usuarios por mes</CardTitle>
              <CardDescription>
                Un resumen de los nuevos registros en los últimos 6 meses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChartComponent data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>
           <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                    <CardTitle>Gestión de Usuarios</CardTitle>
                    <CardDescription>
                        Una lista de los usuarios de la plataforma.
                    </CardDescription>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-sm"
                        >
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only">Filtrar</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrar por rol</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem>Dueño</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Co-Dueño</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Moderador</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Usuario</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="hidden sm:table-cell">Rol</TableHead>
                        <TableHead className="hidden md:table-cell">Publicaciones</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockUsers.map(user => (
                            <TableRow key={user.email}>
                                <TableCell>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                    {user.email}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                     <Badge variant={user.role === 'owner' ? 'destructive' : user.role === 'co-owner' ? 'secondary' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                                        {user.role === 'owner' && <Crown className="mr-1 h-3 w-3" />}
                                        {user.role === 'co-owner' && <ShieldHalf className="mr-1 h-3 w-3" />}
                                        {user.role === 'moderator' && <ShieldCheck className="mr-1 h-3 w-3" />}
                                        {user.role === 'user' && <UserCog className="mr-1 h-3 w-3" />}
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{user.posts}</TableCell>
                                 <TableCell className="text-right">
                                    {currentUser?.uid !== user.uid && (
                                        <Button variant="outline" size="sm" onClick={() => handleImpersonate(user)}>
                                            <LogIn className="mr-2 h-3 w-3" />
                                            Iniciar sesión como
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
