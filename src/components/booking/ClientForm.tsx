'use client';

type Props = {
  clientName: string;
  phone: string;
  onChange: (data: { clientName?: string; phone?: string }) => void;
};

export function ClientForm({ clientName, phone, onChange }: Props) {
  return (
    <div className="w-full space-y-3">
      <h2 className="font-semibold text-sm md:text-base">
        Tus datos
      </h2>

      <input
        value={clientName}
        placeholder="Nombre completo"
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        onChange={(e) => onChange({ clientName: e.target.value })}
      />

      <input
        value={phone}
        placeholder="Teléfono"
        inputMode="tel"
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        onChange={(e) => onChange({ phone: e.target.value })}
      />
    </div>
  );
}
