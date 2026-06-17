import { Controller, Get, HttpCode } from '@nestjs/common';
import {
  BofansMiniappRuntimeConfig,
  BofansSystemConfigType,
} from '@mono/types';
import { env } from '@/const/env';
import { ok } from '@/common/api-response';

const defaultMiniappConfig: BofansMiniappRuntimeConfig = {
  ugc: {
    enabled: true,
    disabledTitle: '内容维护中',
    disabledMessage: '资料区正在整理，先去看看退休进度和今日状态。',
  },
  tabs: {
    retire: { visible: true, text: '退' },
    kowtow: { visible: true, text: '磕' },
    history: { visible: true, text: '史' },
    travel: { visible: true, text: '游' },
    my: { visible: true, text: '我' },
  },
  pages: {
    kowtowTitle: '磕袁',
    reviewKowtowTitle: '博Fans图片压缩工具简介',
    uploadTitle: '珍贵资料上传',
    reviewUploadTitle: '图片上传',
    photoTitles: {
      history: '历史类图片',
      travel: '旅行类图片',
      tease: '搞笑类图片',
    },
  },
};

function mergeMiniappConfig(
  base: BofansMiniappRuntimeConfig,
  override?: BofansMiniappRuntimeConfig,
): BofansMiniappRuntimeConfig {
  if (!override) return base;
  return {
    ...base,
    ...override,
    ugc: {
      ...base.ugc,
      ...override.ugc,
    },
    tabs: {
      ...base.tabs,
      ...override.tabs,
    },
    pages: {
      ...base.pages,
      ...override.pages,
      photoTitles: {
        ...base.pages?.photoTitles,
        ...override.pages?.photoTitles,
      },
    },
  };
}

function readRuntimeConfigOverride(): BofansMiniappRuntimeConfig | undefined {
  if (!env.BOFANS_WEAPP_RUNTIME_CONFIG) return undefined;
  try {
    return JSON.parse(env.BOFANS_WEAPP_RUNTIME_CONFIG);
  } catch {
    return undefined;
  }
}

@Controller('bofans/global')
export class GlobalController {
  constructor() {}

  @HttpCode(200)
  @Get('systemConfig')
  systemConfig() {
    return ok<BofansSystemConfigType>({
      inReview: env.BOFANS_WEAPP_PUBLISH_STATUS === 'in_review',
      miniapp: mergeMiniappConfig(
        defaultMiniappConfig,
        readRuntimeConfigOverride(),
      ),
    });
  }
}
