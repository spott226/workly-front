import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServiceList } from '@/components/services/ServiceList';

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <ServiceList />
    </DashboardLayout>
  );
}
