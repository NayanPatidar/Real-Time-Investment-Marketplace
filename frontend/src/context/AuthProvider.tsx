// src/context/AuthContext.tsx
import { ReactNode, createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface AuthContextType {
  user: {
    id: number;
    role: string;
    name?: string;
    exp: number;
  } | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
