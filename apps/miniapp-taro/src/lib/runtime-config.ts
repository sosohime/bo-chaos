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
    disabledMessage: "相册和上传入口当前已隐藏，仍可查看退休进度和互动状态。",
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
    reviewKowtowTitle: "BoFans资料区状态",
    uploadTitle: "资料上传",
    reviewUploadTitle: "图片上传",
    photoTitles: {
      history: "历史图片",
      travel: "旅行图片",
      tease: "趣味图片",
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
