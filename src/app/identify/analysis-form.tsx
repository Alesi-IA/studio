'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Bot, BrainCircuit, Droplets, Edit, Leaf, Lightbulb, Loader2, ScanEye, Send, Upload, Save } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type AnalysisResult = any;

interface AnalysisFormProps {
  analysisType: 'identify' | 'analyze';
  formTitle: string;
  formDescription: string;
  buttonText: string;
  loadingText: string;
  handleAction: (photoDataUri: string) => Promise<{ data: AnalysisResult | null; error: string | null }>;
}

// Hardcoded test image in Base64 format. This is a public domain image.
const TEST_IMAGE_DATA_URI = 'data:image/jpeg;base64,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KBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSlKBSl-ofle-f-1-d698c4-a5e2f3d53b21/9k=';

function PotencyBar({ label, value, colorClass, icon: Icon }: { label: string; value: number; colorClass: string; icon: React.ElementType }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <Progress value={value} className={`h-2 [&>div]:bg-gradient-to-r ${colorClass}`} />
    </div>
  );
}

function IdentificationResult({ result }: { result: any }) {
  const [editedStrainName, setEditedStrainName] = useState(result.strainName);
  const [isEditing, setIsEditing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const handleSaveStrainName = () => {
    if (result) {
      result.strainName = editedStrainName;
      setIsEditing(false);
      toast({ title: '¡Guardado!', description: 'El nombre de la cepa ha sido actualizado.' });
    }
  };

  const handleShareToFeed = async () => {
    if (!result || !result.imageUrl || !user) {
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
        imageUrl: result.imageUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
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
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Cepa Identificada</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-4">
            {isEditing ? (
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input value={editedStrainName} onChange={(e) => setEditedStrainName(e.target.value)} className="text-xl font-bold font-headline text-center h-auto p-2" />
                <Button onClick={handleSaveStrainName} size="icon"><Save className="h-4 w-4"/></Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-headline font-bold">{editedStrainName}</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            )}
          </CardContent>
          <div className="p-6 border-t">
              <Button onClick={handleShareToFeed} disabled={sharing} className="w-full">
                {sharing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {sharing ? 'Compartiendo...' : 'Compartir en el Feed'}
              </Button>
            </div>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
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
                <CardTitle className="text-xl font-headline flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Posibles Problemas
                </CardTitle>
            </CardHeader>
            <CardContent>
              {result.problems.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {result.problems.map((problem: string, index: number) => (
                    <li key={index}>{problem}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">¡No se han detectado problemas! Tu planta parece estar en buen estado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AnalysisResultDisplay({ result }: { result: any }) {
  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-2xl font-headline font-bold text-center">Resultados del Análisis</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Problemas Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.problems.length > 0 ? (
              <ul className="list-disc list-inside space-y-1">
                {result.problems.map((problem: string, index: number) => (
                  <li key={index}>{problem}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No se identificaron problemas específicos. ¡Tu planta parece sana!</p>
            )}
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    Sugerencias de Tratamiento
                </CardTitle>
            </CardHeader>
          <CardContent>
            {result.suggestions.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {result.suggestions.map((suggestion: string, index: number) => {
                  const parts = suggestion.split(/:(.*)/s);
                  const title = parts[0];
                  const content = parts[1] ? parts[1].trim() : 'No hay más detalles.';
                  return (
                    <AccordionItem value={`suggestion-${index}`} key={index}>
                      <AccordionTrigger>{title}</AccordionTrigger>
                      <AccordionContent>{content}</AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            ) : (
              <p className="text-muted-foreground">¡Sigue con el buen trabajo! No se necesitan acciones.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export function AnalysisForm({ analysisType, formTitle, formDescription, buttonText, loadingText, handleAction }: AnalysisFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file && !TEST_IMAGE_DATA_URI) {
      setError('Por favor, selecciona un archivo para analizar.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // For debugging purposes, we'll use the hardcoded test image.
    const imageToSend = TEST_IMAGE_DATA_URI;
    
    // In a real scenario, you would use the user's uploaded image:
    // const imageToSend = previewUrl;
    
    // We also check if the image to send is valid
    if (!imageToSend) {
        setError('No se pudo procesar la imagen para el análisis.');
        setLoading(false);
        return;
    }

    const response = await handleAction(imageToSend);

    if (response.error) {
      setError(response.error);
    } else {
        if (analysisType === 'identify' && response.data) {
            // For the identification result, we still want to show the user's uploaded image preview
            setResult({ ...response.data, imageUrl: previewUrl });
        } else {
            setResult(response.data);
        }
    }

    setLoading(false);
  };

  const Icon = analysisType === 'identify' ? ScanEye : Bot;

  return (
    <div className="mx-auto max-w-5xl">
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor={`plant-photo-${analysisType}`} className="text-sm font-medium leading-none">
                      Sube una foto de la planta
                    </label>
                    <div className="flex items-center gap-4">
                      <Input id={`plant-photo-${analysisType}`} type="file" accept="image/*" onChange={handleFileChange} className="flex-grow" />
                      <Button type="submit" disabled={!file || loading} className="shrink-0">
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="mr-2 h-4 w-4" />
                        )}
                        {buttonText}
                      </Button>
                    </div>
                  </div>
                </form>
                {previewUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                        <Image src={previewUrl} alt="Vista previa de la planta" fill objectFit="contain" />
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 aspect-video">
                        <Upload className="h-10 w-10" />
                        <p className="font-semibold">Sube una foto para empezar</p>
                        <p className="text-sm">{formDescription}</p>
                    </div>
                )}
            </div>

            <div className="min-h-[300px]">
              {loading && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="font-semibold">{loadingText}</p>
                  <p className="text-sm">Esto puede tomar un momento.</p>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Falló el análisis</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && !loading && (
                analysisType === 'identify'
                  ? <IdentificationResult result={result} />
                  : <AnalysisResultDisplay result={result} />
              )}

              {!loading && !result && !error && (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground bg-muted/50 rounded-lg p-8">
                  <BrainCircuit className="h-12 w-12 mb-4" />
                  <p className="font-semibold">Esperando análisis</p>
                  <p className="text-sm">Los resultados de la IA aparecerán aquí.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
