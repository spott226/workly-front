import { DateTime } from 'luxon';

type Appointment = {
  starts_at: string;
  ends_at: string;
};

type Params = {
  date: DateTime;
  serviceDuration: number;
  opening_time: string;
  closing_time: string;
  interval: number;
  appointments: Appointment[];
};

export function getAvailableTimeSlots({
  date,
  serviceDuration,
  opening_time,
  closing_time,
  interval,
  appointments,
}: Params) {
  const zone = 'America/Mexico_City';

  const [oh, om] = opening_time.split(':').map(Number);
  const [ch, cm] = closing_time.split(':').map(Number);

  const start = date.setZone(zone).set({ hour: oh, minute: om });
  const end = date.setZone(zone).set({ hour: ch, minute: cm });

  const slots: DateTime[] = [];
  let cursor = start;

  while (cursor.plus({ minutes: serviceDuration }) <= end) {
    const overlaps = appointments.some(a => {
      const aStart = DateTime.fromISO(a.starts_at, { zone: 'utc' }).setZone(zone);
      const aEnd = DateTime.fromISO(a.ends_at, { zone: 'utc' }).setZone(zone);

      return (
        cursor < aEnd &&
        cursor.plus({ minutes: serviceDuration }) > aStart
      );
    });

    if (!overlaps) {
      slots.push(cursor);
    }

    cursor = cursor.plus({ minutes: interval });
  }

  return slots;
}
