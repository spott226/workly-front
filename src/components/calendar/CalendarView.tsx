'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

/* =========================
   CONFIG
========================= */
const ZONE = 'America/Mexico_City';
const LOCALE = 'es';

const HOUR_HEIGHT = 64;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

/* =========================
   STATUS → BASE COLORS
========================= */
const STATUS_BASE_COLORS: Record<string, string> = {
  PENDING: '#FEF3C7',
  CONFIRMED: '#DBEAFE',
  ATTENDED: '#D1FAE5',
  NO_SHOW: '#FEE2E2',
  CANCELLED: '#F3F4F6',
  RESCHEDULED: '#EDE9FE',
};

/* =========================
   EMPLOYEE COLORS
========================= */
const EMPLOYEE_COLORS = [
  '#F97316',
  '#EC4899',
  '#0EA5E9',
  '#22C55E',
  '#A855F7',
];

export function getEmployeeColor(employeeId: string) {
  let hash = 5381;
  for (let i = 0; i < employeeId.length; i++) {
    hash = (hash << 5) + hash + employeeId.charCodeAt(i);
  }
  return EMPLOYEE_COLORS[Math.abs(hash) % EMPLOYEE_COLORS.length];
}

/* =========================
   TYPES
========================= */
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
    return { startHour: 8, endHour: 22 };
  }

  return {
    startHour: Number(business.opening_time.split(':')[0]),
    endHour: Number(business.closing_time.split(':')[0]),
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
  const { startHour, endHour } = getBusinessHours(businessHours);

  if (view === 'month') {
    return <div className="text-sm opacity-60">Vista mensual pendiente</div>;
  }

  return (
    <DayWeekView
      appointments={appointments}
      view={view}
      startHour={startHour}
      endHour={endHour}
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
  startHour,
  endHour,
  baseDate,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  view: 'day' | 'week';
  startHour: number;
  endHour: number;
  baseDate?: DateTime;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const today = (baseDate ?? DateTime.now())
    .setZone(ZONE)
    .setLocale(LOCALE);

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
        className="grid md:min-w-[900px]"
        style={{
          gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
        }}
      >
        <div />
        {days.map(d => (
          <div
            key={d.toISODate()}
            className="border-b py-2 text-center text-sm font-medium capitalize"
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
    <div>
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
  hoursCount,
  onAppointmentClick,
}: {
  day: DateTime;
  appointments: Appointment[];
  startHour: number;
  endHour: number;
  hoursCount: number;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const dayStart = day.set({ hour: startHour, minute: 0 });
  const dayEnd = day.set({ hour: endHour, minute: 0 });

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 640;

  const dayAppointments = appointments
    .map(a => {
      const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
      const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(ZONE);

      if (!start.hasSame(day, 'day')) return null;
      if (end <= dayStart || start >= dayEnd) return null;

      return { ...a, start, end };
    })
    .filter(Boolean) as Array<
      Appointment & { start: DateTime; end: DateTime }
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
        const top =
          ((a.start.hour + a.start.minute / 60) - startHour) * HOUR_HEIGHT;

        const height =
          a.end.diff(a.start, 'minutes').minutes * MINUTE_HEIGHT;

        const gradient = isMobile
          ? `linear-gradient(
              180deg,
              ${STATUS_BASE_COLORS[a.status]} 0%,
              ${STATUS_BASE_COLORS[a.status]} 50%,
              ${getEmployeeColor(a.employee_id)} 50%,
              ${getEmployeeColor(a.employee_id)} 100%
            )`
          : `linear-gradient(
              90deg,
              ${STATUS_BASE_COLORS[a.status]} 0%,
              ${STATUS_BASE_COLORS[a.status]} 50%,
              ${getEmployeeColor(a.employee_id)} 50%,
              ${getEmployeeColor(a.employee_id)} 100%
            )`;

        return (
          <div
            key={a.id}
            onClick={() => onAppointmentClick?.(a)}
            className="absolute left-0 right-0 mx-1 rounded text-xs cursor-pointer overflow-hidden flex flex-col justify-center"
            style={{
              top,
              height,
              minHeight: 44,
              background: gradient,
            }}
          >
            <div className="px-2 py-1 leading-tight">
              <div className="font-medium truncate">{a.client_name}</div>
              <div className="text-[11px] opacity-90 truncate">
                {a.employee_name}
              </div>
              <div className="text-[11px] opacity-80 whitespace-nowrap">
                {a.start.toFormat('HH:mm')} – {a.end.toFormat('HH:mm')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
