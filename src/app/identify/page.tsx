
import { PageHeader } from '@/components/page-header';
import { StrainIdentificationForm } from './strain-identification-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisForm } from './analysis-form';
import { Bot, ScanEye } from 'lucide-react';

export default function IdentifyPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Asistente IA de Cultivo"
        description="Identifica cepas y analiza problemas de tus plantas con nuestra IA."
      />
      <div className="p-4 md:p-8">
        <Tabs defaultValue="identify" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="identify">
              <ScanEye className="mr-2 h-4 w-4" />
              Identificar Cepa
            </TabsTrigger>
            <TabsTrigger value="analyze">
              <Bot className="mr-2 h-4 w-4" />
              Analizar Problemas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="identify" className="mt-6">
            <StrainIdentificationForm />
          </TabsContent>
          <TabsContent value="analyze" className="mt-6">
            <AnalysisForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
