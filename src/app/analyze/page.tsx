import { PageHeader } from '@/components/page-header';
import { AnalysisForm } from './analysis-form';

export default function AnalyzePage() {
  return (
    <div className="w-full">
      <PageHeader
        title="Plant Analysis"
        description="Upload a photo of your plant to identify potential issues with our AI."
      />
      <div className="p-4 md:p-8">
        <AnalysisForm />
      </div>
    </div>
  );
}
