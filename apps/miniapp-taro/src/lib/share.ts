import { useShareAppMessage, useShareTimeline } from "@tarojs/taro";
import { isBoSheng } from "./bosheng";

export function useShare(params: {
  title: string;
  path: string;
  imageUrl: string;
}) {
  const title = isBoSheng()
    ? "博生日五群！博生日五群！！博生日五群！！！"
    : params.title;
  useShareAppMessage(() => {
    return { ...params, title };
  });
  useShareTimeline(() => {
    return { ...params, title };
  });
}
