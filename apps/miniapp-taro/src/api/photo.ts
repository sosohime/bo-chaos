import Taro from "@tarojs/taro";
import request, { BASE_URL } from "../lib/request";
import type {
  CategorySystem,
  PageResponse,
  PhotoDto,
  UploadedPhotoStatusFilter,
  VoteResponse,
} from "@mono/types";

export function getPhotoBySystem(system: CategorySystem) {
  return request.get<PageResponse<PhotoDto>>(`/photos?system=${system}`);
}

export function getPhotoById(id: number) {
  return request.get<PhotoDto | null>(`/photos/${id}`);
}

export function getMyUploadedPhotos(params?: {
  status?: UploadedPhotoStatusFilter;
  page?: number;
  pageSize?: number;
}) {
  const query: string[] = [];
  if (params?.status) query.push(`status=${params.status}`);
  if (params?.page) query.push(`page=${params.page}`);
  if (params?.pageSize) query.push(`pageSize=${params.pageSize}`);
  const suffix = query.length ? `?${query.join("&")}` : "";
  return request.get<PageResponse<PhotoDto>>(`/photos/my${suffix}`);
}

export function votePhoto(photoId: number) {
  return request.post<VoteResponse>(`/photos/${photoId}/vote`);
}

export function cancelPhotoVote(photoId: number) {
  return request.delete<VoteResponse>(`/photos/${photoId}/vote`);
}

export function uploadPhoto(
  params: {
    name: string;
    system: CategorySystem;
    categoryId?: number;
    newCategory?: string;
    filePath: string;
  },
  processHandle?: (progress: number) => void,
) {
  const { filePath, ...rest } = params;
  if (rest.categoryId === 0) {
    delete rest.categoryId;
  }
  return new Promise<PhotoDto>((res, rej) => {
    try {
      const token = Taro.getStorageSync("token");
      const task = Taro.uploadFile({
        url: `${BASE_URL}/photos`,
        header: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        filePath,
        name: "file",
        formData: {
          ...rest,
        },
        success: (response) => {
          const body = JSON.parse(response.data);
          res(body.data);
        },
        fail: (error) => {
          console.log("上传失败", error);
          rej(error);
        },
      });
      if (processHandle) {
        task.onProgressUpdate((progress) => {
          processHandle(progress.progress);
        });
      }
    } catch (e) {
      console.log(e);
      rej(e);
    }
  });
}
