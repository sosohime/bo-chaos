import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import type { CategorySystem, PhotoDto } from "@mono/types";
import { getPhotoBySystem } from "@/api/photo";
import {
  groupPhotosByCategory,
  PHOTO_PAGE_SIZE,
  previewPhotos,
  type PhotoGroup,
} from "./photo-list";

export function useSystemPhotoGroups(system: CategorySystem) {
  const [photos, setPhotos] = useState<PhotoDto[]>([]);
  const [groups, setGroups] = useState<PhotoGroup[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [userTouchedCategory, setUserTouchedCategory] = useState(false);

  const applyPhotos = (nextPhotos: PhotoDto[]) => {
    setPhotos(nextPhotos);
    const nextGroups = groupPhotosByCategory(nextPhotos);
    setGroups(nextGroups);
    setActiveCategory((current) =>
      userTouchedCategory
        ? current
        : current || nextGroups[0]?.categoryName || "",
    );
  };

  const fetchPage = async (nextPage: number, reset = false) => {
    if (!reset && (loading || !hasMore)) return;
    setLoading(true);
    setError(false);
    try {
      const res = await getPhotoBySystem(system, {
        page: nextPage,
        pageSize: PHOTO_PAGE_SIZE,
      });
      const nextPhotos = reset ? res.data : [...photos, ...res.data];
      applyPhotos(nextPhotos);
      setPage(res.meta.page);
      setHasMore(res.meta.hasMore);
    } catch (requestError) {
      setError(true);
      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPhotos([]);
    setGroups([]);
    setPage(0);
    setHasMore(true);
    setActiveCategory("");
    setUserTouchedCategory(false);
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

  const toggleCategory = (category: string) => {
    setUserTouchedCategory(true);
    setActiveCategory((current) => (current === category ? "" : category));
  };

  return {
    groups,
    activeCategory,
    loading,
    error,
    hasMore,
    refreshing,
    refresh,
    loadMore: () => fetchPage(page + 1),
    toggleCategory,
    previewPhotos,
  };
}
