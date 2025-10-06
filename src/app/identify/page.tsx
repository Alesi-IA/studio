
import { PageHeader } from '@/components/page-header';
import { AnalysisForm } from './analysis-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, ScanEye } from 'lucide-react';
import { handleStrainIdentification } from './actions';
import { handleAnalysis } from '../analyze/actions';

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
             <AnalysisForm
              analysisType="identify"
              formTitle="Identificar Cepa"
              formDescription="Sube una foto y nuestra IA identificará la cepa, potencia y posibles problemas de tu planta."
              buttonText="Identificar"
              loadingText="La IA está identificando tu cepa..."
              handleAction={handleStrainIdentification}
            />
          </TabsContent>
          <TabsContent value="analyze" className="mt-6">
            <AnalysisForm
              analysisType="analyze"
              formTitle="Analizar Problemas de la Planta"
              formDescription="Sube una foto y nuestra IA la analizará en busca de problemas comunes como plagas o deficiencias."
              buttonText="Analizar"
              loadingText="La IA está analizando tu planta..."
              handleAction={handleAnalysis}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
