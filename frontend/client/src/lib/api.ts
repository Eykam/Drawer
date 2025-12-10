import { hc } from "hono/client";
import type { AppType } from "@backend/index";

const API_BASE_URL = "/api";

// Create typed Hono client
export const api = hc<AppType>(API_BASE_URL, {
  headers: (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

// Helper to store token after login
export const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const clearAuthToken = () => {
  localStorage.removeItem("token");
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};
