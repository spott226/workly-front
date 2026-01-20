export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'ATTENDED'
  | 'NO_SHOW';

export type Appointment = {
  id: string;
  client_name: string;
  phone: string;
  service_name: string;
  employee_name: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
};

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    client_name: 'Juan Pérez',
    phone: '449 123 45 67',
    service_name: 'Corte de cabello',
    employee_name: 'Carlos',
    startsAt: '2026-01-11T10:00:00.000Z',
    endsAt: '2026-01-11T10:30:00.000Z',
    status: 'PENDING',
  },
  {
    id: '2',
    client_name: 'Ana López',
    phone: '449 987 65 43',
    service_name: 'Color',
    employee_name: 'María',
    startsAt: '2026-01-11T11:30:00.000Z',
    endsAt: '2026-01-11T12:30:00.000Z',
    status: 'CONFIRMED',
  },
];
