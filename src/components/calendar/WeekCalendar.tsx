'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';
import { APPOINTMENT_COLORS } from './appointmentColors';

type Props = {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekCalendar({
  appointments,
  onAppointmentClick,
}: Props) {
  const zone = 'America/Mexico_City';

  const startOfWeek = DateTime.now()
    .setZone(zone)
    .startOf('week');

  const days = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.plus({ days: i })
  );

  const toMX = (iso: string) =>
    DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);

  return (
    <div className="border rounded overflow-x-auto">
      <div className="grid grid-cols-8 border-b bg-gray-50 text-sm">
        <div className="p-2 border-r"></div>
        {days.map(day => (
          <div
            key={day.toISODate()}
            className="p-2 text-center border-r font-medium"
          >
            {day.toFormat('ccc dd')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 text-sm">
        {HOURS.map(hour => (
          <div key={hour} className="contents">
            <div className="border-r border-b p-2 text-right text-gray-500">
              {String(hour).padStart(2, '0')}:00
            </div>

            {days.map(day => {
              const slotStart = day.set({
                hour,
                minute: 0,
                second: 0,
                millisecond: 0,
              });
              const slotEnd = slotStart.plus({ hours: 1 });

              const slotAppointments = appointments.filter(appt => {
                const start = toMX(appt.starts_at);
                const end = toMX(appt.ends_at);

                return (
                  start < slotEnd &&
                  end > slotStart &&
                  start.hasSame(day, 'day')
                );
              });

              return (
                <div
                  key={`${day.toFormat('yyyy-LL-dd')}-${hour}`}
                  className="border-r border-b h-16 relative"
                >
                  {slotAppointments.map(appt => {
                    const color =
                      APPOINTMENT_COLORS[appt.status] ??
                      'bg-gray-400';

                    return (
                      <div
                        key={appt.id}
                        onClick={() =>
                          onAppointmentClick?.(appt)
                        }
                        className={`absolute inset-1 rounded px-2 py-1 text-xs text-white cursor-pointer ${color}`}
                      >
                        <p className="font-medium truncate">
                          {appt.client_name}
                        </p>
                        <p className="truncate">
                          {appt.service_name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
