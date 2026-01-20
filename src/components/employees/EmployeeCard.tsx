'use client';

type Props = {
  employee: any;
  selected: boolean;
  onSelect: () => void;
};

export function EmployeeCard({ employee, selected, onSelect }: Props) {
  return (
    <div
      onClick={onSelect}
      className={`w-full border rounded-lg p-4 cursor-pointer transition ${
        selected
          ? 'border-black bg-gray-100'
          : 'hover:border-gray-400'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium truncate">
          {employee.first_name} {employee.last_name}
        </span>

        <span className="text-sm text-gray-500">
          {employee.active ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  );
}
