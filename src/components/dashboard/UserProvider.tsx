"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type User = {
  _id: string;
  fullName: string;
  lastName?: string;
  email: string;
  avatar?: string;
  role?: string;
  bio?: string;
  username?: string;
  phone?: string;
  city?: string;
  country?: string;
  zip?: string;
  timezone?: string;
  plan?: string;
  createdAt?: string;
};

export type Activity = {
  _id: string;
  action: string;
  detail: string;
  createdAt: string;
};

type Ctx = {
  user: User | null;
  activities: Activity[];
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: User) => void;
};

const UserContext = createContext<Ctx>({
  user: null,
  activities: [],
  loading: true,
  refresh: async () => {},
  setUser: () => {},
});

export function UserProvider({
  initialUser,
  children,
}: {
  initialUser: User;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setActivities(data.activities ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, activities, loading, refresh, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
