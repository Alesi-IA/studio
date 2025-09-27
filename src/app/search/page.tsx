
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Buscar"
        description="Encuentra a otros cultivadores en la comunidad."
      />
      <div className="p-4 md:p-8">
        <div className="relative mx-auto max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre de usuario..." className="pl-9" />
        </div>
        <div className="mt-8 text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg max-w-xl mx-auto">
            <p className="font-semibold">Busca y Conecta</p>
            <p className="text-sm">Usa la barra de búsqueda para encontrar amigos, expertos y otros cultivadores.</p>
        </div>
      </div>
    </div>
  );
}
