'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { StaffAvailabilityBoard } from '@/components/calendar/StaffAvailabilityBoard';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment } from '@/lib/appointments';

type Employee = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [date, setDate] = useState(DateTime.now());

  useEffect(() => {
    apiFetch<Appointment[]>('/appointments').then(setAppointments);
    apiFetch<Employee[]>('/employees').then(setEmployees);
  }, []);

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* CONTROLES DE FECHA */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setDate(d => d.minus({ days: 1 }))}
          className="px-3 py-1 border rounded"
        >
          ←
        </button>

        <span className="font-medium">
          {date.toFormat('dd LLL yyyy')}
        </span>

        <button
          onClick={() => setDate(d => d.plus({ days: 1 }))}
          className="px-3 py-1 border rounded"
        >
          →
        </button>
      </div>

      {/* CALENDARIO */}
      <CalendarView
        appointments={appointments}
        view="day"
      />

      {/* DISPONIBILIDAD ABAJO */}
      <StaffAvailabilityBoard
        employees={employees}
        appointments={appointments}
        date={date}
      />
    </DashboardLayout>
  );
}
