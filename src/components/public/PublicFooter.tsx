import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="mt-10 border-t pt-6 text-center text-xs text-gray-500 space-y-2">
      <p>
        © {new Date().getFullYear()} Turnify
      </p>

      <div className="flex justify-center gap-4 underline">
        <Link href="/legal/terminos">Términos</Link>
        <Link href="/legal/privacidad">Privacidad</Link>
      </div>
    </footer>
  );
}
