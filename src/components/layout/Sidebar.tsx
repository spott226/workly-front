'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  role: 'OWNER' | 'STAFF';
};

export function Sidebar({ role }: Props) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `px-3 py-2 rounded-md transition ${
      pathname === path
        ? 'bg-gray-800 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <aside className="bg-gray-900 text-white md:w-64 w-full md:h-screen md:sticky md:top-0">
      {/* HEADER */}
      <div className="h-14 md:h-16 flex items-center px-4 border-b border-gray-800">
        <span className="text-lg font-bold">Dashboard</span>
      </div>

      {/* NAV */}
      <nav className="flex flex-col gap-1 px-3 py-4 text-sm">
        <Link href="/dashboard" className={linkClass('/dashboard')}>
          Inicio
        </Link>

        <Link href="/appointments" className={linkClass('/appointments')}>
          Citas
        </Link>

        {role === 'OWNER' && (
          <>
            <Link href="/attendance" className={linkClass('/attendance')}>
              Asistencias
            </Link>

            <Link href="/employees" className={linkClass('/employees')}>
              Empleados
            </Link>

            <Link href="/services" className={linkClass('/services')}>
              Servicios
            </Link>

            <Link href="/staff" className={linkClass('/staff')}>
              Staff
            </Link>

            <Link href="/clients" className={linkClass('/clients')}>
              Clientes
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
