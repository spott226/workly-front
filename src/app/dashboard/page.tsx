'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch } from '@/lib/apiFetch';
import { Appointment, getAppointments } from '@/lib/appointments';

import DayCalendar from '@/components/calendar/DayCalendar';
import WeekCalendar from '@/components/calendar/WeekCalendar';
import MonthCalendar from '@/components/calendar/MonthCalendar';
import YearCalendar from '@/components/calendar/YearCalendar';

import { AppointmentCard } from '@/components/appointments/AppointmentCard';

type View = 'day' | 'week' | 'month' | 'year';

type Business = {
  id: string;
  name: string;
  opening_time: string;
  closing_time: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const zone = 'America/Mexico_City';

  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<View>('week');
  const [activeDate, setActiveDate] = useState(
    DateTime.now().setZone(zone)
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  /* LOAD */
  useEffect(() => {
    async function load() {
      try {
        const biz = await apiFetch<Business>('/businesses/me');
        setBusiness(biz);
      } catch {}

      try {
        const all = await getAppointments();
        setAppointments(all.filter(a => a.status !== 'CANCELLED'));
      } catch {
        setAppointments([]);
      }

      setLoading(false);
    }

    load();
  }, []);

  /* NAV */
  function move(delta: number) {
    if (view === 'day') setActiveDate(d => d.plus({ days: delta }));
    if (view === 'week') setActiveDate(d => d.plus({ weeks: delta }));
    if (view === 'month') setActiveDate(d => d.plus({ months: delta }));
    if (view === 'year') setActiveDate(d => d.plus({ years: delta }));
  }

  const title = useMemo(() => {
    if (view === 'day') return activeDate.toFormat('dd LLLL yyyy');
    if (view === 'week')
      return `Semana del ${activeDate.startOf('week').toFormat('dd LLL')}`;
    if (view === 'month') return activeDate.toFormat('LLLL yyyy');
    return activeDate.toFormat('yyyy');
  }, [view, activeDate]);

  if (loading || !business) {
    return (
      <DashboardLayout>
        <p>Cargando…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold">{business.name}</h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-4 py-2 bg-black text-white rounded"
        >
          + Crear cita
        </button>
      </div>

      {/* CONTROLES */}
      <div className="flex gap-2 mb-4 items-center">
        {(['day', 'week', 'month', 'year'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1 border rounded ${
              view === v ? 'bg-black text-white' : ''
            }`}
          >
            {v === 'day' && 'Día'}
            {v === 'week' && 'Semana'}
            {v === 'month' && 'Mes'}
            {v === 'year' && 'Año'}
          </button>
        ))}

        <div className="ml-auto flex gap-2 items-center">
          <button onClick={() => move(-1)}>←</button>
          <span className="font-medium">{title}</span>
          <button onClick={() => move(1)}>→</button>
          <button
            onClick={() =>
              setActiveDate(DateTime.now().setZone(zone))
            }
          >
            Hoy
          </button>
        </div>
      </div>

      {/* CALENDARIO */}
      <div className="border rounded p-4 mb-6">
        {view === 'day' && (
          <DayCalendar
            date={activeDate}
            appointments={appointments}
            opening_time={business.opening_time}
            closing_time={business.closing_time}
            onAppointmentClick={setSelectedAppointment}
          />
        )}

        {view === 'week' && (
          <WeekCalendar
            startDate={activeDate}
            appointments={appointments}
            onAppointmentClick={setSelectedAppointment}
          />
        )}

        {view === 'month' && (
          <MonthCalendar
            date={activeDate}
            appointments={appointments}
            onDayClick={day => {
              setActiveDate(day);
              setView('day');
            }}
          />
        )}

        {view === 'year' && (
          <YearCalendar
            date={activeDate}
            onMonthClick={month => {
              setActiveDate(month.set({ day: 1 }));
              setView('month');
            }}
          />
        )}
      </div>

      {/* MODAL */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl relative">
            <button
              onClick={() => setSelectedAppointment(null)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            <AppointmentCard
              appointment={selectedAppointment}
              onChange={async () => {
                const all = await getAppointments();
                setAppointments(
                  all.filter(a => a.status !== 'CANCELLED')
                );
                setSelectedAppointment(null);
              }}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
