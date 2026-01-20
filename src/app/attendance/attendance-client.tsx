'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AttendanceList } from '@/components/attendance/AttendanceList';
import { AttendanceActions } from '@/components/attendance/AttendanceActions';
import { BusinessHoursConfig } from '@/components/attendance/BusinessHoursConfig';
import { useUser } from '@/context/UserContext';

export default function AttendanceClient() {
  const { user } = useUser();

  const canManageAttendance =
    user?.role === 'OWNER' || user?.role === 'STAFF';

  const isOwner = user?.role === 'OWNER';

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-semibold">
            Control de asistencia
          </h1>
          <p className="text-sm text-gray-500">
            Registro diario de entrada y salida del personal
          </p>
        </div>

        {/* CONFIGURACIÓN HORARIO NEGOCIO */}
        {isOwner && <BusinessHoursConfig />}

        {/* LISTA DE ASISTENCIA DEL DÍA */}
        <AttendanceList />

        {/* ACCIONES (CHECK-IN / CHECK-OUT) */}
        {canManageAttendance && <AttendanceActions />}
      </div>
    </DashboardLayout>
  );
}
