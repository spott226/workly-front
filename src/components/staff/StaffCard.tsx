'use client';

import { activateStaff, deactivateStaff } from '@/lib/staff';

export function StaffCard({
  staff,
  activity,
  onChange,
}: {
  staff: any;
  activity: Record<string, number>;
  onChange: () => void;
}) {
  async function toggleStatus() {
    if (staff.is_active) {
      await deactivateStaff(staff.id);
    } else {
      await activateStaff(staff.id);
    }
    onChange();
  }

  return (
    <div className="w-full border rounded-lg p-4 sm:p-5 bg-white space-y-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-black truncate">
            {staff.email}
          </p>
          <p className="text-sm text-gray-600">
            Estado: {staff.is_active ? 'Activo' : 'Inactivo'}
          </p>
        </div>

        <button
          onClick={toggleStatus}
          className="w-full sm:w-auto px-4 py-2 rounded-md text-sm font-semibold border border-black bg-white hover:bg-gray-100 transition"
        >
          {staff.is_active ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      {/* ACTIVIDAD */}
      <div className="border-t pt-3 text-sm text-gray-800">
        <p className="font-medium mb-2">
          Actividad registrada
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
          <li>
            Citas creadas:{' '}
            <strong>{activity.APPOINTMENT_CREATED || 0}</strong>
          </li>
          <li>
            Confirmaciones:{' '}
            <strong>{activity.CONFIRM_APPOINTMENT || 0}</strong>
          </li>
          <li>
            Cancelaciones:{' '}
            <strong>{activity.CANCEL_APPOINTMENT || 0}</strong>
          </li>
          <li>
            Reagendadas:{' '}
            <strong>{activity.RESCHEDULE_APPOINTMENT || 0}</strong>
          </li>
          <li>
            No show marcados:{' '}
            <strong>{activity.MARK_NO_SHOW || 0}</strong>
          </li>
          <li>
            Asistencias marcadas:{' '}
            <strong>{activity.MARK_ATTENDED || 0}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}
