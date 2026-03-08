"use client";

import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

const UserContext = createContext<User | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): User | null {
  return useContext(UserContext);
}
