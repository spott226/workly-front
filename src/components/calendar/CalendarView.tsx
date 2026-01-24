'use client';

import { DateTime } from 'luxon';
import { Appointment } from '@/lib/appointments';

const ZONE = 'America/Mexico_City';
const HOUR_HEIGHT = 64;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

/* =========================
   COLORES POR EMPLEADA
========================= */
const EMPLOYEE_COLORS = [
  'bg-rose-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-indigo-500',
];

const employeeColorMap = new Map<string, string>();

function getEmployeeColor(employeeId: string) {
  if (!employeeColorMap.has(employeeId)) {
    const color =
      EMPLOYEE_COLORS[employeeColorMap.size % EMPLOYEE_COLORS.length];
    employeeColorMap.set(employeeId, color);
  }
  return employeeColorMap.get(employeeId)!;
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
  const dayBase = (baseDate ?? DateTime.now()).setZone(ZONE);

  const days =
    view === 'day'
      ? [dayBase]
      : Array.from({ length: 7 }, (_, i) =>
          dayBase.startOf('week').plus({ days: i })
        );

  const totalMinutes = endMinutes - startMinutes;
  const hoursCount = Math.ceil(totalMinutes / 60);

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
            className="border-b py-2 text-center text-sm font-semibold"
          >
            {d.toFormat('ccc dd')}
          </div>
        ))}

        <TimeColumn startMinutes={startMinutes} hoursCount={hoursCount} />

        {days.map(day => (
          <DayColumn
            key={day.toISODate()}
            day={day}
            appointments={appointments}
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
  startMinutes,
  hoursCount,
}: {
  startMinutes: number;
  hoursCount: number;
}) {
  return (
    <div className="relative">
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
            {String(h).padStart(2, '0')}:
            {String(m).padStart(2, '0')}
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
  startMinutes,
  endMinutes,
  hoursCount,
  onAppointmentClick,
}: {
  day: DateTime;
  appointments: Appointment[];
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
        const startOffset =
          (a.visibleStart.diff(dayStart, 'minutes').minutes || 0) *
          MINUTE_HEIGHT;

        const duration =
          a.visibleEnd.diff(a.visibleStart, 'minutes').minutes *
          MINUTE_HEIGHT;

        return (
          <div
            key={a.id}
            onClick={() => onAppointmentClick?.(a)}
            className={`absolute left-1 right-1 rounded text-white text-xs px-2 py-1 cursor-pointer ${getEmployeeColor(
              a.employee_id
            )}`}
            style={{
              top: startOffset,
              height: Math.max(duration, 24),
            }}
          >
            <div className="font-semibold truncate">
              {a.employee_name}
            </div>
            <div className="opacity-90 truncate">
              {a.client_name || 'Cliente'}
            </div>
            <div className="text-[11px] opacity-80">
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
                className={`mb-1 rounded text-white text-xs px-2 py-1 truncate cursor-pointer ${getEmployeeColor(
                  a.employee_id
                )}`}
              >
                {a.employee_name}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
