'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { apiFetch } from '@/lib/apiFetch';
import { EmployeeTimeSelector } from './EmployeeTimeSelector';

type SlotResponse = {
  startISO: string;
};

type Props = {
  serviceId: string | null;
  employeeId: string | null;
  onSelect: (iso: string) => void;
  publicMode?: boolean;
};

export function EmployeeAvailability({
  serviceId,
  employeeId,
  onSelect,
  publicMode = false,
}: Props) {
  const [slots, setSlots] = useState<DateTime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId || !employeeId) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSlots([]);

    apiFetch<SlotResponse[]>(
      `/availability?serviceId=${serviceId}&employeeId=${employeeId}`,
      publicMode ? { public: true } : undefined
    )
      .then((res) => {
        if (cancelled) return;

        const parsed =
          Array.isArray(res)
            ? res
                .map((s) =>
                  DateTime.fromISO(s.startISO, { zone: 'utc' })
                )
                .filter((d) => d.isValid)
            : [];

        setSlots(parsed);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, employeeId, publicMode]);

  if (!serviceId || !employeeId) return null;

  if (loading) {
    return (
      <p className="text-sm opacity-60 mt-3">
        Cargando horarios…
      </p>
    );
  }

  return (
    <EmployeeTimeSelector
      slots={slots}
      onSelect={onSelect}
    />
  );
}
