'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';
import { APPOINTMENT_COLORS } from './appointmentColors';

type Props = {
  appointments: Appointment[];
  viewMode: 'day' | 'week' | 'month';
  activeDate: DateTime;
  onDaySelect: (d: DateTime) => void;
};

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 60;

export default function WeekCalendar({
  appointments,
  viewMode,
  activeDate,
  onDaySelect,
}: Props) {
  const days =
    viewMode === 'day'
      ? [activeDate]
      : Array.from({ length: 7 }).map((_, i) =>
          activeDate.startOf('week').plus({ days: i })
        );

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="border rounded overflow-hidden">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-gray-50">
        <div />
        {days.map(d => (
          <button
            key={d.toISODate()}
            onClick={() => onDaySelect(d)}
            className="text-sm p-2 font-medium hover:bg-gray-200"
          >
            {d.toFormat('ccc dd')}
          </button>
        ))}
      </div>

      <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
        <div>
          {hours.map(h => (
            <div
              key={h}
              style={{ height: HOUR_HEIGHT }}
              className="text-xs px-1 border-b"
            >
              {`${h}:00`}
            </div>
          ))}
        </div>

        {days.map(day => (
          <div key={day.toISODate()} className="relative border-l">
            {hours.map(h => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="border-b"
              />
            ))}

            {appointments
              .filter(a =>
                DateTime
                  .fromISO(a.starts_at, { zone: 'utc' })
                  .setZone('America/Mexico_City')
                  .hasSame(day, 'day')
              )
              .map(a => {
                const start = DateTime.fromISO(a.starts_at, { zone: 'utc' })
                  .setZone('America/Mexico_City');
                const end = DateTime.fromISO(a.ends_at, { zone: 'utc' })
                  .setZone('America/Mexico_City');

                const top =
                  (start.hour + start.minute / 60 - START_HOUR) *
                  HOUR_HEIGHT;
                const height =
                  end.diff(start, 'minutes').minutes *
                  (HOUR_HEIGHT / 60);

                return (
                  <div
                    key={a.id}
                    style={{ top, height }}
                    className={`absolute left-1 right-1 rounded text-xs text-white p-1 ${APPOINTMENT_COLORS[a.status]}`}
                  >
                    {a.client_name}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
