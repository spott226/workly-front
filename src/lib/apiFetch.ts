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

  // 🔐 SOLO agrega token si NO es ruta pública
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
    }
  );

  if (!res.ok) {
  // 👇 tolerar endpoints informativos
  if (res.status === 404 || res.status === 204) {
    return null as T;
  }

  const error = await res.json().catch(() => null);
  throw new Error(error?.message || 'API error');
}

  return res.json();
}
