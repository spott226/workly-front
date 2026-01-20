'use client';

import { apiFetch } from '@/lib/apiFetch';
import { useUser } from '@/context/UserContext';

export function AttendanceActions() {
  const { user } = useUser();

  if (user?.role !== 'OWNER' && user?.role !== 'STAFF') {
    return null;
  }

  const closeDay = async () => {
    await apiFetch('/employees/attendance/close-day', {
      method: 'POST',
    });
    window.location.reload();
  };

  return (
    <div className="w-full flex justify-end">
     
    </div>
  );
}
