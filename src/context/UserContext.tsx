'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, User } from '@/lib/user';

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // 🔑 Marca cuando ya estamos en cliente
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    // 🔥 si ya hay usuario (login reciente), no vuelvas a pegar
    if (user) {
      setLoading(false);
      return;
    }

    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [hydrated, user]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
