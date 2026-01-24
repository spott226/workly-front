'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CalendarView } from '@/components/calendar/CalendarView';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';

import { Appointment, getAppointments } from '@/lib/appointments';
import { apiFetch } from '@/lib/apiFetch';

/* =========================
   TYPES
========================= */
type Period = 'day' | 'week' | 'month';

type BusinessHours = {
  opening_time: string | null;
  closing_time: string | null;
};

type EmployeeRaw = {
  id: string;
  first_name: string;
  last_name: string;
};

type Employee = {
  id: string;
  name: string;
};

const ZONE = 'America/Mexico_City';

/* =========================
   PAGE
========================= */
export default function DashboardPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState<string | null>(null);

  const [businessHours, setBusinessHours] =
    useState<BusinessHours | null>(null);

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(DateTime.now().setZone(ZONE));

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  /* =========================
     LOAD DATA
  ========================= */
  async function loadData() {
    setLoading(true);

    const [appointmentsData, businessData, employeesData] =
      await Promise.all([
        getAppointments(),
        apiFetch<any>('/businesses/me'),
        apiFetch<EmployeeRaw[]>('/employees'),
      ]);

    setAppointments(
      appointmentsData.filter(a => a.status !== 'CANCELLED')
    );

    setBusinessHours({
      opening_time: businessData.opening_time ?? null,
      closing_time: businessData.closing_time ?? null,
    });

    const normalizedEmployees: Employee[] = employeesData.map(e => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`,
    }));

    setEmployees(normalizedEmployees);

    if (normalizedEmployees.length && !selectedEmployeeId) {
      setSelectedEmployeeId(normalizedEmployees[0].id);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  /* =========================
     FILTRO POR FECHA
  ========================= */
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);

      if (period === 'month') return d.hasSame(date, 'month');
      if (period === 'week')
        return d >= date.startOf('week') && d <= date.endOf('week');

      return d.hasSame(date, 'day');
    });
  }, [appointments, period, date]);

  /* =========================
     FILTRO POR EMPLEADA
  ========================= */
  const employeeAppointments = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return filteredAppointments.filter(
      a => a.employee_id === selectedEmployeeId
    );
  }, [filteredAppointments, selectedEmployeeId]);

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
        <h1 className="text-2xl font-bold">Agenda por persona asignada</h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* CONTROLES */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* PERIODO */}
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

        {/* EMPLEADA */}
        <select
          value={selectedEmployeeId ?? ''}
          onChange={e => setSelectedEmployeeId(e.target.value)}
          className="ml-4 px-3 py-2 border rounded"
        >
          {employees.map(e => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        {/* FECHA */}
        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => moveDate(-1)}>←</button>
          <span className="font-medium">
            {date.toFormat('dd LLL yyyy')}
          </span>
          <button onClick={() => moveDate(1)}>→</button>
        </div>
      </div>

      {/* CALENDARIO */}
      <CalendarView
        key={`${selectedEmployeeId}-${date.toISO()}`}
        appointments={employeeAppointments}
        view={period}
        businessHours={businessHours}
        baseDate={date}
        onAppointmentClick={(a) => setSelectedAppointment(a)}
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
    </DashboardLayout>
  );
}
