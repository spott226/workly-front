'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/apiFetch';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch<{
        token: string;
        user: {
          id: string;
          email: string;
          role: 'OWNER' | 'STAFF';
          plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
        };
      }>('/auth/login', {
        method: 'POST',
        public: true,
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', res.token);
      document.cookie = `token=${res.token}; path=/`;

      setUser(res.user);
      router.replace('/dashboard');
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-4">
      {/* 🔥 FORM CONTROLADO QUE MATA CUALQUIER SUBMIT NATIVO */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // 👈 ESTO MATA EL POST /login
          handleSubmit();
        }}
        className="w-full max-w-sm rounded-2xl bg-neutral-900/80 backdrop-blur border border-neutral-800 shadow-2xl p-8 space-y-6"
      >
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-neutral-400">
            Inicia sesión para gestionar tu negocio
          </p>
        </header>

        <div className="space-y-4">
          <input
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm text-white"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm text-white"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center">
            {error}
          </p>
        )}

        {/* SUBMIT CONTROLADO */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-white text-black py-2.5 text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <footer className="text-center text-xs text-neutral-500">
          © 2026 · SaaS Citas
        </footer>
      </form>
    </main>
  );
}
