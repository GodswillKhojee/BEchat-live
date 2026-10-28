import { apiRequest, setAuthToken } from "./apiClient.js";

export async function registerUser({ name, email, password }) {
  const res = await apiRequest("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
  if (res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res.data;
}

export async function loginUser({ email, password }) {
  const res = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (res.data?.token) {
    setAuthToken(res.data.token);
  }
  return res.data;
}

export async function getMe() {
  const res = await apiRequest("/auth/me", { method: "GET" });
  return res.data;
}

export async function logoutUser() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    setAuthToken(null);
  }
}
