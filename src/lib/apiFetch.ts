type ApiFetchOptions = RequestInit & {
  public?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 🔐 Token solo para rutas privadas
  if (!options.public) {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },

      // 🔥 CLAVE DEL BUG — desactiva cache de Next
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    if (res.status === 404 || res.status === 204) {
      return null as T;
    }

    const error = await res.json().catch(() => null);
    throw new Error(error?.message || 'API error');
  }

  return res.json();
}
