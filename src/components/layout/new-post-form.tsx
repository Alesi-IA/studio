
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';


interface NewPostFormProps {
  onPostCreated: () => void;
}

export function NewPostForm({ onPostCreated }: NewPostFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar una imagen e iniciar sesión.',
      });
      return;
    }
    setLoading(true);
    
    // Simulate a delay for network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const newPost = {
            id: `mock-post-${Date.now()}`,
            authorId: user.uid,
            authorName: user.displayName,
            authorAvatar: user.photoURL,
            description,
            imageUrl: previewUrl,
            createdAt: new Date().toISOString(),
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20),
        };

        // In a real app, you'd send this to a server. Here we save to session storage.
        const existingPosts = JSON.parse(sessionStorage.getItem('mockPosts') || '[]');
        sessionStorage.setItem('mockPosts', JSON.stringify([newPost, ...existingPosts]));

        // Dispatch a custom event to notify the feed to update
        window.dispatchEvent(new Event('storage'));

        toast({
            title: '¡Éxito! (Simulado)',
            description: 'Tu publicación ha sido creada.',
        });
        
        onPostCreated();

    } catch (error) {
        console.error("Error al crear la publicación (simulado):", error);
        toast({
            variant: 'destructive',
            title: 'Error (Simulado)',
            description: 'No se pudo crear la publicación. Por favor, inténtalo de nuevo.',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="space-y-2">
        <label htmlFor="picture" className="cursor-pointer">
            {previewUrl ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-md">
                <Image src={previewUrl} alt="Vista previa" fill className="object-cover" />
              </div>
            ) : (
              <div className="flex justify-center items-center flex-col gap-2 h-64 border-2 border-dashed rounded-md">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">Arrastra y suelta o haz clic para subir</p>
              </div>
            )}
        </label>
        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
         <Button asChild variant="outline" className="w-full cursor-pointer">
            <label htmlFor="picture">
                {file ? "Cambiar imagen" : "Seleccionar imagen"}
            </label>
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Añade una descripción a tu publicación..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={!previewUrl || loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Publicando...' : 'Publicar'}
      </Button>
    </form>
  );
}
