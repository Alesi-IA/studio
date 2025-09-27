import { PageHeader } from '@/components/page-header';
import { AnalysisForm } from './analysis-form';

export default function AnalyzePage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Análisis de Planta"
        description="Sube una foto de tu planta para identificar posibles problemas con nuestra IA."
      />
      <div className="p-4 md:p-8">
        <AnalysisForm />
      </div>
    </div>
  );
}
