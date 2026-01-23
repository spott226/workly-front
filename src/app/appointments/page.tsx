'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Appointment, getAppointments } from '@/lib/appointments';
import WeekCalendar from '@/components/calendar/WeekCalendar';

export default function AppointmentsPage() {
  const zone = 'America/Mexico_City';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(DateTime.now().setZone(zone));

  useEffect(() => {
    getAppointments().then(setAppointments);
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Citas</h1>

      <WeekCalendar
        startDate={date}
        appointments={appointments}
      />
    </DashboardLayout>
  );
}
