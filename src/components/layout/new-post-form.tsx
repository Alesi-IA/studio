
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface NewPostFormProps {
  onPostCreated: () => void;
}

export function NewPostForm({ onPostCreated }: NewPostFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, createPost } = useAuth();
  const { storage } = useFirebase();
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
    if (!file || !user || !storage) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar una imagen e iniciar sesión.',
      });
      return;
    }
    setLoading(true);
    
    try {
        // 1. Upload image to Firebase Storage
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(uploadResult.ref);

        // 2. Create post document via AuthProvider, which handles XP
        await createPost(description, imageUrl);

        toast({
            title: '¡Éxito!',
            description: 'Tu publicación ha sido creada (+10 XP).',
        });
        
        onPostCreated();

    } catch (error) {
        console.error("Error creating post:", error);
        toast({
            variant: 'destructive',
            title: 'Error al crear la publicación',
            description: 'No se pudo crear la publicación. Por favor, inténtalo de nuevo.',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-4">
        <label htmlFor="picture" className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/50 hover:bg-muted/80 transition-colors">
          {previewUrl ? (
            <Image src={previewUrl} alt="Vista previa" fill className="object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <UploadCloud className="h-10 w-10" />
              <p className="font-semibold">Sube una foto</p>
              <p className="text-sm">Arrastra y suelta o haz clic para subir</p>
            </div>
          )}
        </label>
        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
      </div>
      <div className="space-y-2">
        <Textarea
          id="description"
          placeholder="Añade una descripción a tu publicación..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>
      <Button type="submit" disabled={!file || loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Publicando...' : 'Publicar'}
      </Button>
    </form>
  );
}
