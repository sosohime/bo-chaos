import { basePath } from "../../env";
import type { ApiResponse } from "@mono/types";

// 创建一个通用的fetch函数，处理认证和错误
export async function apiFetch<T>(url: string, options: RequestInit = {}) {
  const API_BASE_URL =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BOFANS_API_BASE_URL || "/api"
      : "http://localhost:3001/api";

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: "include", // 确保Cookie被发送
    });

    // 处理401未授权错误
    if (response.status === 401) {
      window.location.href = basePath + "/login";
      throw new Error("登录已过期");
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || "API请求失败");
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    console.error("API请求失败:", error);
    throw error;
  }
}
