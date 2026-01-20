import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token');

  // ✅ RUTAS PÚBLICAS REALES
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/business/') ||
    pathname.startsWith('/public/') || // 🔥 ESTA ERA LA CLAVE
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 🔐 RUTAS PRIVADAS
  if (!token) {
    return NextResponse.redirect(
      new URL('/login', req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
