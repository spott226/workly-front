'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

import { Appointment, getAppointments } from '@/lib/appointments';
import WeekCalendar from '@/components/calendar/WeekCalendar';

type Period = 'day' | 'week' | 'month' | 'year';

export function AppointmentList() {
  const zone = 'America/Mexico_City';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<Period>('week');
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone(zone)
  );

  const [selected, setSelected] = useState<Appointment | null>(null);

  async function loadAppointments() {
    setLoading(true);
    const data = await getAppointments();
    setAppointments(data.filter(a => a.status !== 'CANCELLED'));
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    setSelected(null);
  }, [period, activeDate]);

  /* =========================
     FILTRADO (MISMA LÓGICA)
  ========================= */
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const d = DateTime
        .fromISO(a.starts_at, { zone: 'utc' })
        .setZone(zone);

      if (period === 'day') {
        return d.hasSame(activeDate, 'day');
      }

      if (period === 'week') {
        return (
          d >= activeDate.startOf('week') &&
          d <= activeDate.endOf('week')
        );
      }

      if (period === 'month') {
        return (
          d.year === activeDate.year &&
          d.month === activeDate.month
        );
      }

      return d.year === activeDate.year;
    });
  }, [appointments, period, activeDate]);

  const formatDateRange = (a: Appointment) => {
    const start = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(zone);
    const end = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(zone);

    return `${start.toFormat('dd LLL yyyy')} · ${start.toFormat(
      'hh:mm a'
    )} — ${end.toFormat('hh:mm a')}`;
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando citas…</p>;
  }

  if (!appointments.length) {
    return <p className="text-sm text-gray-500">No hay citas.</p>;
  }

  return (
    <div className="space-y-6">
      {/* CONTROLES */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {(['day', 'week', 'month', 'year'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => {
              setPeriod(p);
              setActiveDate(DateTime.now().setZone(zone));
            }}
            className={`px-4 py-2 text-sm rounded-md border ${
              period === p ? 'bg-black text-white' : 'bg-white'
            }`}
          >
            {p === 'day' && 'Día'}
            {p === 'week' && 'Semana'}
            {p === 'month' && 'Mes'}
            {p === 'year' && 'Año'}
          </button>
        ))}
      </div>

      {/* CALENDARIO */}
      <div className="border rounded p-4">
        <WeekCalendar
          appointments={filtered}
          startDate={activeDate}
          onAppointmentClick={(a) => setSelected(a)}
        />
      </div>

      {/* PANEL DE DETALLE */}
      <div className="border rounded p-4">
        {!selected ? (
          <p className="text-sm text-gray-500">
            Selecciona una cita en el calendario para ver el detalle.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {selected.client_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selected.service_name} · {selected.employee_name}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 text-sm border rounded"
              >
                Cerrar
              </button>
            </div>

            <p className="text-sm">
              <b>Teléfono:</b> {selected.phone || '—'}
            </p>

            <p className="text-sm">
              <b>Fecha / hora:</b> {formatDateRange(selected)}
            </p>

            <p className="text-sm">
              <b>Estado:</b> {selected.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
