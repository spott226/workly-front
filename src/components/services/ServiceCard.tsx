import { apiFetch } from '@/lib/apiFetch';

type Props = {
  service: {
    id: string;
    name: string;
    duration_minutes: number;
    price_min: number;
    price_max: number;
    is_active: boolean;
  };
  onChange: () => void;
};

export function ServiceCard({ service, onChange }: Props) {
  const toggleActive = async () => {
    await apiFetch(`/services/${service.id}/active`, {
      method: 'PATCH',
      body: JSON.stringify({
        active: !service.is_active,
      }),
    });

    onChange();
  };

  return (
    <div className="w-full border rounded-lg p-4 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* INFO */}
      <div className="min-w-0">
        <p className="font-medium truncate">{service.name}</p>
        <p className="text-sm text-gray-500">
          {service.duration_minutes} min · ${service.price_min} – ${service.price_max}
        </p>
      </div>

      {/* STATUS */}
      <button
        onClick={toggleActive}
        className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm border transition ${
          service.is_active
            ? 'border-black bg-gray-100 text-black'
            : 'border-gray-300 text-gray-400'
        }`}
      >
        {service.is_active ? 'Activo' : 'Inactivo'}
      </button>
    </div>
  );
}
