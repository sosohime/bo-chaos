const LEGACY_STATIC_HOSTS = [
  "https://zhangyiming.online/bofans_static/",
  "http://zhangyiming.online/bofans_static/",
];

const CURRENT_STATIC_HOST = "https://yuanbo.online/bofans_static/";

export function normalizeMediaUrl(url?: string | null): string {
  if (!url) return "";
  const legacy = LEGACY_STATIC_HOSTS.find((host) => url.startsWith(host));
  return legacy ? `${CURRENT_STATIC_HOST}${url.slice(legacy.length)}` : url;
}

export function normalizeMediaUrls(urls: (string | null | undefined)[]) {
  return urls.map((url) => normalizeMediaUrl(url)).filter(Boolean);
}
