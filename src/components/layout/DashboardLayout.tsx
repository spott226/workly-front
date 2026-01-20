'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUser } from '@/context/UserContext';
import { apiFetch } from '@/lib/apiFetch';
import {
  MobileSidebarProvider,
  useMobileSidebar,
} from '@/context/MobileSidebarContext';
import Link from 'next/link';

type Business = {
  id: string;
  name: string;
  slug: string;
};

/* =========================
   FOOTER GLOBAL LEGAL
========================= */
function Footer() {
  return (
    <footer className="border-t bg-white text-xs text-gray-500">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
        <Link href="/legal/terms" className="hover:underline">
          Términos y condiciones
        </Link>

        <Link href="/legal/privacy" className="hover:underline">
          Política de privacidad
        </Link>

        <span>© {new Date().getFullYear()} Workly </span>
      </div>
    </footer>
  );
}

/* =========================
   LAYOUT INTERNO
========================= */
function LayoutContent({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const [business, setBusiness] = useState<Business | null>(null);
  const { open, setOpen } = useMobileSidebar();

  useEffect(() => {
    async function loadBusiness() {
      try {
        const data = await apiFetch<Business>('/businesses/me');
        setBusiness(data);
      } catch {}
    }
    loadBusiness();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Cargando…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">No autenticado</p>
      </div>
    );
  }

  const { role } = user;

  return (
    <div className="min-h-screen w-full flex bg-gray-50 relative">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <Sidebar role={role} />
      </aside>

      {/* SIDEBAR MÓVIL */}
      {open && (
        <>
          {/* overlay */}
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />

          {/* drawer */}
          <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-50 lg:hidden">
            <Sidebar role={role} />
          </aside>
        </>
      )}

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER STICKY (CLAVE) */}
        <div className="sticky top-0 z-30">
          <Header businessName={business?.name} />
        </div>

        <main className="flex-1 w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* FOOTER GLOBAL */}
        <Footer />
      </div>
    </div>
  );
}

/* =========================
   EXPORT FINAL
========================= */
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <MobileSidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </MobileSidebarProvider>
  );
}
