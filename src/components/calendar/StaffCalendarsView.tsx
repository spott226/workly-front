'use client';

import { CalendarView } from '@/components/calendar/CalendarView';
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

type Props = {
  employees: Employee[];
  appointments: Appointment[];
  period: Period;
  businessHours: BusinessHours | null;
  onAppointmentClick?: (a: Appointment) => void;
};

/* =====================
   COMPONENT
===================== */
export function StaffCalendarsView({
  employees,
  appointments,
  period,
  businessHours,
  onAppointmentClick,
}: Props) {
  return (
    <div className="space-y-10">
      {employees.map(employee => {
        const employeeAppointments = appointments.filter(
          a => a.employee_id === employee.id
        );

        return (
          <section
            key={employee.id}
            className="border rounded-lg p-4 bg-white"
          >
            {/* HEADER EMPLEADA */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {employee.name}
              </h3>

              <span className="text-xs text-gray-500">
                {employeeAppointments.length} citas
              </span>
            </div>

            {/* CALENDARIO COMPACTO */}
            <div className="scale-[0.92] origin-top-left">
              <CalendarView
                appointments={employeeAppointments}
                view={period}
                businessHours={businessHours}
                onAppointmentClick={onAppointmentClick}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
