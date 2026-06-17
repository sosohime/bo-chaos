import { apiFetch } from "@/lib/api-client";

export async function login(data: {
  account: string;
  password: string;
}): Promise<boolean> {
  const response = await apiFetch<boolean>("/admin/auth/login", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });
  return response.data;
}
