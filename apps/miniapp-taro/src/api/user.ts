import Taro from "@tarojs/taro";
import request, { BASE_URL } from "../lib/request";
import type { User } from "@mono/prisma-client";

export function getUserInfo() {
  return request.get<User>("/users/userInfo");
}

export function updateNickname(nickname: string) {
  return request.post("/users/updateNickname", {
    nickname,
  });
}

export function uploadAvatar({ filePath }) {
  return new Promise((res, rej) => {
    try {
      const token = Taro.getStorageSync("token");
      Taro.uploadFile({
        url: `${BASE_URL}/users/updateAvatar`, // 上传接口地址
        header: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        filePath: filePath, // 文件路径（第一个选中的图片）
        name: "file", // 后端接收文件的字段名
        success: (response) => {
          console.log("上传成功", response.data);
          res(JSON.parse(response.data));
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
