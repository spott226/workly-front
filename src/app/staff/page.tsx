'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StaffList } from '@/components/staff/StaffList';

export default function StaffPage() {
  return (
    <DashboardLayout>
      <StaffList />
    </DashboardLayout>
  );
}
