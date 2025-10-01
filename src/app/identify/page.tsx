import { PageHeader } from '@/components/page-header';
import { StrainIdentificationForm } from './strain-identification-form';

export default function IdentifyPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Identificador de Cepas"
        description="Sube una foto de tu planta y deja que nuestra IA la identifique por ti."
      />
      <div className="p-4 md:p-8">
        <StrainIdentificationForm />
      </div>
    </div>
  );
}
