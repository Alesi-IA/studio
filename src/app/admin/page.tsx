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
import { useFirebase, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, getCountFromServer, Timestamp } from 'firebase/firestore';
import { subMonths, format } from 'date-fns';
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


export default function AdminPage() {
  const { _injectUser, user: currentUser, isOwner } = useAuth();
  const { firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);

  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  
  const { data: usersData, isLoading: isLoadingUsers } = useCollection(usersQuery);

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
        if (error.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({
            operation: 'list', // getCountFromServer is a 'list' like operation for rules
            path: usersColl.path,
          });
          errorEmitter.emit('permission-error', contextualError);
        }
      }
      
      try {
        const postSnapshot = await getCountFromServer(postsColl);
        setTotalPosts(postSnapshot.data().count);
      } catch (error: any) {
        if (error.code === 'permission-denied') {
            const contextualError = new FirestorePermissionError({
                operation: 'list',
                path: postsColl.path,
            });
            errorEmitter.emit('permission-error', contextualError);
        }
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
                let userDate;
                if (user.createdAt instanceof Timestamp) {
                  userDate = user.createdAt.toDate();
                } else if (typeof user.createdAt === 'string') {
                  userDate = new Date(user.createdAt);
                } else {
                  return;
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
              <CardTitle className="text-sm font-medium">Usuarios Activos Hoy</CardTitle>
              <AreaChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">(Funcionalidad Próximamente)</p>
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
                  ) : usersData && usersData.length > 0 ? usersData.map((user: any) => (
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
                            {user.role}
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
