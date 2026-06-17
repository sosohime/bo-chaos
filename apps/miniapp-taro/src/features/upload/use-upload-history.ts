import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import type { PhotoDto, UploadedPhotoStatusFilter } from "@mono/types";
import { getMyUploadedPhotos } from "@/api/photo";

export type UploadHistoryState = {
  items: PhotoDto[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: boolean;
  total: number;
};

const HISTORY_PAGE_SIZE = 18;

const initialState: UploadHistoryState = {
  items: [],
  page: 0,
  hasMore: true,
  loading: false,
  refreshing: false,
  error: false,
  total: 0,
};

export function useUploadHistory(
  status: UploadedPhotoStatusFilter,
  enabled = true,
) {
  const [state, setState] = useState<UploadHistoryState>(initialState);

  const fetchPage = async (nextPage: number, reset = false) => {
    if (!enabled) return;
    if (!reset && (state.loading || !state.hasMore)) return;
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const res = await getMyUploadedPhotos({
        status,
        page: nextPage,
        pageSize: HISTORY_PAGE_SIZE,
      });
      setState((current) => ({
        items: reset ? res.data : [...current.items, ...res.data],
        page: res.meta.page,
        total: res.meta.total,
        hasMore: res.meta.hasMore,
        loading: false,
        refreshing: false,
        error: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: true,
      }));
      throw error;
    }
  };

  useEffect(() => {
    setState(initialState);
    if (!enabled) return;
    fetchPage(1, true).catch(() => {
      Taro.showToast({ title: "加载失败", icon: "none" });
    });
  }, [status, enabled]);

  const refresh = async () => {
    setState((current) => ({ ...current, refreshing: true }));
    if (!enabled) {
      setState((current) => ({ ...current, refreshing: false }));
      return;
    }
    await fetchPage(1, true);
  };

  return {
    ...state,
    refresh,
    loadMore: () => fetchPage(state.page + 1),
  };
}
