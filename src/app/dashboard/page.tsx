'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiFetch } from '@/lib/apiFetch';

/* =========================
   TYPES
========================= */
type Business = {
  id: string;
  name: string;
};

type AttendanceItem = {
  employee_id: string;
  first_name: string;
  last_name: string;
  status: 'PRESENT' | 'ABSENT';
  check_in?: string | null;
  check_out?: string | null;
};

type TodayAppointmentsSummary = {
  total: number;
  attended: number;
  pending: number;
  canceled: number;
};

/* =========================
   PAGE
========================= */
export default function DashboardPage() {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [appointmentsSummary, setAppointmentsSummary] =
    useState<TodayAppointmentsSummary>({
      total: 0,
      attended: 0,
      pending: 0,
      canceled: 0,
    });

  const [loading, setLoading] = useState(true);
  const [showAttendance, setShowAttendance] = useState(true);

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    async function load() {
      try {
        const biz = await apiFetch<Business>('/businesses/me');
        setBusiness(biz);
      } catch {
        setBusiness(null);
      }

      try {
        const todayAttendance =
          await apiFetch<AttendanceItem[]>('/employees/attendance/today');
        setAttendance(todayAttendance);
      } catch {
        setAttendance([]);
      }

      try {
        const summary =
          await apiFetch<TodayAppointmentsSummary>(
            '/appointments/summary/today'
          );
        setAppointmentsSummary(summary);
      } catch {
        setAppointmentsSummary({
          total: 0,
          attended: 0,
          pending: 0,
          canceled: 0,
        });
      }

      setLoading(false);
    }

    load();
  }, []);

  /* =========================
     CHECK-IN
  ========================= */
  const checkIn = async (employeeId: string) => {
    await apiFetch(`/employees/${employeeId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ time: new Date().toISOString() }),
    });

    const updated =
      await apiFetch<AttendanceItem[]>('/employees/attendance/today');

    setAttendance(updated);
  };

  /* =========================
     CHECK-OUT
  ========================= */
  const checkOut = async (employeeId: string) => {
    await apiFetch(`/employees/${employeeId}/check-out`, {
      method: 'POST',
      body: JSON.stringify({ time: new Date().toISOString() }),
    });

    const updated =
      await apiFetch<AttendanceItem[]>('/employees/attendance/today');

    setAttendance(updated);
  };

  /* =========================
     FORMAT TIME
  ========================= */
  const formatTime = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* =========================
     DERIVED
  ========================= */
  const summary = useMemo(() => {
    const totalEmployees = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = totalEmployees - present;

    return {
      totalEmployees,
      present,
      absent,
    };
  }, [attendance]);

  const alerts = useMemo(() => {
    const pendingCheckIn = attendance.filter(
      a => !a.check_in
    ).length;

    const messages: string[] = [];

    if (pendingCheckIn > 0) {
      messages.push(
        `${pendingCheckIn} empleado(s) aún no registran entrada`
      );
    }

    if (appointmentsSummary.canceled > 0) {
      messages.push(
        `${appointmentsSummary.canceled} cita(s) cancelada(s) hoy`
      );
    }

    if (appointmentsSummary.pending > 0) {
      messages.push(
        `${appointmentsSummary.pending} cita(s) pendiente(s) hoy`
      );
    }

    return messages;
  }, [attendance, appointmentsSummary]);

  if (loading) {
    return (
      <DashboardLayout>
        <p>Cargando…</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Dashboard{business ? ` · ${business.name}` : ''}
        </h1>

        <button
          onClick={() => router.push('/appointments/new')}
          className="px-5 py-2 rounded bg-black text-white"
        >
          + Crear cita
        </button>
      </div>

      {/* RESUMEN */}
      <div className="mb-6 border rounded p-4">
        <h2 className="font-medium mb-3">Hoy</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Empleados presentes</p>
            <p className="text-lg font-semibold">
              {summary.present} / {summary.totalEmployees}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Citas hoy</p>
            <p className="text-lg font-semibold">
              {appointmentsSummary.total}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Atendidas</p>
            <p className="text-lg font-semibold">
              {appointmentsSummary.attended}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Pendientes</p>
            <p className="text-lg font-semibold">
              {appointmentsSummary.pending}
            </p>
          </div>
        </div>
      </div>

      {/* ALERTAS */}
      {alerts.length > 0 && (
        <div className="mb-6 border rounded p-4">
          <h2 className="font-medium mb-2">Alertas</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {alerts.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ASISTENCIAS */}
      <div className="mb-6 border rounded">
        <button
          onClick={() => setShowAttendance(!showAttendance)}
          className="w-full flex justify-between items-center p-4 font-medium"
        >
          <span>Asistencias de hoy</span>
          <span>{showAttendance ? '–' : '+'}</span>
        </button>

        {showAttendance && (
          <div className="p-4 border-t space-y-3">
            {attendance.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay empleados registrados.
              </p>
            )}

            {attendance.map(e => (
              <div
                key={e.employee_id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">
                    {e.first_name} {e.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Entrada: {formatTime(e.check_in)}
                  </p>
                </div>

                {!e.check_in && (
                  <button
                    onClick={() => checkIn(e.employee_id)}
                    className="px-3 py-1 bg-green-600 text-white rounded"
                  >
                    Marcar entrada
                  </button>
                )}

                {e.check_in && !e.check_out && (
                  <button
                    onClick={() => checkOut(e.employee_id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Marcar salida
                  </button>
                )}

                {e.check_in && e.check_out && (
                  <span className="text-green-600 text-sm">
                    Asistencia completa
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
