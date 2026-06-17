import type {
  BofansMiniappRuntimeConfig,
  BofansMiniappTabKey,
  BofansSystemConfigType,
  CategorySystem,
} from "@mono/types";

export const DEFAULT_MINIAPP_CONFIG: Required<BofansMiniappRuntimeConfig> = {
  ugc: {
    enabled: true,
    disabledTitle: "内容维护中",
    disabledMessage: "资料区正在整理，先去看看退休进度和今日状态。",
  },
  tabs: {
    retire: { visible: true, text: "退休" },
    kowtow: { visible: true, text: "磕袁" },
    history: { visible: true, text: "博史" },
    travel: { visible: true, text: "旅行" },
    my: { visible: true, text: "我的" },
  },
  pages: {
    kowtowTitle: "磕袁",
    reviewKowtowTitle: "博Fans图片压缩工具简介",
    uploadTitle: "珍贵资料上传",
    reviewUploadTitle: "图片上传",
    photoTitles: {
      history: "历史类图片",
      travel: "旅行类图片",
      tease: "搞笑类图片",
    },
  },
};

export const DEFAULT_SYSTEM_CONFIG: BofansSystemConfigType = {
  inReview: false,
  miniapp: DEFAULT_MINIAPP_CONFIG,
};

export function getMiniappConfig(systemConfig?: BofansSystemConfigType) {
  const miniapp = systemConfig?.miniapp || {};
  return {
    ...DEFAULT_MINIAPP_CONFIG,
    ...miniapp,
    ugc: {
      ...DEFAULT_MINIAPP_CONFIG.ugc,
      ...miniapp.ugc,
    },
    tabs: {
      ...DEFAULT_MINIAPP_CONFIG.tabs,
      ...miniapp.tabs,
    } as Required<
      Record<BofansMiniappTabKey, { visible?: boolean; text?: string }>
    >,
    pages: {
      ...DEFAULT_MINIAPP_CONFIG.pages,
      ...miniapp.pages,
      photoTitles: {
        ...DEFAULT_MINIAPP_CONFIG.pages.photoTitles,
        ...miniapp.pages?.photoTitles,
      } as Required<Record<CategorySystem, string>>,
    },
  };
}

export function isUgcEnabled(systemConfig?: BofansSystemConfigType) {
  return getMiniappConfig(systemConfig).ugc.enabled !== false;
}

export function normalizeSystemConfig(
  systemConfig?: BofansSystemConfigType,
): BofansSystemConfigType {
  return {
    ...DEFAULT_SYSTEM_CONFIG,
    ...systemConfig,
    miniapp: getMiniappConfig(systemConfig),
  };
}
