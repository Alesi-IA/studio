
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
import { useEffect, useState, useMemo } from 'react';
import { subMonths, format, isAfter, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CannaGrowUser } from '@/types';

const roleIcons = {
  owner: <Crown className="mr-1 h-3 w-3" />,
  'co-owner': <ShieldHalf className="mr-1 h-3 w-3" />,
  moderator: <ShieldCheck className="mr-1 h-3 w-3" />,
  user: <UserCog className="mr-1 h-3 w-3" />,
};

const roleVariants = {
  owner: 'destructive' as const,
  'co-owner': 'secondary' as const,
  moderator: 'secondary' as const,
  user: 'outline' as const,
};

const roleNames: Record<string, string> = {
  owner: 'Dueño',
  'co-owner': 'Co-Dueño',
  moderator: 'Moderador',
  user: 'Usuario',
};

// --- DATOS DE DEMOSTRACIÓN ---
// Reemplazamos la llamada a Firestore con datos estáticos para el modo prototipo.
const demoUsers: CannaGrowUser[] = [
    { uid: 'prototype-user-001', displayName: 'CannaOwner', email: 'owner@cannaconnect.app', role: 'owner', photoURL: 'https://picsum.photos/seed/prototype-user-001/128/128', createdAt: new Date().toISOString() },
    { uid: 'user-2', displayName: 'CultivadorPro', email: 'pro@grower.com', role: 'user', photoURL: 'https://picsum.photos/seed/user-2/40/40', createdAt: subDays(new Date(), 2).toISOString() },
    { uid: 'user-3', displayName: 'MariaJuana', email: 'mj@grower.com', role: 'user', photoURL: 'https://picsum.photos/seed/user-3/40/40', createdAt: subDays(new Date(), 10).toISOString() },
    { uid: 'user-4', displayName: 'ElVerde', email: 'verde@grower.com', role: 'moderator', photoURL: 'https://picsum.photos/seed/user-4/40/40', createdAt: subDays(new Date(), 45).toISOString() },
    { uid: 'user-5', displayName: 'CosechaFeliz', email: 'feliz@grower.com', role: 'user', photoURL: 'https://picsum.photos/seed/user-5/40/40', createdAt: subDays(new Date(), 100).toISOString() },
];

const demoPosts = [
    { id: '1', authorId: 'prototype-user-001' },
    { id: '2', authorId: 'user-2' },
    { id: '3', authorId: 'user-3' },
    { id: '4', authorId: 'user-2' },
];
// --- FIN DE DATOS DE DEMOSTRACIÓN ---

export default function AdminPage() {
  const { _injectUser, user: currentUser, isOwner } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [roleFilters, setRoleFilters] = useState<Record<string, boolean>>({
    owner: false,
    'co-owner': false,
    moderator: false,
    user: false,
  });

  // Usamos los datos de demostración en lugar de llamar a Firestore
  const usersData = demoUsers;
  const postsData = demoPosts;
  const isLoadingUsers = false;
  const isLoadingPosts = false;

  const totalUsers = useMemo(() => usersData?.length || 0, [usersData]);
  const totalPosts = useMemo(() => postsData?.length || 0, [postsData]);

  const activeUsersToday = useMemo(() => {
    if (!usersData) return 0;
    const twentyFourHoursAgo = subDays(new Date(), 1);
    return usersData.filter(user => {
      if (!user.createdAt) return false;
      const userDate = new Date(user.createdAt);
      return isAfter(userDate, twentyFourHoursAgo);
    }).length;
  }, [usersData]);


  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    const activeFilters = Object.keys(roleFilters).filter(key => roleFilters[key]);
    if (activeFilters.length === 0) return usersData;
    return usersData.filter(user => activeFilters.includes(user.role));
  }, [usersData, roleFilters]);

  const handleRoleFilterChange = (role: string, checked: boolean) => {
    setRoleFilters(prev => ({ ...prev, [role]: checked }));
  };

  useEffect(() => {
    if (!isOwner) {
      router.push('/');
    }
  }, [isOwner, router]);

  const chartData = useMemo(() => {
    const months: { name: string, total: number }[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = subMonths(today, i);
        months.push({ name: format(d, 'MMM', { locale: es }), total: 0 });
    }

    if (usersData) {
        usersData.forEach(user => {
            if (user.createdAt) {
                let userDate = new Date(user.createdAt);
                const monthName = format(userDate, 'MMM', { locale: es });
                const monthIndex = months.findIndex(m => m.name.toLowerCase() === monthName.toLowerCase());
                if (monthIndex > -1) {
                    months[monthIndex].total++;
                }
            }
        });
    }
    return months;
  }, [usersData]);
  

  const handleImpersonate = (targetUser: CannaGrowUser) => {
    _injectUser(targetUser);
    toast({
      title: 'Suplantación Exitosa',
      description: `Ahora estás navegando como ${targetUser.displayName}.`,
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
              <div className="text-2xl font-bold">{isLoadingUsers ? '...' : totalUsers}</div>
              <p className="text-xs text-muted-foreground">Miembros en la plataforma</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publicaciones Totales</CardTitle>
              <File className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingPosts ? '...' : totalPosts}</div>
              <p className="text-xs text-muted-foreground">Contenido generado por usuarios</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Nuevos (24h)</CardTitle>
              <AreaChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingUsers ? '...' : activeUsersToday}</div>
              <p className="text-xs text-muted-foreground">Nuevos registros en las últimas 24h</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos Usuarios (Mes)</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chartData.find(m => m.name.toLowerCase() === format(new Date(), 'MMM', {locale: es}).toLowerCase())?.total || 0}</div>
              <p className="text-xs text-muted-foreground">En el mes actual</p>
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
                    allowDecimals={false}
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
                    {Object.keys(roleNames).map(role => (
                       <DropdownMenuCheckboxItem 
                         key={role}
                         checked={roleFilters[role]}
                         onCheckedChange={(checked) => handleRoleFilterChange(role, !!checked)}
                       >
                         {roleNames[role]}
                       </DropdownMenuCheckboxItem>
                    ))}
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
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                     <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            Cargando usuarios...
                        </TableCell>
                    </TableRow>
                  ) : filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((user: CannaGrowUser) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={roleVariants[user.role as keyof typeof roleVariants] || 'outline'}>
                            {roleIcons[user.role as keyof typeof roleIcons]}
                            {roleNames[user.role as keyof typeof roleNames] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {currentUser?.uid !== user.uid && (
                          <Button variant="outline" size="sm" onClick={() => handleImpersonate(user)}>
                            <LogIn className="mr-2 h-3 w-3" />
                            Iniciar sesión como
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No hay usuarios para mostrar.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
