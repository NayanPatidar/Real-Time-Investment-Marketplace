// src/api/auth.ts

import instance from "./axios";

export const signup = async (email: string, password: string, role: string) => {
  const res = await instance.post("/auth/signup", { email, password, role });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await instance.post("/auth/login", { email, password });
  return res.data;
};
