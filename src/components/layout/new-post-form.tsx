
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { db, storage } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    if (!file || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Debes seleccionar una imagen e iniciar sesión.',
      });
      return;
    }
    setLoading(true);
    
    try {
        // 1. Subir imagen a Firebase Storage
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);

        // 2. Crear documento en Firestore
        await addDoc(collection(db, 'posts'), {
            authorId: user.uid,
            authorName: user.displayName,
            authorAvatar: user.photoURL,
            description,
            imageUrl,
            createdAt: serverTimestamp(),
            likes: 0,
            comments: 0
        });

        toast({
            title: '¡Éxito!',
            description: 'Tu publicación ha sido creada.',
        });
        
        onPostCreated();

    } catch (error) {
        console.error("Error al crear la publicación:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
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
      <Button type="submit" disabled={!file || loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? 'Publicando...' : 'Publicar'}
      </Button>
    </form>
  );
}
