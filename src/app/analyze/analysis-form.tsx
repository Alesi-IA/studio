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
      setError('Please select a file to analyze.');
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
                Upload Plant Photo
              </label>
              <div className="flex items-center gap-4">
                 <Input id="plant-photo" type="file" accept="image/*" onChange={handleFileChange} className="flex-grow" />
                 <Button type="submit" disabled={!file || loading} className="shrink-0">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="mr-2 h-4 w-4" />
                    )}
                    Analyze
                  </Button>
              </div>
            </div>

            {previewUrl && (
              <div className="relative aspect-video w-full max-w-md mx-auto overflow-hidden rounded-lg border">
                <Image src={previewUrl} alt="Plant preview" layout="fill" objectFit="contain" />
              </div>
            )}
          </form>

          {loading && (
            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-semibold">AI is analyzing your plant...</p>
              <p className="text-sm">This may take a moment.</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-6 space-y-6">
              <h2 className="text-xl font-headline font-bold text-center">Analysis Results</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Identified Problems
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
                      <p className="text-muted-foreground">No specific problems were identified. Your plant looks healthy!</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Suggestions
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
                       <p className="text-muted-foreground">Keep up the great work!</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!loading && !result && !error && !previewUrl && (
             <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
                <Upload className="h-10 w-10" />
                <p className="font-semibold">Upload a photo to get started</p>
                <p className="text-sm">Our AI will analyze it for common issues.</p>
             </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
