'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';

type Service = {
  id: string;
  name: string;
};

type EmployeeStats = {
  totalAppointments: number;
  topService: {
    name: string;
    total: number;
  } | null;
};

type Performance = {
  period: 'day' | 'week' | 'month';
  punctuality: {
    late_arrivals: number;
    early_departures: number;
  };
  productivity: {
    total_services: number;
    average_per_day: number;
  };
  services_breakdown: {
    name: string;
    total: number;
  }[];
  top_service: {
    name: string;
    total: number;
  } | null;
};

export function EmployeeDetail({ employee, onRefresh }: any) {
  const [services, setServices] = useState<Service[]>([]);
  const [assigned, setAssigned] = useState<Service[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);

  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [performance, setPerformance] = useState<Performance | null>(null);

  const [loading, setLoading] = useState(false);

  /* LOAD BASE */
  useEffect(() => {
    if (!employee) return;

    const loadBase = async () => {
      setLoading(true);

      try {
        setServices(await apiFetch<Service[]>('/services?active=true'));
      } catch {
        setServices([]);
      }

      try {
        setAssigned(
          await apiFetch<Service[]>(`/employees/${employee.id}/services`)
        );
      } catch {
        setAssigned([]);
      }

      try {
        setStats(
          await apiFetch<EmployeeStats>(`/employees/${employee.id}/stats`)
        );
      } catch {
        setStats(null);
      }

      setLoading(false);
    };

    loadBase();
  }, [employee]);

  /* PERFORMANCE */
  useEffect(() => {
    if (!employee) return;

    apiFetch<Performance>(
      `/employees/${employee.id}/performance?period=${period}`
    )
      .then(setPerformance)
      .catch(() => setPerformance(null));
  }, [employee, period]);

  /* TOGGLE EMPLOYEE */
  const toggleEmployee = async () => {
    await apiFetch(`/employees/${employee.id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ active: !employee.active }),
    });

    onRefresh();
  };

  /* TOGGLE SERVICE */
  const toggleService = async (serviceId: string) => {
    const isAssigned = assigned.some(s => s.id === serviceId);

    await apiFetch(
      `/employees/${employee.id}/services/${serviceId}`,
      { method: isAssigned ? 'DELETE' : 'POST' }
    );

    setAssigned(
      await apiFetch<Service[]>(`/employees/${employee.id}/services`)
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Cargando…
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg p-4 sm:p-5 space-y-6 bg-white">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold">
            {employee.first_name} {employee.last_name}
          </h3>

          {employee.phone && (
            <p className="text-sm text-gray-500">
              Teléfono: {employee.phone}
            </p>
          )}
        </div>

        <button
          onClick={toggleEmployee}
          className={`px-4 py-2 rounded-md text-sm ${
            employee.active
              ? 'bg-red-100 text-red-600'
              : 'bg-green-100 text-green-600'
          }`}
        >
          {employee.active ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      {/* SERVICIOS */}
      <div>
        <h4 className="font-medium mb-2">
          Servicios asignados
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {services.map(s => {
            const isAssigned = assigned.some(a => a.id === s.id);

            return (
              <label
                key={s.id}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isAssigned}
                  onChange={() => toggleService(s.id)}
                  className="accent-black"
                />
                <span>{s.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* MÉTRICAS BASE */}
      {stats && (
        <div className="border-t pt-4 space-y-1 text-sm">
          <p>
            <strong>Citas realizadas:</strong>{' '}
            {stats.totalAppointments}
          </p>
          <p>
            <strong>Servicio top:</strong>{' '}
            {stats.topService
              ? `${stats.topService.name} (${stats.topService.total})`
              : '—'}
          </p>
        </div>
      )}

      {/* PERFORMANCE */}
      {performance && (
        <div className="border-t pt-4 space-y-4 text-sm">
          {/* SELECTOR */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-medium">
              Periodo
            </span>
            <select
              value={period}
              onChange={e =>
                setPeriod(
                  e.target.value as 'day' | 'week' | 'month'
                )
              }
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="day">Hoy</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </div>

          {/* PUNTUALIDAD */}
          <div>
            <strong>Puntualidad</strong>
            <p>Llegadas tarde: {performance.punctuality.late_arrivals}</p>
            <p>Salidas tempranas: {performance.punctuality.early_departures}</p>
          </div>

          {/* PRODUCTIVIDAD */}
          <div>
            <strong>Productividad</strong>
            <p>Servicios: {performance.productivity.total_services}</p>
            <p>Promedio diario: {performance.productivity.average_per_day}</p>
          </div>

          {/* BREAKDOWN */}
          <div>
            <strong>Servicios realizados</strong>
            {performance.services_breakdown.length > 0 ? (
              <ul className="list-disc pl-4 mt-1">
                {performance.services_breakdown.map(s => (
                  <li key={s.name}>
                    {s.name}: {s.total}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">
                Sin servicios en este periodo.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
