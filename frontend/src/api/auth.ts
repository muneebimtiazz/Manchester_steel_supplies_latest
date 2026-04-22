import api from "./axios";

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const register = (data: { fname: string; lname:string; email: string; password: string }) =>
  api.post("/auth/register", data);

export const logout = () =>
  api.post("/auth/logout");

export const refresh = () =>
  api.post("/auth/refresh");

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};