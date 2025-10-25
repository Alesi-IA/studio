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
import { useFirebase } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


type AnalysisResult = any;

interface AnalysisFormProps {
  analysisType: 'identify' | 'analyze';
  formTitle: string;
  formDescription: string;
  buttonText: string;
  loadingText: string;
  handleAction: (photoDataUri: string) => Promise<{ data: AnalysisResult | null; error: string | null }>;
}

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
  const { user, addExperience } = useAuth();
  const { storage, firestore } = useFirebase();
  const router = useRouter();


  const handleSaveStrainName = () => {
    if (result) {
      result.strainName = editedStrainName;
      setIsEditing(false);
      toast({ title: '¡Guardado!', description: 'El nombre de la cepa ha sido actualizado.' });
    }
  };

  const handleShareToFeed = async () => {
    if (!result || !result.imageUrl || !user || !storage || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No hay resultados que compartir o no has iniciado sesión.',
      });
      return;
    }

    setSharing(true);

    try {
        // 1. Convert Data URI to Blob for upload
        const fetchRes = await fetch(result.imageUrl);
        const blob = await fetchRes.blob();
        const file = new File([blob], `ai-analysis-${Date.now()}.jpg`, { type: blob.type });

        // 2. Upload image to Firebase Storage
        const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const permanentImageUrl = await getDownloadURL(uploadResult.ref);

        // 3. Create post document in Firestore
        const caption = `¡Miren esta cepa que identifiqué con la IA! La IA dice que es una ${result.strainName}.`;
        const postsCollectionRef = collection(firestore, 'posts');
        await addDoc(postsCollectionRef, {
            authorId: user.uid,
            authorName: user.displayName,
            authorAvatar: user.photoURL,
            description: caption,
            imageUrl: permanentImageUrl,
            strain: result.strainName,
            createdAt: serverTimestamp(),
            likes: 0,
            awards: 0,
            comments: [],
        });
      
      addExperience(user.uid, 20);

      toast({
        title: '¡Compartido!',
        description: 'Tu identificación ha sido publicada en el feed (+20 XP).',
      });

      router.push('/');
    } catch (error) {
      console.error("Error al compartir la publicación:", error);
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
    if (!previewUrl) {
      setError('Por favor, selecciona un archivo para analizar.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const imageToSend = previewUrl;
    
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
