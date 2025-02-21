import Taro from "@tarojs/taro";
import request, { BASE_URL } from "../lib/request";

type SystemType = "history" | "travel" | "tease";

export function getPhotoBySystem(system: SystemType) {
  return request.get(`/photo/list/${system}`);
}

export function getPhotoById(id: number) {
  return request.get(`/photo/get/${id}`);
}

export function getMyUploadedPhotos() {
  return request.get("/photo/myUploaded");
}

export function votePhoto(photoId: number) {
  return request.post("/photo/vote", {
    photoId,
  });
}

export function cancelPhotoVote(photoId: number) {
  return request.post("/photo/cancelVote", {
    photoId,
  });
}

export function uploadPhoto(params: {
  name: string;
  system: string;
  categoryId?: number;
  newCategory?: string;
  filePath: string;
}) {
  const { filePath, ...rest } = params;
  if (rest.categoryId === 0) {
    delete rest.categoryId;
  }
  return new Promise((res, rej) => {
    try {
      const token = Taro.getStorageSync("token");
      Taro.uploadFile({
        url: `${BASE_URL}/photo/upload_photo`, // 上传接口地址
        header: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        filePath: filePath, // 文件路径（第一个选中的图片）
        name: "file", // 后端接收文件的字段名,
        formData: {
          ...rest,
        },
        success: (response) => {
          res(JSON.parse(response.data));
          console.log("上传完成", response.data);
        },
        fail: (error) => {
          console.log("上传失败", error);
          rej(error);
        },
      });
    } catch (e) {
      console.log(e);
      rej(e);
    }
  });
}
