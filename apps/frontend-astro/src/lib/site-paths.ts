const SITE_PREFIX = '/retire';
export const SITE_ORIGIN = 'https://yuanbo.online';

export function sitePath(path: `/${string}`) {
  return import.meta.env.DEV ? path : `${SITE_PREFIX}${path}`;
}

export function siteUrl(path: `/${string}`) {
  return `${SITE_ORIGIN}${SITE_PREFIX}${path}`;
}
