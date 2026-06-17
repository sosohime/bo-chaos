import Taro from "@tarojs/taro";
import type { ApiResponse } from "@mono/types";

declare const BOFANS_API_BASE_URL: string;

export const BASE_URL = BOFANS_API_BASE_URL;

type UploadOptions = {
  url: string;
  filePath: string;
  name?: string;
  formData?: Record<string, string | number | boolean | undefined>;
  onProgress?: (progress: number) => void;
};

export function buildQuery(
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  if (!params) return "";
  const query = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
  return query ? `?${query}` : "";
}

function unwrapApiResponse<T>(responseData: unknown): T {
  const body = responseData as ApiResponse<T>;
  if (body?.meta) {
    return responseData as T;
  }
  return body?.data === undefined ? (responseData as T) : body.data;
}

// 微信登录
export const wxLogin = async () => {
  try {
    const { code } = await Taro.login();
    // 调用后端登录接口
    const res = await Taro.request({
      url: `${BASE_URL}/auth/wechat-login`,
      method: "POST",
      data: { code },
    });
    if (res.statusCode === 200) {
      const body = res.data as ApiResponse<{ accessToken: string }>;
      // 保存token
      Taro.setStorageSync("token", body.data.accessToken);
      return body.data.accessToken;
    }
    return null;
  } catch (error) {
    console.error("微信登录失败:", error);
    return null;
  }
};

// 请求拦截器
const request = async <T>(options: Taro.request.Option): Promise<T> => {
  try {
    // 添加token
    const token = Taro.getStorageSync("token");
    const header = {
      ...options.header,
      Authorization: token ? `Bearer ${token}` : "",
    };

    // 发起请求
    const response = await Taro.request({
      ...options,
      url: `${BASE_URL}${options.url}`,
      header,
    });

    // 处理401未授权
    if (response.statusCode === 401) {
      // 尝试重新登录
      const newToken = await wxLogin();
      if (newToken) {
        // 重试请求
        return request({
          ...options,
          header: {
            ...options.header,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } else {
        throw new Error("登录失败");
      }
    }

    return unwrapApiResponse<T>(response.data);
  } catch (error) {
    Taro.showToast({
      title: error instanceof Error ? error.message : "请求失败",
      icon: "none",
    });
    throw error;
  }
};

export function uploadFile<T>({
  url,
  filePath,
  name = "file",
  formData,
  onProgress,
}: UploadOptions) {
  return new Promise<T>((resolve, reject) => {
    try {
      const token = Taro.getStorageSync("token");
      const task = Taro.uploadFile({
        url: `${BASE_URL}${url}`,
        header: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        filePath,
        name,
        formData,
        success: (response) => {
          try {
            resolve(unwrapApiResponse<T>(JSON.parse(response.data)));
          } catch (error) {
            reject(error);
          }
        },
        fail: reject,
      });
      if (onProgress) {
        task.onProgressUpdate((progress) => {
          onProgress(progress.progress);
        });
      }
    } catch (error) {
      reject(error);
    }
  });
}

// 导出请求方法
export const http = {
  get: <T>(url: string, data?: any) => {
    return request<T>({
      url,
      method: "GET",
      data,
    });
  },
  post: <T>(url: string, data?: any, header?: any) => {
    return request<T>({
      url,
      method: "POST",
      header,
      data,
    });
  },
  patch: <T>(url: string, data?: any) => {
    return request<T>({
      url,
      method: "PATCH",
      data,
    });
  },
  put: <T>(url: string, data?: any) => {
    return request<T>({
      url,
      method: "PUT",
      data,
    });
  },
  delete: <T>(url: string, data?: any) => {
    return request<T>({
      url,
      method: "DELETE",
      data,
    });
  },
};

export default http;
