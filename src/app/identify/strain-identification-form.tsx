
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleStrainIdentification } from './actions';
import { AlertTriangle, Bot, BrainCircuit, Droplets, Edit, Leaf, Loader2, ScanEye, Send, Upload } from 'lucide-react';
import type { IdentifyStrainOutput } from '@/ai/flows/identify-strain';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

function PotencyBar({ label, value, colorClass, icon: Icon }: { label: string, value: number, colorClass: string, icon: React.ElementType }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <div className='flex items-center gap-2'>
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-sm font-bold">{value}%</span>
            </div>
            <Progress value={value} className={`h-2 [&>div]:bg-gradient-to-r ${colorClass}`} />
        </div>
    )
}

export function StrainIdentificationForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [result, setResult] = useState<IdentifyStrainOutput | null>(null);
  const [editedStrainName, setEditedStrainName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      setIsEditing(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !previewUrl) {
      setError('Por favor, selecciona un archivo para analizar.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await handleStrainIdentification(previewUrl);

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setResult(response.data);
      setEditedStrainName(response.data.strainName);
    }

    setLoading(false);
  };
  
  const handleSaveStrainName = () => {
      if (result) {
          setResult({ ...result, strainName: editedStrainName });
          setIsEditing(false);
      }
  };

  const handleShareToFeed = async () => {
    if (!result || !previewUrl || !user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No hay resultados que compartir o no has iniciado sesión.',
        });
        return;
    }

    setSharing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        const description = `¡Miren esta cepa que identifiqué con la IA! La IA dice que es una ${result.strainName}.`;
        const newPost = {
            id: `mock-post-${Date.now()}`,
            authorId: user.uid,
            authorName: user.displayName,
            authorAvatar: user.photoURL,
            description,
            strain: result.strainName,
            imageUrl: previewUrl,
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: 0,
        };

        const existingPosts = JSON.parse(sessionStorage.getItem('mockPosts') || '[]');
        sessionStorage.setItem('mockPosts', JSON.stringify([newPost, ...existingPosts]));
        window.dispatchEvent(new Event('storage'));

        toast({
            title: '¡Compartido!',
            description: 'Tu identificación ha sido publicada en el feed.',
        });
        
        router.push('/');

    } catch (error) {
        console.error("Error al compartir la publicación (simulado):", error);
        toast({
            variant: 'destructive',
            title: 'Error al compartir',
            description: 'No se pudo crear la publicación. Por favor, inténtalo de nuevo.',
        });
    } finally {
        setSharing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="plant-photo" className="text-sm font-medium">
                Sube la foto de la planta
              </label>
              <div className="flex items-center gap-4">
                 <Input id="plant-photo" type="file" accept="image/*" onChange={handleFileChange} className="flex-grow" />
                 <Button type="submit" disabled={!file || loading} className="shrink-0">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ScanEye className="mr-2 h-4 w-4" />
                    )}
                    Identificar
                  </Button>
              </div>
            </div>

            {previewUrl && (
              <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border">
                <Image src={previewUrl} alt="Vista previa de la planta" fill objectFit="contain" />
              </div>
            )}
          </form>

          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-semibold">La IA está identificando tu cepa...</p>
              <p className="text-sm">Esto puede tomar un momento.</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Falló la identificación</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-6 space-y-8">
              <div className='text-center'>
                  {isEditing ? (
                      <div className='flex items-center justify-center gap-2'>
                        <Input value={editedStrainName} onChange={(e) => setEditedStrainName(e.target.value)} className="text-2xl font-bold font-headline text-center max-w-sm h-auto p-1" />
                        <Button onClick={handleSaveStrainName}>Guardar</Button>
                      </div>
                  ) : (
                      <div className='flex items-center justify-center gap-2'>
                        <h2 className="text-2xl font-headline font-bold">{result.strainName}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                  )}
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className='h-5 w-5 text-purple-400' />
                        Potencia Estimada
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <PotencyBar label="THC" value={result.potency.thc} colorClass="from-green-400 to-green-600" icon={Leaf} />
                     <PotencyBar label="CBD" value={result.potency.cbd} colorClass="from-blue-400 to-blue-600" icon={Droplets} />
                     <PotencyBar label="Energía (Hype)" value={result.potency.energy} colorClass="from-yellow-400 to-orange-500" icon={Bot} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Posibles Problemas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.problems.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {result.problems.map((problem, index) => (
                           <li key={index}>{problem}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">¡No se han detectado problemas! Tu planta parece estar en buen estado.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

               <div className="mt-8 flex justify-center">
                <Button onClick={handleShareToFeed} disabled={sharing}>
                  {sharing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {sharing ? 'Compartiendo...' : 'Compartir en el Feed'}
                </Button>
              </div>
            </div>
          )}

          {!loading && !result && !error && !previewUrl && (
             <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <Upload className="h-10 w-10" />
                <p className="font-semibold">Sube una foto para empezar</p>
                <p className="text-sm">Nuestra IA identificará la cepa, potencia y salud de tu planta.</p>
             </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
