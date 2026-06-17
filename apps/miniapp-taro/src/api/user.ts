import Taro from "@tarojs/taro";
import request, { BASE_URL } from "../lib/request";
import type { UserProfileDto } from "@mono/types";

export function getUserInfo() {
  return request.get<UserProfileDto | null>("/users/me");
}

export function updateNickname(nickname: string) {
  return request.patch<UserProfileDto | null>("/users/me", {
    nickname,
  });
}

export function uploadAvatar({ filePath }: { filePath: string }) {
  return new Promise<UserProfileDto>((res, rej) => {
    try {
      const token = Taro.getStorageSync("token");
      Taro.uploadFile({
        url: `${BASE_URL}/users/me/avatar`,
        header: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        filePath,
        name: "file",
        success: (response) => {
          const body = JSON.parse(response.data);
          res(body.data);
        },
        fail: (error) => {
          rej(error);
        },
      });
    } catch (e) {
      console.log(e);
      rej(e);
    }
  });
}
