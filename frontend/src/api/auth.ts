// src/api/auth.ts

import instance from "./axios";

export const signup = async (
  email: string,
  password: string,
  role: string,
  name: string
) => {
  const res = await instance.post("/auth/signup", {
    email,
    password,
    role,
    name,
  });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await instance.post("/auth/login", { email, password });
  return res.data;
};

export const logoutFunc = async () => {
  const res = await instance.post("/auth/logout");
  return res.data;
};
