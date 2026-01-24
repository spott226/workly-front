'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';
import { EmployeeAvailabilityGrid } from './EmployeeAvailabilityGrid';

type Period = 'day' | 'week' | 'month';

type Employee = {
  id: string;
  name: string;
};

type Appointment = {
  starts_at: string;
  ends_at: string;
  employee_id: string;
};

const ZONE = 'America/Mexico_City';

export function EmployeeAvailabilityList() {
  const [period, setPeriod] = useState<Period>('day');
  const [date, setDate] = useState(DateTime.now().setZone(ZONE));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    apiFetch<Employee[]>('/employees').then(setEmployees);
    apiFetch<Appointment[]>('/appointments').then(setAppointments);
  }, []);

  function move(days: number) {
    setDate(d => d.plus({ days }));
  }

  return (
    <div className="space-y-6">
      {/* CONTROLES */}
      <div className="flex items-center gap-3">
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

        <div className="ml-auto flex gap-2">
          <button onClick={() => move(-1)}>←</button>
          <span className="font-medium">
            {date.toFormat('dd LLL yyyy')}
          </span>
          <button onClick={() => move(1)}>→</button>
        </div>
      </div>

      {/* EMPLEADOS */}
      <div className="flex flex-wrap gap-2">
        {employees.map(e => (
          <button
            key={e.id}
            onClick={() => setSelectedEmployee(e)}
            className={`px-4 py-2 border rounded ${
              selectedEmployee?.id === e.id ? 'bg-black text-white' : ''
            }`}
          >
            {e.name}
          </button>
        ))}
      </div>

      {/* DISPONIBILIDAD */}
      {selectedEmployee && (
        <EmployeeAvailabilityGrid
          employee={selectedEmployee}
          appointments={appointments}
          date={date}
          period={period}
        />
      )}
    </div>
  );
}
