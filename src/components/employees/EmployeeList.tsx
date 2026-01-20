'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { EmployeeCard } from './EmployeeCard';
import { EmployeeDetail } from './EmployeeDetail';
import { CreateEmployeeModal } from './CreateEmployeeModal';

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  active: boolean;
};

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadEmployees = async () => {
    const data = await apiFetch<Employee[]>('/employees');
    setEmployees(data);

    if (selected) {
      const updated = data.find(e => e.id === selected.id);
      setSelected(updated || null);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* LISTA */}
      <div className="w-full lg:w-1/3 space-y-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-2 bg-black text-white rounded-md"
        >
          Agregar empleado
        </button>

        <div className="space-y-2">
          {employees.map(emp => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              selected={selected?.id === emp.id}
              onSelect={() => setSelected(emp)}
            />
          ))}
        </div>
      </div>

      {/* DETALLE */}
      <div className="w-full lg:flex-1">
        {selected ? (
          <EmployeeDetail
            employee={selected}
            onRefresh={loadEmployees}
          />
        ) : (
          <div className="border rounded-lg p-4 text-sm text-gray-500">
            Selecciona un empleado para ver detalles.
          </div>
        )}
      </div>

      {showModal && (
        <CreateEmployeeModal
          onClose={() => setShowModal(false)}
          onCreated={loadEmployees}
        />
      )}
    </div>
  );
}
