import Taro from "@tarojs/taro";
import type { PhotoDto } from "@mono/types";
import { normalizeMediaUrl, normalizeMediaUrls } from "@/lib/media-url";

export const PHOTO_PAGE_SIZE = 24;

export type PhotoCard = PhotoDto & {
  calculatedHeight?: number;
};

export type PhotoGroup = {
  categoryName: string;
  photos: PhotoDto[];
};

export function groupPhotosByCategory(photos: PhotoDto[]): PhotoGroup[] {
  const groups = new Map<string, PhotoDto[]>();
  photos.forEach((photo) => {
    const categoryName = photo.category?.name || "未分类";
    groups.set(categoryName, [...(groups.get(categoryName) || []), photo]);
  });
  return Array.from(groups.entries()).map(([categoryName, items]) => ({
    categoryName,
    photos: items,
  }));
}

export function previewPhotos(
  current: string,
  photos: Pick<PhotoDto, "filename">[],
) {
  const urls = normalizeMediaUrls(photos.map((photo) => photo.filename));
  Taro.previewImage({
    current: normalizeMediaUrl(current),
    urls,
  });
}

export function emptyPhotoColumns(count: number): PhotoCard[][] {
  return Array.from({ length: count }, () => []);
}
