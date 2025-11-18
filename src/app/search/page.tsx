
'use client';

import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search as SearchIcon, Sprout, Wheat, Grape, Award } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { CannaGrowUser } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const rankConfig = {
  0: { label: 'Brote', icon: Sprout, color: 'text-green-400', badgeClass: 'bg-green-500/10 border-green-500 text-green-400' },
  1: { label: 'Aprendiz', icon: Wheat, color: 'text-yellow-400', badgeClass: 'bg-yellow-500/10 border-yellow-500 text-yellow-400' },
  2: { label: 'Cultivador', icon: Grape, color: 'text-purple-400', badgeClass: 'bg-purple-500/10 border-purple-500 text-purple-400' },
  3: { label: 'Experto', icon: Award, color: 'text-blue-400', badgeClass: 'bg-blue-500/10 border-blue-500 text-blue-400' },
  4: { label: 'Maestro', icon: Award, color: 'text-orange-400', badgeClass: 'bg-orange-500/10 border-orange-500 text-orange-400' },
};

const ownerRank = {
    label: 'Dueño',
    icon: Award,
    color: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
}

const getRank = (user: CannaGrowUser) => {
    if (user?.role === 'owner') return ownerRank;
    const xp = user?.experiencePoints || 0;
    if (xp >= 1000) return rankConfig[4];
    if (xp >= 300) return rankConfig[3];
    if (xp >= 100) return rankConfig[2];
    if (xp >= 20) return rankConfig[1];
    return rankConfig[0];
};

const demoUsers: CannaGrowUser[] = [
    { uid: 'user-2', displayName: 'CultivadorPro', email: 'pro@grower.com', role: 'user', photoURL: 'https://picsum.photos/seed/user-2/128/128', experiencePoints: 250, createdAt: '' },
    { uid: 'user-3', displayName: 'MariaJuana', email: 'mj@grower.com', role: 'user', photoURL: 'https://picsum.photos/seed/user-3/128/128', experiencePoints: 80, createdAt: '' },
    { uid: 'user-4', displayName: 'ElVerde', email: 'verde@grower.com', role: 'user', photoURL: 'https://picsum.photos/seed/user-4/128/128', experiencePoints: 1200, createdAt: '' },
];


// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      // Show all demo users if search is empty
      return demoUsers;
    }
    // Filter users based on search term
    return demoUsers.filter(user => 
        user.displayName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [debouncedSearchTerm]);

  return (
    <div className="w-full">
      <PageHeader
        title="Descubrir"
        description="Encuentra y conecta con otros cultivadores en la comunidad."
      />
      <div className="p-4 md:p-8">
        <div className="relative mx-auto max-w-xl mb-8">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre de usuario..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="max-w-5xl mx-auto">
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredUsers.map((user) => {
                 const rank = getRank(user);
                 return (
                    <Card key={user.uid} className="flex flex-col text-center">
                        <CardHeader>
                            <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20">
                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardTitle className="text-xl">{user.displayName}</CardTitle>
                            <Badge variant="outline" className={cn("gap-1 text-xs mt-2", rank.badgeClass)}>
                                <rank.icon className="h-3 w-3" />
                                {rank.label}
                            </Badge>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`/profile/${user.uid}`}>Ver Perfil</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                 )
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">No se encontraron usuarios</p>
                <p className="text-sm">Intenta con otro término de búsqueda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
