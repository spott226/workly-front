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

/* =========================
   COLORES POR EMPLEADA
========================= */
const EMPLOYEE_COLORS = [
  'bg-fuchsia-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-lime-500',
  'bg-indigo-500',
  'bg-pink-500',
];

function getEmployeeColor(employeeId: string) {
  let hash = 0;
  for (let i = 0; i < employeeId.length; i++) {
    hash = employeeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return EMPLOYEE_COLORS[Math.abs(hash) % EMPLOYEE_COLORS.length];
}

/* =========================
   TIPOS
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
function getBusinessMinutes(business: BusinessHours | null) {
  if (!business?.opening_time || !business?.closing_time) {
    return { start: 8 * 60, end: 22 * 60 };
  }

  const [oh, om] = business.opening_time.split(':').map(Number);
  const [ch, cm] = business.closing_time.split(':').map(Number);

  return {
    start: oh * 60 + om,
    end: ch * 60 + cm,
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
  const { start, end } = getBusinessMinutes(businessHours);

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
      startMinutes={start}
      endMinutes={end}
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
  const base = (baseDate ?? DateTime.now()).setZone(ZONE);

  const days =
    view === 'day'
      ? [base]
      : Array.from({ length: 7 }, (_, i) =>
          base.startOf('week').plus({ days: i })
        );

  const totalMinutes = endMinutes - startMinutes;
  const hoursCount = Math.ceil(totalMinutes / 60);

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

        {/* TIME COLUMN */}
        <div>
          {Array.from({ length: hoursCount }).map((_, i) => {
            const minutes = startMinutes + i * 60;
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return (
              <div
                key={i}
                className="border-t text-xs text-right pr-2 text-gray-500"
                style={{ height: HOUR_HEIGHT }}
              >
                {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
              </div>
            );
          })}
        </div>

        {days.map(day => (
          <DayColumn
            key={day.toISODate()}
            day={day}
            appointments={appointments}
            startMinutes={startMinutes}
            endMinutes={endMinutes}
            onAppointmentClick={onAppointmentClick}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   DAY COLUMN
========================= */
function DayColumn({
  day,
  appointments,
  startMinutes,
  endMinutes,
  onAppointmentClick,
}: {
  day: DateTime;
  appointments: Appointment[];
  startMinutes: number;
  endMinutes: number;
  onAppointmentClick?: (a: Appointment) => void;
}) {
  const dayStart = day.startOf('day').plus({ minutes: startMinutes });
  const dayEnd = day.startOf('day').plus({ minutes: endMinutes });

  const visible = appointments
    .map(a => {
      const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(ZONE);
      const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(ZONE);

      if (!start.hasSame(day, 'day')) return null;

      const vs = start < dayStart ? dayStart : start;
      const ve = end > dayEnd ? dayEnd : end;
      if (ve <= vs) return null;

      return { ...a, vs, ve };
    })
    .filter(Boolean) as Array<Appointment & { vs: DateTime; ve: DateTime }>;

  return (
    <div
      className="relative border-l"
      style={{ height: ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT }}
    >
      {visible.map(a => {
        const top =
          a.vs.diff(dayStart, 'minutes').minutes * MINUTE_HEIGHT;
        const height =
          Math.max(a.ve.diff(a.vs, 'minutes').minutes * MINUTE_HEIGHT, 24);

        return (
          <div
            key={a.id}
            onClick={() => onAppointmentClick?.(a)}
            className={`absolute left-1 right-1 rounded text-white text-xs cursor-pointer ${STATUS_COLORS[a.status]}`}
            style={{ top, height }}
          >
            {/* EMPLEADA */}
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 rounded-l ${getEmployeeColor(
                a.employee_id
              )}`}
            />

            <div className="pl-3 pr-2 py-1">
              <div className="font-semibold truncate">
                {a.client_name || 'Cliente'}
              </div>
              <div className="text-[11px] opacity-90 truncate">
                {a.employee_name}
              </div>
              <div className="text-[11px] opacity-80">
                {a.vs.toFormat('HH:mm')} – {a.ve.toFormat('HH:mm')}
              </div>
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

        const dayApps = appointments.filter(a =>
          DateTime.fromISO(a.starts_at, { zone: 'utc' })
            .setZone(ZONE)
            .hasSame(day, 'day')
        );

        return (
          <div key={day.toISODate()} className="bg-white p-2 text-xs min-h-[120px]">
            <div className="text-gray-500 mb-1">{day.day}</div>

            {dayApps.map(a => (
              <div
                key={a.id}
                onClick={() => onAppointmentClick?.(a)}
                className={`mb-1 px-2 py-1 rounded text-white truncate flex items-center gap-1 cursor-pointer ${STATUS_COLORS[a.status]}`}
              >
                <span
                  className={`inline-block w-2 h-2 rounded-full ${getEmployeeColor(
                    a.employee_id
                  )}`}
                />
                {a.client_name}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
