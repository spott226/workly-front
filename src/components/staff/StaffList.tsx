'use client';

import { useEffect, useState } from 'react';
import { getStaff, createStaff } from '@/lib/staff';
import { apiFetch } from '@/lib/apiFetch';
import { StaffCard } from './StaffCard';

export function StaffList() {
  const [staff, setStaff] = useState<any[]>([]);
  const [activity, setActivity] = useState<Record<string, any>>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* LOAD STAFF */
  async function loadStaff() {
    const data = await getStaff();
    setStaff(data);
  }

  /* LOAD ACTIVITY */
  async function loadStaffActivity() {
    const res = await apiFetch<any[]>('/staff/activity/summary');

    const map: Record<string, any> = {};
    res.forEach(row => {
      if (!map[row.staff_user_id]) {
        map[row.staff_user_id] = {};
      }
      map[row.staff_user_id][row.action_type] = row.total;
    });

    setActivity(map);
  }

  useEffect(() => {
    loadStaff();
    loadStaffActivity();
  }, []);

  /* CREATE STAFF */
  async function handleCreate() {
    setLoading(true);
    setError(null);

    try {
      await createStaff({ email, password });
      setEmail('');
      setPassword('');
      await loadStaff();
      await loadStaffActivity();
    } catch (e: any) {
      setError(e.message || 'Error creando staff');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* CREAR STAFF */}
      <div className="border rounded-lg p-4 sm:p-5 bg-white space-y-4">
        <h2 className="font-semibold text-base sm:text-lg">
          Agregar staff
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="email"
            placeholder="Email"
            className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || !email || !password}
          className="w-full sm:w-auto px-5 py-2 rounded-md bg-black text-white text-sm disabled:bg-gray-300"
        >
          {loading ? 'Creando…' : 'Crear staff'}
        </button>
      </div>

      {/* LISTA STAFF */}
      <div className="space-y-4">
        {staff.length === 0 && (
          <p className="text-sm text-gray-500">
            Aún no hay usuarios de staff.
          </p>
        )}

        {staff.map(s => (
          <StaffCard
            key={s.id}
            staff={s}
            activity={activity[s.user_id] || {}}
            onChange={() => {
              loadStaff();
              loadStaffActivity();
            }}
          />
        ))}
      </div>
    </div>
  );
}
