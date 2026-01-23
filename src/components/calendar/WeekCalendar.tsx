'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';
import { APPOINTMENT_COLORS } from './appointmentColors';

type Props = {
  appointments: Appointment[];
  startDate: DateTime;
  onAppointmentClick?: (appointment: Appointment) => void;
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 64; // px

export default function WeekCalendar({
  appointments,
  startDate,
  onAppointmentClick,
}: Props) {
  const zone = 'America/Mexico_City';

  const startOfWeek = startDate
    .setZone(zone)
    .startOf('week');

  const days = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.plus({ days: i })
  );

  const toMX = (iso: string) =>
    DateTime.fromISO(iso, { zone: 'utc' }).setZone(zone);

  return (
    <div className="border rounded overflow-x-auto">
      {/* HEADER */}
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

      {/* GRID */}
      <div className="grid grid-cols-8 text-sm relative">
        {/* HOUR COLUMN */}
        <div>
          {HOURS.map(hour => (
            <div
              key={hour}
              className="border-r border-b p-2 text-right text-gray-500"
              style={{ height: HOUR_HEIGHT }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* DAYS COLUMNS */}
        {days.map(day => (
          <div key={day.toISODate()} className="relative">
            {HOURS.map(hour => (
              <div
                key={hour}
                className="border-r border-b"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}

            {/* APPOINTMENTS */}
            {appointments
              .filter(appt => {
                const start = toMX(appt.starts_at);
                return start.hasSame(day, 'day');
              })
              .map(appt => {
                const start = toMX(appt.starts_at);
                const end = toMX(appt.ends_at);

                const startHour = start.hour + start.minute / 60;
                const durationMinutes =
                  end.diff(start, 'minutes').minutes;

                const top =
                  startHour * HOUR_HEIGHT;
                const height =
                  (durationMinutes / 60) * HOUR_HEIGHT;

                const color =
                  APPOINTMENT_COLORS[appt.status] ??
                  'bg-gray-400';

                return (
                  <div
                    key={appt.id}
                    onClick={() =>
                      onAppointmentClick?.(appt)
                    }
                    className={`absolute left-1 right-1 rounded px-2 py-1 text-xs text-white cursor-pointer ${color}`}
                    style={{
                      top,
                      height,
                    }}
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
        ))}
      </div>
    </div>
  );
}
