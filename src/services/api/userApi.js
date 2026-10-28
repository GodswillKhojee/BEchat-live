import { apiRequest } from "./apiClient.js";

export async function fetchUsers(query = "") {
  const queryStr = query ? `?q=${encodeURIComponent(query)}` : "";
  const res = await apiRequest(`/users${queryStr}`, { method: "GET" });
  return res.data?.users || [];
}

export async function updateUserProfile(profileData) {
  const res = await apiRequest("/users/profile", {
    method: "PATCH",
    body: profileData,
  });
  return res.data?.user;
}

export async function updateUserStatus(status) {
  const res = await apiRequest("/users/status", {
    method: "PATCH",
    body: { status },
  });
  return res.data?.user;
}
