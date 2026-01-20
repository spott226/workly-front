import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmployeeList } from '@/components/employees/EmployeeList';

export default function EmployeesPage() {
  return (
    <DashboardLayout>
      <EmployeeList />
    </DashboardLayout>
  );
}
