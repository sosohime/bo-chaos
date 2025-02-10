import Taro from "@tarojs/taro";

interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
}

// 基础配置
const BASE_URL = "http://127.0.0.1:3000/bofans";

// 微信登录
export const wxLogin = async () => {
  try {
    const { code } = await Taro.login();
    // 调用后端登录接口
    const res = await Taro.request({
      url: `${BASE_URL}/auth/login`,
      method: "POST",
      data: { code },
    });

    if (res.statusCode === 200) {
      // 保存token
      Taro.setStorageSync("token", res.data.access_token);
      return res.data.user;
    }
    return null;
  } catch (error) {
    console.error("微信登录失败:", error);
    return null;
  }
};

// 请求拦截器
const request = async <T>(
  options: Taro.request.Option,
): Promise<ResponseData<T>> => {
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

    return response.data;
  } catch (error) {
    Taro.showToast({
      title: error.message || "请求失败",
      icon: "none",
    });
    throw error;
  }
};

// 导出请求方法
export const http = {
  get: <T>(url: string, data?: any) => {
    return request<T>({
      url,
      method: "GET",
      data,
    });
  },
  post: <T>(url: string, data?: any) => {
    return request<T>({
      url,
      method: "POST",
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
