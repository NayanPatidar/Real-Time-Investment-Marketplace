// utils/isAuthenticated.js
import { jwtDecode } from "jwt-decode";

export function isAuthenticated() {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const decoded = jwtDecode(token);

    const currentTime = Date.now() / 1000;
    if (!decoded || !decoded.exp || decoded.exp <= currentTime) {
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error("Invalid token:", error);
    return false;
  }
}

interface JwtPayload {
  exp: number;
  id: number;
  role: string;
}

export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  window.location.href = "/auth";
}

export function getUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded || null;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}
