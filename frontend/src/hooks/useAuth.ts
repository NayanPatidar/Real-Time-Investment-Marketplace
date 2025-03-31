// hooks/useAuth.ts

import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { getUser, isAuthenticated, logout } from "@/utils/auth";

interface JwtPayload {
  exp: number;
  id: number;
  role: string;
  name: string;
  email: string;
}

// Define proper user type
type User = JwtPayload | null;

export const useAuth = () => {
  // Initialize state with proper types
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user data on initial render
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");

        if (storedToken && isAuthenticated()) {
          setToken(storedToken);

          // Use getuser() with proper typing
          const userData = getUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Save token to localStorage
      localStorage.setItem("token", data.token);

      const decoded = jwtDecode<JwtPayload>(data.token);
      setToken(data.token);
      setUser(decoded);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setUser(null);
    setToken(null);
    logout();
  }, []);

  return {
    user,
    token,
    loading,
    login,
    logout: handleLogout,
    isAuthenticated: !!user,
    role: user ? user.role : null,
  };
};

export default useAuth;
