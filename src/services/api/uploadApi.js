import { apiRequest } from "./apiClient.js";

export async function uploadAttachments(files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }

  const res = await apiRequest("/upload", {
    method: "POST",
    body: formData,
    isFormData: true,
  });

  return res.data?.files || [];
}
