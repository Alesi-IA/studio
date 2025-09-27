
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Settings, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const userPosts = PlaceHolderImages.filter((img) =>
    img.id.startsWith('feed-')
  ).slice(0, 9);
  return (
    <div className="w-full">
      <PageHeader
        title="Perfil"
        description="Tu espacio personal en CannaConnect."
      />
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/50">
            <AvatarImage src="https://picsum.photos/seed/user0/128/128" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <h2 className="font-headline text-2xl font-bold">grower_handle_0</h2>
              <Badge variant="destructive" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                Administrador
              </Badge>
              <div className="flex items-center gap-2">
                <Button variant="outline">Editar Perfil</Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center gap-6 md:justify-start">
              <div className="text-center">
                <p className="font-bold">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
              </div>
              <div className="text-center">
                <p className="font-bold">1.2k</p>
                <p className="text-sm text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold">142</p>
                <p className="text-sm text-muted-foreground">Siguiendo</p>
              </div>
            </div>
            <p className="text-sm">
              Dueño y operador de CannaConnect. Cultivador apasionado desde 2010. Especializado en técnicas de
              suelo vivo y orgánico. ¡Aquí para compartir conocimientos y ver
              sus hermosas plantas! 🌿
            </p>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Mis Publicaciones</TabsTrigger>
            <TabsTrigger value="saved">Guardados</TabsTrigger>
            <TabsTrigger value="tagged">Etiquetados</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden rounded-md"
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.description}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={post.imageHint}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">No hay publicaciones guardadas</p>
                <p className="text-sm">Las publicaciones que guardes aparecerán aquí.</p>
            </div>
          </TabsContent>
          <TabsContent value="tagged" className="mt-6">
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">No hay publicaciones etiquetadas</p>
                <p className="text-sm">Cuando la gente te etiquete en publicaciones, aparecerán aquí.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
