'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { Appointment, getAppointments } from '@/lib/appointments';
import { apiFetch } from '@/lib/apiFetch';
import { EmployeeSimpleSelector } from '@/components/employees/EmployeeSimpleSelector';

import { EmployeeSelector } from '@/components/booking/EmployeeSelector';
import { StaffAvailabilityBoard } from '@/components/calendar/StaffAvailabilityBoard';

type Period = 'day' | 'week' | 'month';

type BusinessHours = {
  opening_time: string | null;
  closing_time: string | null;
};

const ZONE = 'America/Mexico_City';

export default function DashboardPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessHours, setBusinessHours] =
    useState<BusinessHours | null>(null);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(DateTime.now().setZone(ZONE));

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [selectedEmployee, setSelectedEmployee] =
    useState<any | null>(null);

  async function loadData() {
    setLoading(true);

    const [appointmentsData, businessData] = await Promise.all([
      getAppointments(),
      apiFetch<any>('/businesses/me'),
    ]);

    setAppointments(
      appointmentsData.filter(a => a.status !== 'CANCELLED')
    );

    setBusinessHours({
      opening_time: businessData.opening_time ?? null,
      closing_time: businessData.closing_time ?? null,
    });

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);

      if (period === 'month') return d.hasSame(date, 'month');
      if (period === 'week')
        return d >= date.startOf('week') && d <= date.endOf('week');

      return d.hasSame(date, 'day');
    });
  }, [appointments, period, date]);

  function moveDate(step: number) {
    if (period === 'day') setDate(d => d.plus({ days: step }));
    if (period === 'week') setDate(d => d.plus({ weeks: step }));
    if (period === 'month') setDate(d => d.plus({ months: step }));
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-gray-500">Cargando agenda…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agenda</h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* CONTROLES */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {(['day', 'week', 'month'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 border rounded ${
              period === p ? 'bg-black text-white' : ''
            }`}
          >
            {p === 'day' && 'Día'}
            {p === 'week' && 'Semana'}
            {p === 'month' && 'Mes'}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => moveDate(-1)}>←</button>
          <span className="font-medium">
            {date.toFormat('dd LLL yyyy')}
          </span>
          <button onClick={() => moveDate(1)}>→</button>
        </div>
      </div>

      {/* CALENDARIO PRINCIPAL */}
      <CalendarView
        appointments={filteredAppointments}
        view={period}
        businessHours={businessHours}
        onAppointmentClick={setSelectedAppointment}
      />

      {/* MODAL */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onChange={() => {
            setSelectedAppointment(null);
            loadData();
          }}
        />
      )}

      {/* DISPONIBILIDAD */}
      <h2 className="text-lg font-semibold mt-12 mb-4">
        Disponibilidad del equipo
      </h2>

      <EmployeeSimpleSelector
  onSelect={(employee) => setSelectedEmployee(employee)}
/>


      {selectedEmployee && businessHours && (
  <StaffAvailabilityBoard
    employee={selectedEmployee}
    appointments={appointments}
    date={date}
    period={period}
    business={businessHours}
  />
)}

    </DashboardLayout>
  );
}
