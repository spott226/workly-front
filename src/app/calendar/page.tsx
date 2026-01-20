import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarStatus } from '@/components/calendar/CalendarStatus';
import { mockUser } from '@/mocks/user';

export default function CalendarPage() {
  const allowed =
    mockUser.plan === 'PRO' || mockUser.plan === 'ENTERPRISE';

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Google Calendar</h1>

      {allowed ? (
        <CalendarStatus />
      ) : (
        <p className="text-gray-500">
          Google Calendar está disponible solo para planes PRO y
          ENTERPRISE.
        </p>
      )}
    </DashboardLayout>
  );
}
