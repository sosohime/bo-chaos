import { useEffect, useRef, useState } from "react";
import Taro from "@tarojs/taro";
import type { CategorySystem, PhotoDto } from "@mono/types";
import { getPhotoBySystem } from "@/api/photo";
import {
  emptyPhotoColumns,
  PHOTO_PAGE_SIZE,
  previewPhotos,
  type PhotoCard,
} from "./photo-list";

const ESTIMATED_RATIOS = [1.08, 1.2, 0.92, 1.36, 1];

function getEstimatedHeight(photo: PhotoDto, columnWidth: number) {
  const ratio = ESTIMATED_RATIOS[Math.abs(photo.id) % ESTIMATED_RATIOS.length];
  return Math.round(columnWidth * ratio);
}

export function useWaterfallPhotos(system: CategorySystem, columnCount = 3) {
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [columns, setColumns] = useState<PhotoCard[][]>(
    emptyPhotoColumns(columnCount),
  );
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const columnHeights = useRef<number[]>(Array(columnCount).fill(0));
  const columnWidth = Taro.getSystemInfoSync().windowWidth / columnCount;

  const resetColumns = () => {
    columnHeights.current = Array(columnCount).fill(0);
    setColumns(emptyPhotoColumns(columnCount));
  };

  const appendPhotos = (nextPhotos: PhotoDto[], reset = false) => {
    setColumns((current) => {
      const next = (reset ? emptyPhotoColumns(columnCount) : current).map(
        (column) => [...column],
      );
      nextPhotos.forEach((photo) => {
        const photoHeight = getEstimatedHeight(photo, columnWidth);
        const targetColumn = columnHeights.current.indexOf(
          Math.min(...columnHeights.current),
        );
        columnHeights.current[targetColumn] += photoHeight;
        next[targetColumn].push({ ...photo, calculatedHeight: photoHeight });
      });
      return next;
    });
  };

  const fetchPage = async (nextPage: number, reset = false) => {
    if (!reset && (loading || !hasMore)) return;
    setLoading(true);
    setError(false);
    if (reset) {
      resetColumns();
    }
    try {
      const res = await getPhotoBySystem(system, {
        page: nextPage,
        pageSize: PHOTO_PAGE_SIZE,
      });
      setPhotos((current) => (reset ? res.data : [...current, ...res.data]));
      setPage(res.meta.page);
      setHasMore(res.meta.hasMore);
      appendPhotos(res.data, reset);
    } catch (requestError) {
      setError(true);
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPhotos([]);
    setPage(0);
    setHasMore(true);
    resetColumns();
    fetchPage(1, true).catch(() => {
      Taro.showToast({ title: "加载失败", icon: "error" });
    });
  }, [system]);

  const refresh = async () => {
    try {
      setRefreshing(true);
      Taro.showNavigationBarLoading();
      await fetchPage(1, true);
      Taro.showToast({ title: "刷新成功", icon: "success" });
    } catch {
      Taro.showToast({ title: "刷新失败", icon: "error" });
    } finally {
      Taro.hideNavigationBarLoading();
      setRefreshing(false);
    }
  };

  return {
    photos,
    columns,
    loading,
    error,
    hasMore,
    refreshing,
    refresh,
    loadMore: () => fetchPage(page + 1),
    previewPhotos,
  };
}
