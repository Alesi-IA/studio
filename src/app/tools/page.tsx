
'use client';
import { PageHeader } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import React from 'react';

const guides = [
  {
    title: 'Guía para Principiantes de Cultivo de Cannabis',
    content: 'Desde la semilla hasta la cosecha, esta guía cubre todos los conceptos básicos que necesitas para comenzar tu primer cultivo. Aprende sobre iluminación, suelo, riego y más.',
  },
  {
    title: 'Manejo Avanzado de Nutrientes',
    content: 'Comprende el papel de los macronutrientes (N-P-K) y micronutrientes. Aprende a diagnosticar y tratar deficiencias y toxicidades.',
  },
  {
    title: 'Control de Plagas y Enfermedades',
    content: 'Una guía completa para identificar y eliminar plagas comunes como los ácaros araña y los mosquitos de los hongos, y enfermedades como el oídio.',
  },
  {
    title: 'Cosecha, Secado y Curado',
    content: 'El momento de la cosecha es crucial. Aprende las mejores técnicas para secar y curar tus cogollos para maximizar la potencia y el sabor.',
  },
];

const dictionary = [
    {
      term: 'Cannabinoides',
      definition: 'Compuestos químicos que se encuentran en la planta de cannabis, como el THC y el CBD, que interactúan con los receptores del cuerpo humano.',
    },
    {
      term: 'Terpenos',
      definition: 'Aceites aromáticos que dan a las variedades de cannabis sabores distintivos como cítricos, bayas, menta y pino. También juegan un papel en los efectos de la planta.',
    },
    {
      term: 'Tricomas',
      definition: 'Las glándulas cristalinas en la superficie de las flores de cannabis que producen y almacenan cannabinoides y terpenos. Parecen pequeños pelos o champiñones.',
    },
    {
      term: 'Semillas Feminizadas',
      definition: 'Semillas de cannabis que se crían específicamente para eliminar los cromosomas masculinos, asegurando que cada planta cultivada a partir de ellas sea hembra y produzca cogollos.',
    },
  ];

const tasks = [
    { id: 'task1', label: 'Regar plantas (pH 6.5)', completed: true },
    { id: 'task2', label: 'Revisar plagas/enfermedades', completed: false },
    { id: 'task3', label: 'Mezclar nutrientes (Etapa vegetativa)', completed: true },
    { id: 'task4', label: 'Podar hojas bajas', completed: false },
    { id_ts: 'task5', label: 'Rotar macetas para luz uniforme', completed: false },
];


export default function ToolsPage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (
        <div className="w-full">
            <PageHeader
                title="Calendario y Tareas"
                description="Tu centro de mando para un cultivo exitoso."
            />
            <div className="p-4 md:p-8">
                <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="calendar">Calendario</TabsTrigger>
                        <TabsTrigger value="library">Biblioteca</TabsTrigger>
                    </TabsList>
                    <TabsContent value="calendar" className="mt-6">
                        <div className="grid gap-8 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardContent className="p-2 md:p-6">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="flex justify-center"
                                    modifiers={{
                                        germination: [new Date(2024, 5, 8), new Date(2024, 5, 9)],
                                        vegetative: { from: new Date(2024, 5, 10), to: new Date(2024, 6, 15) },
                                        flowering: { from: new Date(2024, 6, 16), to: new Date() },
                                    }}
                                    modifiersStyles={{
                                        germination: { color: 'hsl(var(--accent-foreground))', backgroundColor: 'hsl(var(--accent))' },
                                        vegetative: { color: 'hsl(var(--primary-foreground))', backgroundColor: 'hsl(var(--primary))' },
                                        flowering: { color: 'hsl(var(--secondary-foreground))', backgroundColor: 'hsl(var(--secondary))' },
                                    }}
                                />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Tareas de Hoy</CardTitle>
                                    <Button size="sm">
                                        <Plus className="-ml-1 h-4 w-4" />
                                        Nueva
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                <div className="space-y-4">
                                    {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center space-x-3">
                                        <Checkbox id={task.id} defaultChecked={task.completed} />
                                        <label
                                        htmlFor={task.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                        {task.label}
                                        </label>
                                    </div>
                                    ))}
                                </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value="library" className="mt-6">
                        <Tabs defaultValue="guides" className="w-full">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <TabsList>
                                <TabsTrigger value="guides">Guías</TabsTrigger>
                                <TabsTrigger value="articles">Artículos</TabsTrigger>
                                <TabsTrigger value="dictionary">Diccionario</TabsTrigger>
                                </TabsList>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar en la biblioteca..." className="pl-9" />
                                </div>
                            </div>
                            <TabsContent value="guides" className="mt-6">
                                <Accordion type="single" collapsible className="w-full">
                                {guides.map((guide, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>{guide.title}</AccordionTrigger>
                                    <AccordionContent>{guide.content}</AccordionContent>
                                    </AccordionItem>
                                ))}
                                </Accordion>
                            </TabsContent>
                            <TabsContent value="articles" className="mt-6">
                                <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                                    <p className="font-semibold">Artículos Próximamente</p>
                                    <p className="text-sm">Estamos seleccionando una colección de artículos de cultivadores expertos.</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="dictionary" className="mt-6">
                                <Accordion type="multiple" className="w-full">
                                    {dictionary.map((item, index) => (
                                        <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>{item.term}</AccordionTrigger>
                                        <AccordionContent>{item.definition}</AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
