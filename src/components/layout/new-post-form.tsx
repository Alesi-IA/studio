
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

interface NewPostFormProps {
  onPostCreated: () => void;
}

export function NewPostForm({ onPostCreated }: NewPostFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!file) {
      alert('Por favor, selecciona una imagen.');
      return;
    }
    setLoading(true);
    // Simular la subida de un post
    console.log('Creando nuevo post:', {
      fileName: file.name,
      description: description,
    });

    // En una aplicación real, aquí llamarías a una API para guardar el post.
    // Para esta demostración, solo cerramos el diálogo después de una pequeña demora.
    setTimeout(() => {
      setLoading(false);
      onPostCreated();
      // Idealmente, también refrescarías el feed para mostrar el nuevo post.
      // Como no tenemos un estado global o una API, esto es una simulación.
      window.location.reload(); 
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="space-y-2">
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
