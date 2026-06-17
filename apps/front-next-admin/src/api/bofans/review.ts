import { apiFetch } from "@/lib/api-client";
import type {
  PageMeta,
  ReviewPhotoDecision,
  ReviewPhotoDto,
} from "@mono/types";

export interface PagedPhotos {
  items: ReviewPhotoDto[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export async function getReviewList(params?: {
  page?: number;
  pageSize?: number;
}): Promise<PagedPhotos> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const response = await apiFetch<ReviewPhotoDto[]>(
    `/admin/photos/reviews${query.toString() ? `?${query.toString()}` : ""}`,
  );
  const meta = response.meta as unknown as PageMeta | undefined;
  return {
    items: response.data || [],
    page: meta?.page || 1,
    pageSize: meta?.pageSize || params?.pageSize || 24,
    total: meta?.total || 0,
    hasMore: meta?.hasMore || false,
  };
}

export async function batchReviewPass(
  photos: { id: number; categoryId: number }[],
): Promise<void> {
  const decisions: ReviewPhotoDecision[] = photos.map((photo) => ({
    ...photo,
    status: "passed",
  }));
  await apiFetch("/admin/photos/reviews", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photos: decisions }),
  });
}

export async function batchReviewReject(ids: number[]): Promise<void> {
  const photos: ReviewPhotoDecision[] = ids.map((id) => ({
    id,
    status: "rejected",
  }));
  await apiFetch("/admin/photos/reviews", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ photos }),
  });
}
