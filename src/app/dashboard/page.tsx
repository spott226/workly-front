'use client';

import { useEffect, useState } from 'react';

import { StaffCalendarsView } from '@/components/calendar/StaffCalendarsView';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment } from '@/lib/appointments';

/* =====================
   TYPES
===================== */
type Employee = {
  id: string;
  name: string;
};

type BusinessHours = {
  opening_time: string | null;
  closing_time: string | null;
};

type Period = 'day' | 'week' | 'month';

/* =====================
   PAGE
===================== */
export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [businessHours, setBusinessHours] =
    useState<BusinessHours | null>(null);

  const [period, setPeriod] = useState<Period>('day');

  /* =====================
     LOAD DATA
  ===================== */
  useEffect(() => {
    apiFetch<Appointment[]>('/appointments').then(setAppointments);
    apiFetch<Employee[]>('/employees').then(setEmployees);
    apiFetch<BusinessHours>('/businesses/me').then(res =>
      setBusinessHours({
        opening_time: res.opening_time ?? null,
        closing_time: res.closing_time ?? null,
      })
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Calendario por empleada</h1>

        <button
          type="button"
          className="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-gray-800"
          onClick={() => {
            // aquí navegas a crear cita
          }}
        >
          Crear cita
        </button>
      </div>

      {/* CONTROLES DE PERIODO */}
      <div className="flex gap-2 border-b pb-4">
        {(['day', 'week', 'month'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm rounded-md border ${
              period === p ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            {p === 'day' && 'Hoy'}
            {p === 'week' && 'Semana'}
            {p === 'month' && 'Mes'}
          </button>
        ))}
      </div>

      {/* CALENDARIOS POR EMPLEADA */}
      <StaffCalendarsView
        employees={employees}
        appointments={appointments}
        period={period}
        businessHours={businessHours}
      />
    </div>
  );
}
