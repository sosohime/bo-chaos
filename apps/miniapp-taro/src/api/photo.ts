import request, { buildQuery, uploadFile } from "../lib/request";
import type {
  CategorySystem,
  PhotoListParams,
  PageResponse,
  PhotoDto,
  UploadPhotoRequest,
  UploadedPhotoStatusFilter,
  VoteResponse,
} from "@mono/types";

export function getPhotoBySystem(
  system: CategorySystem,
  params?: Pick<PhotoListParams, "page" | "pageSize">,
) {
  return request.get<PageResponse<PhotoDto>>(
    `/photos${buildQuery({ system, ...params })}`,
  );
}

export function getPhotoById(id: number) {
  return request.get<PhotoDto | null>(`/photos/${id}`);
}

export function getMyUploadedPhotos(params?: {
  status?: UploadedPhotoStatusFilter;
  page?: number;
  pageSize?: number;
}) {
  return request.get<PageResponse<PhotoDto>>(`/photos/my${buildQuery(params)}`);
}

export function votePhoto(photoId: number) {
  return request.post<VoteResponse>(`/photos/${photoId}/vote`);
}

export function cancelPhotoVote(photoId: number) {
  return request.delete<VoteResponse>(`/photos/${photoId}/vote`);
}

export function uploadPhoto(
  params: UploadPhotoRequest & { filePath: string },
  processHandle?: (progress: number) => void,
) {
  const { filePath, ...rest } = params;
  if (rest.categoryId === 0) {
    delete rest.categoryId;
  }
  return uploadFile<PhotoDto>({
    url: "/photos",
    filePath,
    formData: rest,
    onProgress: processHandle,
  });
}
