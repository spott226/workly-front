'use client';

import { DateTime } from 'luxon';

type Props = {
  slots: DateTime[];
  onSelect: (iso: string) => void;
};

export function EmployeeTimeSelector({ slots, onSelect }: Props) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-red-600 mt-3">
        Esta empleada no tiene horarios disponibles
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-semibold text-sm">
        Horarios disponibles
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map(slot => (
          <button
            key={slot.toISO()}
            onClick={() => onSelect(slot.toISO()!)}
            className="px-3 py-2 border rounded text-sm hover:bg-black hover:text-white"
          >
            {slot.toFormat('HH:mm')}
          </button>
        ))}
      </div>
    </div>
  );
}
