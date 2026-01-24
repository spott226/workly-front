'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

const ZONE = 'America/Mexico_City';
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

type BusinessHours = {
  opening_time: string | null;
  closing_time: string | null;
};

type Props = {
  appointments: Appointment[];
  view: 'day' | 'week' | 'month';
  businessHours: BusinessHours | null;
  onAppointmentClick?: (a: Appointment) => void;
};

/* =========================
   HELPERS
========================= */
function getBusinessHours(business: BusinessHours | null) {
  if (!business?.opening_time || !business?.closing_time) {
    return { start: 8, end: 22 };
  }

  return {
    start: Number(business.opening_time.split(':')[0]),
    end: Number(business.closing_time.split(':')[0]),
  };
}

/* =========================
   MAIN
========================= */
export function CalendarView({
  appointments,
  view,
  businessHours,
  onAppointmentClick,
}: Props) {
  const { start, end } = getBusinessHours(businessHours);

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
      startHour={start}
      endHour={end}
      onAppointmentClick={onAppointmentClick}
    />
  );
}

/* =========================
   DAY / WEEK VIEW
========================= */
function DayWeekView({
  appointments,
  view,
  startHour,
  endHour,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  view: 'day' | 'week';
  startHour: number;
  endHour: number;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const today = DateTime.now().setZone(ZONE);
  const days =
    view === 'day'
      ? [today]
      : Array.from({ length: 7 }, (_, i) =>
          today.startOf('week').plus({ days: i })
        );

  const hoursCount = endHour - startHour;

  return (
    <div className="border rounded overflow-x-auto">
      <div
        className="grid min-w-[900px]"
        style={{
          gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
        }}
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

        <TimeColumn startHour={startHour} hoursCount={hoursCount} />

        {days.map(day => (
          <DayColumn
            key={day.toISODate()}
            day={day}
            appointments={appointments}
            startHour={startHour}
            hoursCount={hoursCount}
            onAppointmentClick={onAppointmentClick}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   TIME COLUMN
========================= */
function TimeColumn({
  startHour,
  hoursCount,
}: {
  startHour: number;
  hoursCount: number;
}) {
  return (
    <div className="relative">
      {Array.from({ length: hoursCount }).map((_, i) => {
        const hour = startHour + i;
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
  startHour,
  hoursCount,
  onAppointmentClick,
}: {
  day: DateTime;
  appointments: Appointment[];
  startHour: number;
  hoursCount: number;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const dayAppointments = appointments.filter(a => {
    const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
    return start.hasSame(day, 'day');
  });

  return (
    <div
      className="relative border-l"
      style={{ height: hoursCount * HOUR_HEIGHT }}
    >
      {Array.from({ length: hoursCount }).map((_, i) => (
        <div key={i} className="border-t" style={{ height: HOUR_HEIGHT }} />
      ))}

      {dayAppointments.map(a => {
        const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
        const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(ZONE);

        const startMinutes =
          (start.hour - startHour) * 60 + start.minute;
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
  const today = DateTime.now().setZone(ZONE);
  const start = today.startOf('month').startOf('week');

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded overflow-hidden">
      {Array.from({ length: 42 }).map((_, i) => {
        const day = start.plus({ days: i });

        const dayAppointments = appointments.filter(a => {
          const d = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
          return d.hasSame(day, 'day');
        });

        return (
          <div
            key={day.toISODate()}
            className="bg-white min-h-[120px] p-2 text-sm"
          >
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
