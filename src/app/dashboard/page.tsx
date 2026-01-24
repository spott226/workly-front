'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { StaffAvailabilityBoard } from '@/components/calendar/StaffAvailabilityBoard';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment } from '@/lib/appointments';

type Business = {
  id: string;
  name: string;
  opening_hour: number;
  closing_hour: number;
};

type Employee = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(DateTime.now());

  useEffect(() => {
    async function load() {
      const biz = await apiFetch<Business>('/businesses/me');
      setBusiness(biz);

      const staff = await apiFetch<Employee[]>('/employees');
      setEmployees(staff);

      const apps = await apiFetch<Appointment[]>('/appointments');
      setAppointments(apps);
    }

    load();
  }, []);

  if (!business) {
    return (
      <DashboardLayout>
        <p>Cargando…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Agenda · {business.name}
        </h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* SELECTOR DÍA */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setDate(d => d.minus({ days: 1 }))}
          className="px-3 py-2 border rounded"
        >
          ←
        </button>

        <span className="font-medium">
          {date.toFormat('dd LLL yyyy')}
        </span>

        <button
          onClick={() => setDate(d => d.plus({ days: 1 }))}
          className="px-3 py-2 border rounded"
        >
          →
        </button>
      </div>

      {/* CALENDARIO */}
      <CalendarView
        appointments={appointments}
        view="day"
      />

      {/* DISPONIBILIDAD */}
      <StaffAvailabilityBoard
        employees={employees}
        appointments={appointments}
        date={date}
        openingHour={business.opening_hour}
        closingHour={business.closing_hour}
      />
    </DashboardLayout>
  );
}
