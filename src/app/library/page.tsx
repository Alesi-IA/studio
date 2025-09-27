import { PageHeader } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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

export default function LibraryPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Biblioteca de Cultivo"
        description="Tu recurso completo para el cultivo de cannabis."
      />
      <div className="p-4 md:p-8">
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
      </div>
    </div>
  );
}
