'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

type Props = {
  date: DateTime;
  appointments: Appointment[];
  opening_time: string; // ej "13:00"
  closing_time: string; // ej "18:30"
  interval?: number; // minutos, default 30
  onAppointmentClick?: (appointment: Appointment) => void;
};

export default function DayCalendar({
  date,
  appointments,
  opening_time,
  closing_time,
  interval = 30,
  onAppointmentClick,
}: Props) {
  const zone = 'America/Mexico_City';

  /* =========================
     HORAS DEL NEGOCIO
  ========================= */
  const [openHour, openMinute] = opening_time.split(':').map(Number);
  const [closeHour, closeMinute] = closing_time.split(':').map(Number);

  const start = date
    .setZone(zone)
    .set({ hour: openHour, minute: openMinute, second: 0 });

  const end = date
    .setZone(zone)
    .set({ hour: closeHour, minute: closeMinute, second: 0 });

  const slots: DateTime[] = [];
  let cursor = start;

  while (cursor < end) {
    slots.push(cursor);
    cursor = cursor.plus({ minutes: interval });
  }

  /* =========================
     HELPERS
  ========================= */
  const toMX = (iso: string) =>
    DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);

  return (
    <div className="border rounded overflow-hidden">
      {/* HEADER */}
      <div className="p-3 border-b bg-gray-50 font-medium">
        {date.toFormat('cccc dd LLLL yyyy')}
      </div>

      {/* BODY */}
      <div className="divide-y">
        {slots.map(slot => {
          const slotEnd = slot.plus({ minutes: interval });

          const slotAppointments = appointments.filter(a => {
            const start = toMX(a.starts_at);
            const end = toMX(a.ends_at);

            return (
              start < slotEnd &&
              end > slot &&
              start.hasSame(date, 'day')
            );
          });

          return (
            <div
              key={slot.toISO()}
              className="flex min-h-[56px]"
            >
              {/* HORA */}
              <div className="w-20 border-r px-3 py-2 text-sm text-gray-500">
                {slot.toFormat('HH:mm')}
              </div>

              {/* CONTENIDO */}
              <div className="flex-1 px-2 py-1 relative">
                {slotAppointments.map(appt => (
                  <div
                    key={appt.id}
                    onClick={() =>
                      onAppointmentClick?.(appt)
                    }
                    className="mb-1 cursor-pointer rounded bg-black text-white px-3 py-1 text-sm"
                  >
                    <p className="font-medium truncate">
                      {appt.client_name}
                    </p>
                    <p className="text-xs truncate">
                      {appt.service_name} · {appt.employee_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
