import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t text-xs text-gray-500 py-4 mt-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
        <Link href="/legal/terms" className="hover:underline">
          Términos y condiciones
        </Link>

        <Link href="/legal/privacy" className="hover:underline">
          Política de privacidad
        </Link>

        <span>© {new Date().getFullYear()} Tu SaaS</span>
      </div>
    </footer>
  );
}
