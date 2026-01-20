'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';

export default function RegisterPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          business_name: businessName,
          email,
          password,
        }),
      });

      router.replace('/register/pending');
    } catch {
      setError('No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Empieza hoy
          </h1>
          <p className="text-gray-500 text-sm">
            Gestiona citas, empleados y clientes desde un solo lugar
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Nombre del negocio
            </label>
            <input
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Ej. Cheli Spa"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="correo@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Al crear una cuenta aceptas nuestros términos y condiciones.
        </p>
      </div>
    </main>
  );
}
