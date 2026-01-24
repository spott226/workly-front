'use client';

import { useEffect, useState } from 'react';

import {CalendarView}from '@/components/calendar/CalendarView';
import StaffAvailabilityBoard from '@/components/calendar/StaffAvailabilityBoard';
import { EmployeeSimpleSelector } from '@/components/employees/EmployeeSimpleSelector';
import { apiFetch } from '@/lib/apiFetch';

/* =====================
   TYPES
===================== */
type Appointment = {
  employee_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

type Employee = {
  id: string;
  name: string;
};

type BusinessHours = {
  opening_time: string; // "13:00"
  closing_time: string; // "21:00"
};

type Period = 'day' | 'week' | 'month';

/* =====================
   PAGE
===================== */
export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [date, setDate] = useState<Date>(new Date());
  const [period, setPeriod] = useState<Period>('day');
  const [businessHours, setBusinessHours] =
    useState<BusinessHours | null>(null);

  /* =====================
     LOAD DATA
  ===================== */
  useEffect(() => {
    apiFetch<Appointment[]>('/appointments').then(setAppointments);
    apiFetch<Employee[]>('/employees').then(setEmployees);
    apiFetch<BusinessHours>('/business/hours').then(setBusinessHours);
  }, []);

  return (
    <>
      {/* CALENDARIO SUPERIOR – NO SE TOCA */}
      <section>
        <CalendarView
          appointments={appointments}
          date={date}
          period={period}
          onDateChange={setDate}
          onPeriodChange={setPeriod}
        />
      </section>

      {/* DISPONIBILIDAD */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">
          Disponibilidad del equipo
        </h2>

        <EmployeeSimpleSelector
          employees={employees}
          value={selectedEmployee}
          onChange={setSelectedEmployee}
        />

        {selectedEmployee && businessHours && (
          <StaffAvailabilityBoard
            employee={selectedEmployee}
            appointments={appointments}
            date={date}
            business={businessHours}
          />
        )}
      </section>
    </>
  );
}
