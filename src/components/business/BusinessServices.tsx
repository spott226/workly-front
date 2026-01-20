import { mockServices } from '@/mocks/services';

export function BusinessServices() {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">
        Servicios
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockServices.map((s) => (
          <div
            key={s.id}
            className="border rounded-lg p-4 bg-white"
          >
            <p className="font-medium truncate">{s.name}</p>

            <p className="text-sm text-gray-500 mt-1">
              {s.duration} min · ${s.price}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
