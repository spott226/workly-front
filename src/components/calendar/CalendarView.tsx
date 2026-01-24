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
  baseDate?: DateTime;
  onAppointmentClick?: (a: Appointment) => void;
};

/* =========================
   HELPERS
========================= */
function getBusinessHours(business: BusinessHours | null) {
  if (!business?.opening_time || !business?.closing_time) {
    return { startMinutes: 8 * 60, endMinutes: 22 * 60 };
  }

  const [openH, openM] = business.opening_time.split(':').map(Number);
  const [closeH, closeM] = business.closing_time.split(':').map(Number);

  return {
    startMinutes: openH * 60 + openM,
    endMinutes: closeH * 60 + closeM,
  };
}

/* =========================
   MAIN
========================= */
export function CalendarView({
  appointments,
  view,
  businessHours,
  baseDate,
  onAppointmentClick,
}: Props) {
  const { startMinutes, endMinutes } = getBusinessHours(businessHours);

  if (view === 'month') {
    return (
      <MonthView
        appointments={appointments}
        baseDate={baseDate}
        onAppointmentClick={onAppointmentClick}
      />
    );
  }

  return (
    <DayWeekView
      appointments={appointments}
      view={view}
      startMinutes={startMinutes}
      endMinutes={endMinutes}
      baseDate={baseDate}
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
  startMinutes,
  endMinutes,
  baseDate,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  view: 'day' | 'week';
  startMinutes: number;
  endMinutes: number;
  baseDate?: DateTime;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const today = (baseDate ?? DateTime.now()).setZone(ZONE);

  const days =
    view === 'day'
      ? [today]
      : Array.from({ length: 7 }, (_, i) =>
          today.startOf('week').plus({ days: i })
        );

  // 🔥 AQUÍ ESTABA TU ERROR
  const startHour = Math.floor(startMinutes / 60);
  const endHour = Math.ceil(endMinutes / 60);
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
            endHour={endHour}
            startMinutes={startMinutes}
            endMinutes={endMinutes}
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
  endHour,
  startMinutes,
  endMinutes,
  hoursCount,
  onAppointmentClick,
}: {
  day: DateTime;
  appointments: Appointment[];
  startHour: number;
  endHour: number;
  startMinutes: number;
  endMinutes: number;
  hoursCount: number;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const dayStart = day.startOf('day').plus({ minutes: startMinutes });
  const dayEnd = day.startOf('day').plus({ minutes: endMinutes });

  const dayAppointments = appointments
    .map(a => {
      const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
      const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(ZONE);

      if (!start.hasSame(day, 'day')) return null;

      const visibleStart = start < dayStart ? dayStart : start;
      const visibleEnd = end > dayEnd ? dayEnd : end;

      if (visibleEnd <= visibleStart) return null;

      return { ...a, visibleStart, visibleEnd };
    })
    .filter(Boolean) as Array<
      Appointment & { visibleStart: DateTime; visibleEnd: DateTime }
    >;

  return (
    <div
      className="relative border-l"
      style={{ height: hoursCount * HOUR_HEIGHT }}
    >
      {Array.from({ length: hoursCount }).map((_, i) => (
        <div key={i} className="border-t" style={{ height: HOUR_HEIGHT }} />
      ))}

      {dayAppointments.map(a => {
        const startOffsetMinutes =
          a.visibleStart.diff(dayStart, 'minutes').minutes;

        const durationMinutes =
          a.visibleEnd.diff(a.visibleStart, 'minutes').minutes;

        const top = startOffsetMinutes * MINUTE_HEIGHT;
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
              {a.visibleStart.toFormat('HH:mm')} –{' '}
              {a.visibleEnd.toFormat('HH:mm')}
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
  baseDate,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  baseDate?: DateTime;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const today = (baseDate ?? DateTime.now()).setZone(ZONE);
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
