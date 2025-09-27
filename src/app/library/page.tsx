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
    title: 'Beginner\'s Guide to Cannabis Cultivation',
    content: 'From seed to harvest, this guide covers all the basics you need to start your first grow. Learn about lighting, soil, watering, and more.',
  },
  {
    title: 'Advanced Nutrient Management',
    content: 'Understand the role of macronutrients (N-P-K) and micronutrients. Learn how to diagnose and treat deficiencies and toxicities.',
  },
  {
    title: 'Pest and Disease Control',
    content: 'A comprehensive guide to identifying and eliminating common pests like spider mites and fungus gnats, and diseases like powdery mildew.',
  },
  {
    title: 'Harvesting, Drying & Curing',
    content: 'Timing your harvest is crucial. Learn the best techniques for drying and curing your buds to maximize potency and flavor.',
  },
];

const dictionary = [
    {
      term: 'Cannabinoids',
      definition: 'Chemical compounds found in the cannabis plant, such as THC and CBD, that interact with receptors in the human body.',
    },
    {
      term: 'Terpenes',
      definition: 'Aromatic oils that give cannabis varieties distinctive flavors like citrus, berry, mint, and pine. They also play a role in the effects of the plant.',
    },
    {
      term: 'Trichomes',
      definition: 'The crystal-like glands on the surface of cannabis flowers that produce and store cannabinoids and terpenes. They look like tiny hairs or mushrooms.',
    },
    {
      term: 'Feminized Seeds',
      definition: 'Cannabis seeds that are specifically bred to eliminate male chromosomes, ensuring that every plant grown from them will be female and produce buds.',
    },
  ];

export default function LibraryPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Grow Library"
        description="Your comprehensive resource for cannabis cultivation."
      />
      <div className="p-4 md:p-8">
        <Tabs defaultValue="guides" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <TabsList>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="dictionary">Dictionary</TabsTrigger>
            </TabsList>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search library..." className="pl-9" />
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
                <p className="font-semibold">Articles Coming Soon</p>
                <p className="text-sm">We are curating a collection of articles from expert growers.</p>
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
