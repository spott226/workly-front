import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Hoy</h1>
      <p className="text-gray-500 mt-2">
        Aquí van las citas del día.
      </p>
      <button className="mt-4 px-4 py-2 bg-black text-white rounded">
        Crear cita
      </button>
    </DashboardLayout>
  );
}
