// context/UserContext.tsx
"use client";

import { AuthUser } from "@/utilities/types";
import { createContext, useContext } from "react";


const UserContext = createContext<AuthUser>(null);

export function UserProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  return useContext(UserContext);
};
