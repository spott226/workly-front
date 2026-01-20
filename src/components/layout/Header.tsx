'use client';

import { logout } from '@/lib/logout';
import { useMobileSidebar } from '@/context/MobileSidebarContext';

type Props = {
  businessName?: string;
};

export function Header({ businessName }: Props) {
  const { setOpen } = useMobileSidebar();

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="h-14 sm:h-16 max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
        
        {/* IZQUIERDA */}
        <div className="flex items-center gap-3 min-w-0">
          {/* ☰ SOLO MÓVIL */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 active:bg-gray-200"
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-800"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="font-semibold text-base sm:text-lg truncate">
            {businessName || ''}
          </h1>
        </div>

        {/* DERECHA */}
        <button
          onClick={logout}
          className="text-sm font-medium text-red-600 hover:underline px-3 py-2 rounded-md"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
