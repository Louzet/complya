import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Complya',
};

/**
 * Page Dashboard — Placeholder Alpha A01
 * La logique métier (obligations, échéances) sera ajoutée en A04+
 */
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Plateforme de conformité fiscale CEMAC — Alpha v0.1
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-sm text-gray-500">
          Modules à venir : DGI · CNSS · CNAMGS · Paie · OCR Documents
        </p>
      </div>
    </div>
  );
}
