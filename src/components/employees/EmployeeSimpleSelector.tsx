'use client';

type Employee = {
  id: string;
  name: string;
};

type Props = {
  employees: Employee[];
  value: Employee | null;
  onChange: (emp: Employee | null) => void;
};

export function EmployeeSimpleSelector({
  employees,
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        Empleado
      </label>

      <select
        className="w-full border rounded px-3 py-2"
        value={value?.id ?? ''}
        onChange={(e) => {
          const emp =
            employees.find(x => x.id === e.target.value) || null;
          onChange(emp);
        }}
      >
        <option value="">Selecciona un empleado</option>

        {employees.map(e => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
    </div>
  );
}
