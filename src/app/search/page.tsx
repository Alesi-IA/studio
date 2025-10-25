
'use client';

import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Search as SearchIcon, Sprout, Wheat, Grape, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
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
  const { firestore } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<CannaGrowUser[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const searchUsers = async () => {
      if (!firestore || !debouncedSearchTerm.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const usersRef = collection(firestore, 'users');
        const searchTermLower = debouncedSearchTerm.toLowerCase();
        
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        const allUsers: CannaGrowUser[] = [];
        querySnapshot.forEach(doc => {
            // Ensure the document has a uid before pushing
            if (doc.data().uid) {
               allUsers.push({ ...doc.data(), uid: doc.id } as CannaGrowUser);
            }
        });

        const filteredUsers = allUsers.filter(user =>
          user.displayName.toLowerCase().includes(searchTermLower)
        );

        setResults(filteredUsers);
      } catch (error) {
        console.error("Error searching users: ", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearchTerm, firestore]);

  return (
    <div className="w-full">
      <PageHeader
        title="Buscar"
        description="Encuentra a otros cultivadores en la comunidad."
      />
      <div className="p-4 md:p-8">
        <div className="relative mx-auto max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre de usuario..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-8 max-w-xl mx-auto space-y-4">
          {loading && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!loading && debouncedSearchTerm && results.length === 0 && (
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">No se encontraron usuarios</p>
                <p className="text-sm">Intenta con otro término de búsqueda.</p>
            </div>
          )}
          
           {!loading && !debouncedSearchTerm && (
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">Busca y Conecta</p>
                <p className="text-sm">Usa la barra de búsqueda para encontrar amigos, expertos y otros cultivadores.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul className="divide-y divide-border rounded-lg border">
              {results.map((user) => {
                 const rank = getRank(user);
                 return (
                    <li key={user.uid} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.displayName}</p>
                                <Badge variant="outline" className={cn("gap-1 text-xs", rank.badgeClass)}>
                                    <rank.icon className="h-3 w-3" />
                                    {rank.label}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/profile/${user.uid}`}>Ver Perfil</Link>
                        </Button>
                    </li>
                 )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
