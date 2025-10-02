
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, BarChart, File, ListFilter, Users } from 'lucide-react';
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

const chartData = [
  { name: 'Ene', total: Math.floor(Math.random() * 20) + 10 },
  { name: 'Feb', total: Math.floor(Math.random() * 20) + 15 },
  { name: 'Mar', total: Math.floor(Math.random() * 30) + 20 },
  { name: 'Abr', total: Math.floor(Math.random() * 40) + 25 },
  { name: 'May', total: Math.floor(Math.random() * 50) + 30 },
  { name: 'Jun', total: Math.floor(Math.random() * 60) + 35 },
];

const mockUsers = [
    { name: 'Cultivador1', email: 'cultivador1@email.com', posts: 15, role: 'user'},
    { name: 'YerbaBuena', email: 'yerba.buena@email.com', posts: 8, role: 'user'},
    { name: 'Admin Canna', email: 'admin@cannagrow.com', posts: 42, role: 'admin'},
    { name: 'Flor_de_Loto', email: 'flor.loto@email.com', posts: 23, role: 'user'},
    { name: 'Sativus', email: 'sativus@email.com', posts: 5, role: 'user'},
]

export default function AdminPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Panel de Administrador"
        description="Gestiona la comunidad y visualiza las estadísticas."
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
                        Una lista de los usuarios recientes en la plataforma.
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
                        <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>
                            Activo
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>Archivado</DropdownMenuCheckboxItem>
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
                                     <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{user.posts}</TableCell>
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
