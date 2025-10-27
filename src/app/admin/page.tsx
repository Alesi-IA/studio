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
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, getCountFromServer, Timestamp, where } from 'firebase/firestore';
import { subMonths, format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

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


export default function AdminPage() {
  const { _injectUser, user: currentUser, isOwner } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [activeUsersToday, setActiveUsersToday] = useState(0);
  const [roleFilters, setRoleFilters] = useState<Record<string, boolean>>({
    owner: false,
    'co-owner': false,
    moderator: false,
    user: false,
  });

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  
  const { data: usersData, isLoading: isLoadingUsers } = useCollection(usersQuery);

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

  useEffect(() => {
    const fetchCounts = async () => {
      if (!firestore) return;
      const usersColl = collection(firestore, 'users');
      const postsColl = collection(firestore, 'posts');

      try {
        const userSnapshot = await getCountFromServer(usersColl);
        setTotalUsers(userSnapshot.data().count);
      } catch (error: any) {
        console.error("Error fetching total users:", error);
      }
      
      try {
        const postSnapshot = await getCountFromServer(postsColl);
        setTotalPosts(postSnapshot.data().count);
      } catch (error: any) {
        console.error("Error fetching total posts:", error);
      }

      try {
        const twentyFourHoursAgo = subDays(new Date(), 1);
        const activeUsersQuery = query(
          usersColl,
          where('createdAt', '>', twentyFourHoursAgo.toISOString())
        );
        const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);
        setActiveUsersToday(activeUsersSnapshot.data().count);
      } catch (error) {
        console.error("Error fetching active users:", error);
      }
    };
    fetchCounts();
  }, [firestore]);


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
                let userDate: Date;
                if (user.createdAt instanceof Timestamp) {
                  userDate = user.createdAt.toDate();
                } else if (typeof user.createdAt === 'string') {
                  userDate = new Date(user.createdAt);
                } else {
                  return; // Skip if createdAt is not a recognizable format
                }
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
  

  const handleImpersonate = (targetUser: any) => {
    const userToImpersonate = {
      uid: targetUser.uid,
      email: targetUser.email,
      displayName: targetUser.displayName,
      role: targetUser.role,
      photoURL: targetUser.photoURL
    };
    _injectUser(userToImpersonate);
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
              <div className="text-2xl font-bold">{totalPosts}</div>
              <p className="text-xs text-muted-foreground">Contenido generado por usuarios</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Nuevos (24h)</CardTitle>
              <AreaChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsersToday}</div>
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
                  ) : filteredUsers && filteredUsers.length > 0 ? filteredUsers.map((user: any) => (
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
