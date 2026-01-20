'use client';

import { useState } from 'react';
import { DateTime } from 'luxon';

type Props = {
  onSelect: (dateTimeISO: string | null) => void;
  minTime?: string;
  maxTime?: string;
};

export function DateTimeSelector({
  onSelect,
  minTime,
  maxTime,
}: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  function emit(d: string, t: string) {
    if (!d || !t) {
      onSelect(null);
      return;
    }

    const utcISO = DateTime
      .fromISO(`${d}T${t}`, { zone: 'America/Mexico_City' })
      .toUTC()
      .toISO();

    onSelect(utcISO);
  }

  return (
    <div className="w-full space-y-3">
      <h2 className="font-semibold text-sm md:text-base">
        Fecha y hora
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="date"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={date}
          onChange={(e) => {
            const d = e.target.value;
            setDate(d);
            emit(d, time);
          }}
        />

        <input
          type="time"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={time}
          min={minTime}
          max={maxTime}
          onChange={(e) => {
            const t = e.target.value;
            setTime(t);
            emit(date, t);
          }}
        />
      </div>
    </div>
  );
}
