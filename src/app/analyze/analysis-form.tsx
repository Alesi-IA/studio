'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleAnalysis } from './actions';
import { AlertTriangle, Bot, Lightbulb, Loader2, Upload } from 'lucide-react';
import type { AnalyzePlantOutput } from '@/ai/flows/analyze-plant-for-problems';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function AnalysisForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzePlantOutput | null>(null);
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
    if (!file || !previewUrl) {
      setError('Por favor, selecciona un archivo para analizar.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await handleAnalysis(previewUrl);

    if (response.error) {
      setError(response.error);
    } else {
      setResult(response.data);
    }

    setLoading(false);
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
                      <Bot className="mr-2 h-4 w-4" />
                    )}
                    Analizar
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
              <p className="font-semibold">La IA está analizando tu planta...</p>
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

          {result && (
            <div className="mt-6 space-y-6">
              <h2 className="text-xl font-headline font-bold text-center">Resultados del Análisis</h2>
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
                      <Accordion type="single" collapsible className="w-full">
                        {result.problems.map((problem, index) => (
                           <AccordionItem value={`problem-${index}`} key={index}>
                             <AccordionTrigger>{problem.split(':')[0]}</AccordionTrigger>
                             <AccordionContent>{problem.split(':')[1] || problem}</AccordionContent>
                           </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-muted-foreground">No se identificaron problemas específicos. ¡Tu planta parece sana!</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Sugerencias
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {result.suggestions.length > 0 ? (
                       <Accordion type="single" collapsible className="w-full">
                        {result.suggestions.map((suggestion, index) => (
                           <AccordionItem value={`suggestion-${index}`} key={index}>
                             <AccordionTrigger>{suggestion.split(':')[0]}</AccordionTrigger>
                             <AccordionContent>{suggestion.split(':')[1] || suggestion}</AccordionContent>
                           </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                       <p className="text-muted-foreground">¡Sigue con el buen trabajo!</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!loading && !result && !error && !previewUrl && (
             <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <Upload className="h-10 w-10" />
                <p className="font-semibold">Sube una foto para empezar</p>
                <p className="text-sm">Nuestra IA la analizará en busca de problemas comunes.</p>
             </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
