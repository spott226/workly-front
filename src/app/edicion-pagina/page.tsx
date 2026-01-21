'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {BusinessPublicEditor} from '@/components/business/BusinessPublicEditor';

export default function EdicionPaginaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Edición de página pública
        </h1>

        <p className="text-sm text-gray-500">
          Personaliza cómo ven tu negocio los clientes al agendar.
        </p>

        <BusinessPublicEditor />
      </div>
    </DashboardLayout>
  );
}
