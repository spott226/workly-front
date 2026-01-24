'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

const zone = 'America/Mexico_City';
const START_HOUR = 8;
const END_HOUR = 22;
const HOURS = END_HOUR - START_HOUR;

const HOUR_HEIGHT = 64;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

/* =========================
   COLORES POR ESTADO
========================= */
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-600',
  ATTENDED: 'bg-emerald-600',
  NO_SHOW: 'bg-red-600',
  CANCELLED: 'bg-gray-400',
  RESCHEDULED: 'bg-purple-600',
};

type Props = {
  appointments: Appointment[];
  view: 'day' | 'week' | 'month';
  onAppointmentClick?: (a: Appointment) => void;
};

export function CalendarView({
  appointments,
  view,
  onAppointmentClick,
}: Props) {
  if (view === 'month') {
    return (
      <MonthView
        appointments={appointments}
        onAppointmentClick={onAppointmentClick}
      />
    );
  }

  return (
    <DayWeekView
      appointments={appointments}
      view={view}
      onAppointmentClick={onAppointmentClick}
    />
  );
}

/* =========================
   DAY / WEEK
========================= */
function DayWeekView({
  appointments,
  view,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  view: 'day' | 'week';
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const today = DateTime.now().setZone(zone);
  const days =
    view === 'day'
      ? [today]
      : Array.from({ length: 7 }, (_, i) =>
          today.startOf('week').plus({ days: i })
        );

  return (
    <div className="border rounded overflow-x-auto">
      <div
        className="grid min-w-[900px]"
        style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map(d => (
          <div
            key={d.toISODate()}
            className="border-b py-2 text-center text-sm font-medium"
          >
            {d.toFormat('ccc dd')}
          </div>
        ))}

        <TimeColumn />

        {days.map(day => (
          <DayColumn
            key={day.toISODate()}
            day={day}
            appointments={appointments}
            onAppointmentClick={onAppointmentClick}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   HOURS COLUMN
========================= */
function TimeColumn() {
  return (
    <div className="relative">
      {Array.from({ length: HOURS }).map((_, i) => {
        const hour = START_HOUR + i;
        return (
          <div
            key={hour}
            className="border-t text-xs text-right pr-2 text-gray-500"
            style={{ height: HOUR_HEIGHT }}
          >
            {String(hour).padStart(2, '0')}:00
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   DAY COLUMN
========================= */
function DayColumn({
  day,
  appointments,
  onAppointmentClick,
}: {
  day: DateTime;
  appointments: Appointment[];
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const dayAppointments = appointments.filter(a => {
    const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(zone);
    return start.hasSame(day, 'day');
  });

  return (
    <div className="relative border-l" style={{ height: HOURS * HOUR_HEIGHT }}>
      {Array.from({ length: HOURS }).map((_, i) => (
        <div key={i} className="border-t" style={{ height: HOUR_HEIGHT }} />
      ))}

      {dayAppointments.map(a => {
        const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(zone);
        const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(zone);

        const startMinutes =
          (start.hour - START_HOUR) * 60 + start.minute;
        const durationMinutes = end.diff(start, 'minutes').minutes;

        const top = startMinutes * MINUTE_HEIGHT;
        const height = Math.max(durationMinutes * MINUTE_HEIGHT, 24);

        return (
          <div
            key={a.id}
            onClick={() => onAppointmentClick?.(a)}
            className={`absolute left-1 right-1 rounded text-white text-xs px-2 py-1 cursor-pointer ${STATUS_COLORS[a.status]}`}
            style={{ top, height }}
          >
            <div className="font-medium truncate">
              {a.client_name || 'Cliente'}
            </div>
            <div className="opacity-80">
              {start.toFormat('HH:mm')} – {end.toFormat('HH:mm')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================
   MONTH VIEW
========================= */
function MonthView({
  appointments,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const today = DateTime.now().setZone(zone);
  const start = today.startOf('month').startOf('week');

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
      {Array.from({ length: 42 }).map((_, i) => {
        const day = start.plus({ days: i });

        const dayAppointments = appointments.filter(a => {
          const d = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(zone);
          return d.hasSame(day, 'day');
        });

        return (
          <div key={day.toISODate()} className="bg-white min-h-[120px] p-2 text-sm">
            <div className="text-xs text-gray-500 mb-1">{day.day}</div>

            {dayAppointments.map(a => (
              <div
                key={a.id}
                onClick={() => onAppointmentClick?.(a)}
                className={`mb-1 rounded text-white text-xs px-2 py-1 cursor-pointer truncate ${STATUS_COLORS[a.status]}`}
              >
                {a.client_name || 'Cliente'}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
