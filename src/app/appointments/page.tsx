import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AppointmentList } from '@/components/appointments/AppointmentList';

export default function AppointmentsPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Citas</h1>
      <AppointmentList />
    </DashboardLayout>
  );
}
